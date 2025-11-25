import { Controller, Get, Post, Body, Param, Sse, MessageEvent } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { AvailabilityService } from 'src/availability/availability.service';
import { CreateAvailabilityDto } from 'src/availability/dto/create-availability.dto';
import { Observable, fromEvent } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebhookService } from 'src/webhook/webhook.service';

@Controller('planning')
export class PlanningController {
  constructor(
    private readonly planningService: PlanningService,
    private readonly availabilityService: AvailabilityService,
    private readonly webhookService: WebhookService,
    private readonly eventEmitter: EventEmitter2
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
  async createAvailability(@Param('id') id: string, @Body() createAvailabilityDto: CreateAvailabilityDto) {
    await this.availabilityService.create(id, createAvailabilityDto);
    this.eventEmitter.emit('availability-create')
  }

  @Get(":id/availability")
  findAvailability(@Param('id') id: string) {
    return this.availabilityService.findAvailabilityByPlanning(id);
  }

  @Sse(":id/sse")
  sendAvailablities(@Param('id') id: string): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'availability-create').pipe(
      switchMap(async () => {
        const availability = await this.availabilityService.findAvailabilityByPlanning(id)
        const planning = await this.planningService.findOne(id)
        if(planning?.webhook)
          this.webhookService.sendWebhook(planning, availability) 
        return { data: availability} as MessageEvent
      })
    )
  }
}
