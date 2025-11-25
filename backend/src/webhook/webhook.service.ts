import { Injectable } from '@nestjs/common';
import { Availability } from 'src/availability/entities/availability.entity';
import { Planning } from 'src/planning/entities/planning.entity';
import dayjs from 'dayjs';

@Injectable()
export class WebhookService {

  sendWebhook(planning: Planning, availabilities: Availability[]) {
    const maxAvailability = this.getMaxAvailability(planning, availabilities)

    let daysText = ""
    for(const day of maxAvailability.days){
      if(!day.times.length) continue;
      daysText += `- ${day.day}: ${day.times.map(time=>this.getTimeRangeString(time)).join('\n- ')}\n`
    }

    fetch(planning.webhook, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `[Voted](${process.env.VITE_FRONTEND_URL}/${planning.id}): ${maxAvailability.voted.join(', ')}\n${daysText}`
      })
    })
  }

  getMaxAvailability(planning: Planning, availabilities: Availability[]) {
    const days: {
      day: string,
      times: {
        startTime: number,
        endTime: number
      }[]
    }[] = []

    const times = availabilities.flatMap(availability=>availability.times)
    const userAmount = availabilities.length
    

    let currentDate = dayjs.unix(planning.startDate)
    const endDate   = dayjs.unix(planning.endDate)

    while(currentDate.isBefore(endDate, 'day') || currentDate.isSame(endDate, 'day')){
      const currentDayTimes = times.filter(time=>currentDate.isSame(dayjs.unix(time.startTime), 'day'))
      const maxAvailabilityTimeBlocks: {
        startTime: number,
        endTime: number
      }[] = []

      const processedTimes: number[] = []
      for(const timeBlock of currentDayTimes){
        const startTime = timeBlock.startTime
      
        if(processedTimes.includes(startTime)) continue;
        processedTimes.push(startTime)
      
        let smallestEndTime = Number.POSITIVE_INFINITY
        const matchingBlocks = currentDayTimes.filter((block)=>{
          smallestEndTime = Math.min(smallestEndTime, block.endTime)
          return startTime >= block.startTime && startTime < block.endTime
        })
      
        if(matchingBlocks.length < userAmount) continue;
      
        maxAvailabilityTimeBlocks.push({
          startTime: startTime,
          endTime: smallestEndTime
        })
      }

      if(maxAvailabilityTimeBlocks.length)
        days.push({
          day: currentDate.format('ddd'),
          times: maxAvailabilityTimeBlocks
        })
        
      currentDate = currentDate.add(1, 'day')
    }

    return {
      url: `${process.env.VITE_FRONTEND_URL}/${planning.id}`,
      voted: availabilities.map(availability=>availability.name),
      days: days
    }
  }

  getTimeRangeString(timeRange: {startTime: number, endTime: number}){
    return `<t:${timeRange.startTime}:t> - <t:${timeRange.endTime}:t>`
  }
}
