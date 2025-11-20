import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdatePlanningDto } from './dto/update-planning.dto';
import { AvailabilityService } from 'src/availability/availability.service';
import { CreateAvailabilityDto } from 'src/availability/dto/create-availability.dto';

@Controller('planning')
export class PlanningController {
  constructor(
    private readonly planningService: PlanningService,
    private readonly availabilityService: AvailabilityService
  ) {}

  @Post("create")
  create(@Body() createPlanningDto: CreatePlanningDto) {
    return this.planningService.create(createPlanningDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planningService.findOne(id);
  }

  @Post(":id/availability/create")
  createAvailability(@Param('id') id: string, @Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilityService.create(id, createAvailabilityDto);
  }
  @Get(":id/availability")
  findAvailability(@Param('id') id: string) {
    return this.availabilityService.findAvailabilityByPlanning(id);
  }
}
