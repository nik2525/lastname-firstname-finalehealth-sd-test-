import { IsString, IsDateString, IsNotEmpty, IsEnum, IsOptional } from "class-validator"
import { VisitType } from "../schemas/visit.schema"

export class CreateVisitDto {
  @IsDateString()
  @IsNotEmpty()
  visitDate: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsEnum(VisitType)
  @IsNotEmpty()
  visitType: VisitType
}
