import { IsOptional, IsString, IsNumber, Min, IsEnum } from "class-validator"
import { Transform } from "class-transformer"
import { VisitType } from "../schemas/visit.schema"

export class VisitQueryDto {
  @IsOptional()
  @IsString()
  patientId?: string

  @IsOptional()
  @IsEnum(VisitType)
  visitType?: VisitType

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10

  @IsOptional()
  @IsString()
  sortBy?: string = "visitDate"

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc"
}
