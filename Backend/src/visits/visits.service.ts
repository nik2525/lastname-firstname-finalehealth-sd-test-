import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Visit } from "./schemas/visit.schema"
import type { VisitDocument } from "./schemas/visit.schema"
import type { CreateVisitDto } from "./dto/create-visit.dto"
import type { UpdateVisitDto } from "./dto/update-visit.dto"
import type { VisitQueryDto } from "./dto/visit-query.dto"
import { PatientsService } from "../patients/patients.service"

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private visitModel: Model<VisitDocument>,
    private patientsService: PatientsService
  ) {}

  async create(patientId: string, createVisitDto: CreateVisitDto): Promise<Visit> {
    // Verify patient exists
    await this.patientsService.findOne(patientId)

    const createdVisit = new this.visitModel({
      ...createVisitDto,
      patientId,
      visitDate: new Date(createVisitDto.visitDate)
    })
    return await createdVisit.save()
  }

  async findAll(query: VisitQueryDto) {
    const { patientId, visitType, page = 1, limit = 10, sortBy = "visitDate", sortOrder = "desc" } = query
    const skip = (page - 1) * limit

    // Build filter
    const filter: any = {}
    if (patientId) {
      filter.patientId = patientId
    }
    if (visitType) {
      filter.visitType = visitType
    }

    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const [data, total] = await Promise.all([
      this.visitModel
        .find(filter)
        .populate("patientId", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.visitModel.countDocuments(filter).exec(),
    ])

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findByPatient(patientId: string): Promise<Visit[]> {
    // Verify patient exists
    await this.patientsService.findOne(patientId)

    return await this.visitModel.find({ patientId }).sort({ visitDate: -1 }).exec()
  }

  async findOne(id: string): Promise<Visit> {
    const visit = await this.visitModel.findById(id).populate("patientId", "firstName lastName email").exec()

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`)
    }

    return visit
  }

  async update(id: string, updateVisitDto: UpdateVisitDto): Promise<Visit> {
    // Create a copy of the update data
    const updateData = { ...updateVisitDto };
    
    // Convert visitDate to ISO string if it exists
    if (updateData.visitDate) {
      const date = new Date(updateData.visitDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format for visitDate');
      }
      updateData.visitDate = date.toISOString();
    }

    const updatedVisit = await this.visitModel
      .findByIdAndUpdate(id, updateData, { 
        new: true,
        runValidators: true // Ensure validations are run on update
      })
      .populate("patientId", "firstName lastName email")
      .exec()

    if (!updatedVisit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return updatedVisit;
  }

  async remove(id: string): Promise<void> {
    const result = await this.visitModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException(`Visit with ID ${id} not found`)
    }
  }

  async getVisitStats(patientId: string) {
    // Verify patient exists
    await this.patientsService.findOne(patientId)

    const visits = await this.visitModel.find({ patientId }).exec()

    const visitsByType = visits.reduce((acc, visit) => {
      acc[visit.visitType] = (acc[visit.visitType] || 0) + 1
      return acc
    }, {})

    return {
      totalVisits: visits.length,
      visitsByType,
      recentVisits: visits
        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
        .slice(0, 5),
    }
  }
}
