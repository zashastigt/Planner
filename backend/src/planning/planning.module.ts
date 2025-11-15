import { Module } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planning } from './entities/planning.entity';
import { Availability } from 'src/availability/entities/availability.entity';
import { AvailabilityService } from 'src/availability/availability.service';
import { Time } from 'src/time/entities/time.entity';
import { TimeService } from 'src/time/time.service';

@Module({
  imports: [TypeOrmModule.forFeature([Planning, Availability, Time])],
  controllers: [PlanningController],
  providers: [PlanningService, AvailabilityService, TimeService],
})
export class PlanningModule {}