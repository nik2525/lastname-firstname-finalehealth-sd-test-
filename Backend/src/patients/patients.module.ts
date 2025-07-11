import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { PatientsService } from "./patients.service"
import { PatientsController } from "./patients.controller"
import { Patient, PatientSchema } from "./schemas/patient.schema"
import { Visit, VisitSchema } from "../visits/schemas/visit.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Visit.name, schema: VisitSchema }
    ])
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
