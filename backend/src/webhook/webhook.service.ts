import { Injectable } from '@nestjs/common';
import { Availability } from 'src/availability/entities/availability.entity';
import { Planning } from 'src/planning/entities/planning.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone)

@Injectable()
export class WebhookService {

  sendWebhook(planning: Planning, availabilities: Availability[]) {
    const maxAvailability = this.getMaxAvailability(planning, availabilities)
    let bodyText = ""

    for (const timezone of maxAvailability.timezones) {
      const operator = timezone.utcOffset > 0 ? '+' : ''
      bodyText += `## UTC ${operator}${timezone.utcOffset} | ${(timezone.people as string[]).join(',  ')}\n`

      maxAvailability.days = this.mergeTimes(maxAvailability.days).filter(day => day.times.length > 0)
      bodyText += "```ansi\n"
      for(const day of maxAvailability.days){
        const utcDay = dayjs.unix(day.times[0].startTime).utcOffset(timezone.utcOffset)

        bodyText += `\u001b[1;37m${utcDay.format('D')} ${utcDay.format('ddd')}:\u001b[0;36m ${day.times.map(time=>this.getTimeRangeString(time, timezone.utcOffset)).join(' \u001b[0;30m|\u001b[0;36m ')}\n`
      }
      bodyText += "```\n"
    }
    if (maxAvailability.days.length === 0) bodyText = "No availabilities";

    fetch(planning.webhook, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `# [Current planning](${process.env.VITE_FRONTEND_URL}${planning.id}) voted: ${availabilities.length}\n${bodyText}`
      })
    })
  }

  getMaxAvailability(planning: Planning, availabilities: Availability[]) {
    const days: {
      times: {
        startTime: number,
        endTime: number
      }[]
    }[] = []
    const times = availabilities.flatMap(availability=>availability.times)
    const userAmount = availabilities.length
    

    let currentDate = dayjs.unix(planning.startDate)
    const endDate   = dayjs.unix(planning.endDate)
    
    const timezones = Object.entries(availabilities.reduce((a, { timezone, name }) => 
      ((a[timezone] ||= [])
      .push(name), a), {}))
      .map(([tz, people]) => ({ utcOffset: currentDate.tz(tz).utcOffset() / 60, people }))
      .sort((a, b) => a.utcOffset - b.utcOffset);
  
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
          const blockMatches = startTime >= block.startTime && startTime < block.endTime 
          if(blockMatches) smallestEndTime = Math.min(smallestEndTime, block.endTime)
          return blockMatches
        })
      
        if(matchingBlocks.length < userAmount) continue;
      
        maxAvailabilityTimeBlocks.push({
          startTime: startTime,
          endTime: smallestEndTime
        })
      }

      if(maxAvailabilityTimeBlocks.length)
        days.push({
          times: maxAvailabilityTimeBlocks
        })
        
      currentDate = currentDate.add(1, 'day')
    }

    return {
      url: `${process.env.VITE_FRONTEND_URL}/${planning.id}`,
      timezones: timezones,
      days: days,
    }
  }

  getTimeRangeString(timeRange: {startTime: number, endTime: number}, utcOffset: number){
    const start = dayjs.unix(timeRange.startTime).utcOffset(utcOffset).format("HH:mm")
    const end = dayjs.unix(timeRange.endTime).utcOffset(utcOffset).format("HH:mm")

    return `${start} - ${end}`
  }

  mergeTimes(days: {times: {startTime: number; endTime: number; }[];}[]) {
    let last =  {
      startTime: 0,
      endTime: 0
    } 

    for(const day of days){
      if(!day.times.length) continue;
      day.times.sort((a, b) => a.startTime - b.startTime)

      if (last && last.endTime == day.times[0].startTime){
        day.times[0].startTime = last.startTime

        const prevDay = days[days.indexOf(day) - 1]
        if (prevDay) prevDay.times.pop()
      }

      last = day.times[day.times.length - 1]
    }
    return days;
  }
}
