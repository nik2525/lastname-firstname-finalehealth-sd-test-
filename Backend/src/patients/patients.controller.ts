import { Controller, Get, Post, Body, Put, Param, Delete, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe } from "@nestjs/common"
import { CreatePatientDto } from "./dto/create-patient.dto"
import { UpdatePatientDto } from "./dto/update-patient.dto"
import { PatientQueryDto } from "./dto/patient-query.dto"
import { PatientsService } from "./patients.service";

@Controller('patients')
@UsePipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  transformOptions: { enableImplicitConversion: true },
}))
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatientDto: CreatePatientDto) {
    try {
      return await this.patientsService.create(createPatientDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  findAll(@Query() query: PatientQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(":id")
  update(
    @Param('id') id: string, 
    @Body() updatePatientDto: UpdatePatientDto
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.patientsService.remove(id);
    return { message: 'Patient Deleted' };
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.patientsService.getPatientStats(id);
  }
}
