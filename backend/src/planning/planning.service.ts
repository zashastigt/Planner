import { Injectable } from '@nestjs/common';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { UpdatePlanningDto } from './dto/update-planning.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Planning } from './entities/planning.entity';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid'

@Injectable()
export class PlanningService {

  constructor(
    @InjectRepository(Planning)
    private planningRepo: Repository<Planning>,
  ){}

  create(createPlanningDto: CreatePlanningDto) {
    createPlanningDto.id = nanoid(15)
    return this.planningRepo.save(this.planningRepo.create(createPlanningDto))
  }

  findAll() {
    return this.planningRepo.find()
  }

  findOne(id: string) {
    return this.planningRepo.findOneBy({ id })
  }

  update(id: string, updatePlanningDto: UpdatePlanningDto) {
    return `This action updates a #${id} planning`;
  }

  remove(id: string) {
    return `This action removes a #${id} planning`;
  }
}
