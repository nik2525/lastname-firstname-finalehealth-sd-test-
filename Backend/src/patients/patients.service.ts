import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Patient } from "./schemas/patient.schema"
import { Visit } from "../visits/schemas/visit.schema"
import type { PatientDocument } from "./schemas/patient.schema"
import type { VisitDocument } from "../visits/schemas/visit.schema"
import type { CreatePatientDto } from "./dto/create-patient.dto"
import type { UpdatePatientDto } from "./dto/update-patient.dto"
import type { PatientQueryDto } from "./dto/patient-query.dto"

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
    @InjectModel(Visit.name) private visitModel: Model<VisitDocument>
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      const createdPatient = new this.patientModel(createPatientDto)
      return await createdPatient.save()
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException("Email already exists")
      }
      throw error
    }
  }

  async findAll(query: PatientQueryDto) {
    const { search, page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    // Build search filter
    const filter: any = {}
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const [data, total] = await Promise.all([
      this.patientModel.find(filter).sort({ dateCreated: -1 }).skip(skip).limit(limit).exec(),
      this.patientModel.countDocuments(filter).exec(),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id).exec()
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`)
    }
    return patient
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    try {
      const updatedPatient = await this.patientModel.findByIdAndUpdate(id, updatePatientDto, { new: true }).exec()

      if (!updatedPatient) {
        throw new NotFoundException(`Patient with ID ${id} not found`)
      }

      return updatedPatient
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException("Email already exists")
      }
      throw error
    }
  }

  async remove(id: string): Promise<void> {
    // First, verify the patient exists
    const patient = await this.patientModel.findById(id).exec();
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Use a transaction to ensure data consistency
    const session = await this.patientModel.db.startSession();
    session.startTransaction();

    try {
      // Delete all visits associated with this patient
      await this.visitModel.deleteMany({ patientId: id }).session(session);
      
      // Delete the patient
      await this.patientModel.findByIdAndDelete(id).session(session);
      
      // Commit the transaction
      await session.commitTransaction();
    } catch (error) {
      // If anything goes wrong, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }

  async getPatientStats(id: string) {
    const patient = await this.findOne(id)

    // This would typically involve aggregating visit data
    // For now, returning basic patient info
    return {
      patient,
      totalVisits: 0,
      visitsByType: {
        Home: 0,
        Telehealth: 0,
        Clinic: 0,
      },
    }
  }
}
