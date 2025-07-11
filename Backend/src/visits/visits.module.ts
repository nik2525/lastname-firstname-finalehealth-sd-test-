import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { VisitsService } from "./visits.service"
import { VisitsController } from "./visits.controller"
import { Visit, VisitSchema } from "./schemas/visit.schema"
import { PatientsModule } from "../patients/patients.module"

@Module({
  imports: [MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }]), PatientsModule],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
