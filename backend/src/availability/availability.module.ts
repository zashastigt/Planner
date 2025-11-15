import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { TimeService } from 'src/time/time.service';
import { Time } from 'src/time/entities/time.entity';
import { Planning } from 'src/planning/entities/planning.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Time, Planning])],
  providers: [AvailabilityService, TimeService],
})
export class AvailabilityModule {}
