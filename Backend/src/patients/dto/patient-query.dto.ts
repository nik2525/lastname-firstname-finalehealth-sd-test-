import { IsOptional, IsString, IsNumber, Min } from "class-validator"
import { Transform } from "class-transformer"

export class PatientQueryDto {
  @IsOptional()
  @IsString()
  search?: string

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
}
