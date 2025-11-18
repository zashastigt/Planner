import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
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
    
    if(availability) this.availabilityRepo.delete({planning, name: createAvailabilityDto.name})
    availability = await this.availabilityRepo.save(this.availabilityRepo.create(createAvailabilityDto))

    for(const time of createAvailabilityDto.times){
      this.timeService.create(availability, time)
    }
  }

  findAll() {
    return this.availabilityRepo.find()
  }

  update(id: string, updateAvailabilityDto: UpdateAvailabilityDto) {
    return `This action updates a #${id} planning`;
  }

  remove(id: string) {
    return `This action removes a #${id} planning`;
  }

  findAvailabilityByPlanning(id: string){
    return this.availabilityRepo.findBy({ planning: {id}})
  }
}
