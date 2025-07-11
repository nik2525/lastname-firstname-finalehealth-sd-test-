import { Controller, Get, Post, Body, Put, Param, Delete, Query, HttpCode, HttpStatus } from "@nestjs/common"
import { VisitsService } from "./visits.service"
import { CreateVisitDto } from "./dto/create-visit.dto"
import { UpdateVisitDto } from "./dto/update-visit.dto"
import { VisitQueryDto } from "./dto/visit-query.dto"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"

@Controller()
@ApiTags('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get('patients/:id/visits')
  @ApiOperation({ summary: 'Get all visits for a patient' })
  @ApiResponse({ status: 200, description: 'List of visits for the patient' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async findByPatient(@Param('id') patientId: string) {
    return this.visitsService.findByPatient(patientId);
  }

  @Post('patients/:id/visits')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new visit for a patient' })
  @ApiResponse({ status: 201, description: 'Visit created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async create(
    @Param('id') patientId: string, 
    @Body() createVisitDto: CreateVisitDto
  ) {
    return this.visitsService.create(patientId, createVisitDto);
  }

  @Get('visits')
  @ApiOperation({ summary: 'Get all visits with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of all visits' })
  async findAll(@Query() query: VisitQueryDto) {
    return this.visitsService.findAll(query);
  }

  @Get('visits/:id')
  @ApiOperation({ summary: 'Get a specific visit by ID' })
  @ApiResponse({ status: 200, description: 'Visit details' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async findOne(@Param('id') id: string) {
    return this.visitsService.findOne(id);
  }

  @Put('visits/:id')
  @ApiOperation({ summary: 'Update a visit' })
  @ApiResponse({ status: 200, description: 'Visit updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateVisitDto: UpdateVisitDto
  ) {
    return this.visitsService.update(id, updateVisitDto);
  }

  @Delete('visits/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a visit' })
  @ApiResponse({ status: 200, description: 'Visit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async remove(@Param('id') id: string) {
    await this.visitsService.remove(id);
    return { message: 'Visit deleted successfully' };
  }

  @Get('patients/:id/visits/stats')
  @ApiOperation({ summary: 'Get visit statistics for a patient' })
  @ApiResponse({ status: 200, description: 'Visit statistics' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getVisitStats(@Param('id') patientId: string) {
    return this.visitsService.getVisitStats(patientId);
  }
}
