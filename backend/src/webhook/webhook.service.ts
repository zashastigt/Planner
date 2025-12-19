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
      bodyText += `## UTC ${operator}${timezone.utcOffset} | ${(timezone.voters as string[]).join(',  ')}\n`

      bodyText += "```ansi\n"
      let prefDateNumber;
      let lastTime = "";
      for(const day of maxAvailability.days){
        const utcDay = dayjs.unix(day.times[0].startTime).utcOffset(timezone.utcOffset)

        const dateNumber = utcDay.format('DD')
        const spacer = ` \u001b[0;30m|\u001b[0;36m `

        bodyText = this.createBodyText(bodyText, timezone.utcOffset, day, utcDay, dateNumber, prefDateNumber, lastTime, spacer)

        prefDateNumber = dateNumber;
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
        content: `# [Current planning](${process.env.VITE_FRONTEND_URL}/${planning.id}) voted: ${availabilities.length}\n${bodyText}`
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
    
    const startDate = dayjs.unix(planning.startDate)
    const endDate   = dayjs.unix(planning.endDate)
    let currentDate = startDate
    
    const timezones = availabilities.reduce((allTimezones: {utcOffset, voters}[], availability) => {
      const utcOffset = currentDate.tz(availability.timezone).utcOffset() / 60
      const offsetExists = allTimezones.map(offset => offset.utcOffset).indexOf(utcOffset)
      
      if (offsetExists !== -1) {
        allTimezones[offsetExists].voters.push(availability.name)
      }
      else{
        allTimezones.push({
          utcOffset: utcOffset,
          voters: [availability.name]
        })
      }

      return allTimezones
    }, [])
    .sort((a, b) => a.utcOffset - b.utcOffset);
  
    while(currentDate.isBefore(endDate, 'day') || currentDate.isSame(endDate, 'day')){
      const currentDayTimes = times.filter(time => currentDate.isSame(dayjs.unix(time.startTime), 'day') ||
        currentDate.isSame(startDate, 'day') && currentDate.isSame(dayjs.unix(time.endTime), 'day'))
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

  createBodyText(
    bodyText: string,
    utcOffset: number,
    day: {times: {
        startTime: number;
        endTime: number;
    }[]},
    utcDay: dayjs.Dayjs,
    dateNumber: string,
    prefDateNumber: string,
    lastTime: string,
    spacer: string) {
    let dateDay = utcDay.format('ddd')

    if (dateNumber === prefDateNumber) {
      bodyText += `${spacer}${day.times.map(time=>this.getTimeRangeString(time, utcOffset)).join(spacer)}`
    }
    else if (dateNumber > prefDateNumber + 1) {
      lastTime = bodyText.slice(-5)
      bodyText = bodyText.slice(0, -5)

      bodyText += `00:00`
      for (let index = Number(prefDateNumber) + 1; index < Number(dateNumber); index++) { 
        bodyText += `\n`
        bodyText += `\u001b[1;37m${index} ${utcDay.format('ddd')}:\u001b[0;36m All day`
        utcDay = utcDay.add(1, 'day')
      }
      bodyText += `\n`
      lastTime = lastTime ? `00:00 - ${lastTime} | ` : lastTime
      bodyText += `\u001b[1;37m${dateNumber} ${dateDay}:\u001b[0;36m ${lastTime}${day.times.map(time=>this.getTimeRangeString(time, utcOffset)).join(spacer)}`
      lastTime = ""
    }
    else {
      bodyText += `\n`
      bodyText += `\u001b[1;37m${dateNumber} ${dateDay}:\u001b[0;36m ${day.times.map(time=>this.getTimeRangeString(time, utcOffset)).join(spacer)}`
    }
    
    return bodyText
  }

  getTimeRangeString(timeRange: {startTime: number, endTime: number}, utcOffset: number){
    const start = dayjs.unix(timeRange.startTime).utcOffset(utcOffset).format("HH:mm")
    const end = dayjs.unix(timeRange.endTime).utcOffset(utcOffset).format("HH:mm")

    return `${start} - ${end}`
  }
}
