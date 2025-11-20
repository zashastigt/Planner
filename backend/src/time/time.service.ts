import { Injectable } from '@nestjs/common';
import { CreateTimeDto } from './dto/create-time.dto';
import { UpdateTimeDto } from './dto/update-time.dto';
import { Time } from './entities/time.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Availability } from 'src/availability/entities/availability.entity';

@Injectable()
export class TimeService {

  constructor(
    @InjectRepository(Time)
    private timeRepo: Repository<Time>
  ){}

  create(availability: Availability, createTimeDto: CreateTimeDto) {
    createTimeDto.availability = availability
    this.timeRepo.save(this.timeRepo.create(createTimeDto))
  }

  findTimeByAvailability(availability: Availability) {
    return this.timeRepo.find({
      select: {
        startTime: true,
        endTime: true
      },
      where: {
          availability: availability,
      }
    })
  }
}
