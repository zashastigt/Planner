import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { TimeService } from 'src/time/time.service';
import { Planning } from 'src/planning/entities/planning.entity';

@Injectable()
export class AvailabilityService {

  constructor(
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
    @InjectRepository(Planning)
    private planningRepo: Repository<Planning>,
    private timeService: TimeService
  ){}

  async create(planningId: string, createAvailabilityDto: CreateAvailabilityDto) {
    const planning = await this.planningRepo.findOneBy({id: planningId})
    if(!planning) throw new HttpException(`This planning doesn't exist`, HttpStatus.UNPROCESSABLE_ENTITY)

    createAvailabilityDto.planning = planning
    let availability = await this.availabilityRepo.findOneBy({planning, name: createAvailabilityDto.name})
    
    if(availability) await this.availabilityRepo.delete({planning, name: createAvailabilityDto.name})
      availability = await this.availabilityRepo.save(this.availabilityRepo.create(createAvailabilityDto))
      
      for(const time of createAvailabilityDto.times){
        await this.timeService.create(availability, time)
      }
  }

  findAll() {
    return this.availabilityRepo.find()
  }

  async findAvailabilityByPlanning(id: string){
    return await this.availabilityRepo.find({ 
      select: {
        name: true,
        times: {
          startTime: true,
          endTime: true
        },
        timezone: true
      },
      where: {
         planning: { id }
        },
      relations: ['times']
    })
  }

}
