import { Injectable } from '@nestjs/common';
import { Availability } from 'src/availability/entities/availability.entity';
import { Planning } from 'src/planning/entities/planning.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import _ from 'lodash'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)

@Injectable()
export class WebhookService {

  sendWebhook(planning: Planning, availabilities: Availability[]) {
    const maxAvailability = this.getMaxAvailability(planning, availabilities)
    const bodyText = this.createBodyText(maxAvailability.timezones)
    
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

  getTimezones(availabilities: Availability[]) {
      const timezones = availabilities.reduce((allTimezones: {utcOffset: number, voters: string[]}[], availability) => {
      const utcOffset = dayjs().tz(availability.timezone).utcOffset() / 60
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

    return timezones
  }

  getMaxAvailability(planning: Planning, _availabilities: Availability[]) {
    const availabilities = _.cloneDeep(_availabilities)
    const timezones: {
      utcOffset: number,
      voters: string[],
      days: {
        times: {
          startTime: number,
          endTime: number
        }[]
      }[]
    }[] = []

    const times = availabilities.flatMap(availability=>availability.times)
    const userAmount = availabilities.length
    
    const startDate = dayjs.unix(planning.startDate)
    const endDate   = dayjs.unix(planning.endDate)
    
    const sortedTimezones = this.getTimezones(availabilities)
    for (const timezone of sortedTimezones) {
      let currentDate = startDate.utcOffset(timezone.utcOffset)
 
      const days: {
        times: {
          startTime: number,
          endTime: number
        }[]
      }[] = []
      let carryRange: {
        startTime: number,
        endTime: number
      } | null = null
console.log('------------')
      while (currentDate.isBefore(endDate, 'day') || currentDate.isSame(endDate, 'day')) {
        let currentDayTimes = times.filter(time => {
          const startTime = dayjs.unix(time.startTime).utcOffset(timezone.utcOffset)
          const endTime = dayjs.unix(time.endTime).utcOffset(timezone.utcOffset)
          if (Number(currentDate.format('DD'))>= 26) console.log(`${currentDate.format('DD')}   ${currentDate.isSame(endTime, 'day')}`);
          return currentDate.isSame(startTime, 'day') || (currentDate.isSame(endTime, 'day'))
        }) 
        
        currentDayTimes = _.cloneDeep(currentDayTimes)
        currentDayTimes = currentDayTimes.map(time => {
          time.startTime = dayjs.unix(time.startTime).utcOffset(timezone.utcOffset).utcOffset(0, true).unix()
          time.endTime = dayjs.unix(time.endTime).utcOffset(timezone.utcOffset).utcOffset(0, true).unix()
          return time;
        })

        if (carryRange) {
          currentDayTimes.unshift(carryRange)
          carryRange = null;
        }

        const maxAvailabilityRanges: {
          startTime: number,
          endTime: number
        }[] = []

        const processedTimes: number[] = []
        for (const currentRange of currentDayTimes) {
          const startTime = currentRange.startTime

          if (processedTimes.includes(startTime)) continue;
          processedTimes.push(startTime)

          let smallestEndTime = Number.POSITIVE_INFINITY
          const matchingRanges = currentDayTimes.filter((range) => {
            const withinRange = startTime >= range.startTime && startTime < range.endTime
            if (withinRange) smallestEndTime = Math.min(smallestEndTime, range.endTime)
            return withinRange
          })
          //console.log(currentDayTimes)
          //console.log(`${require('util').inspect(timezone, true, 10)}   ${require('util').inspect(matchingRanges, true, 10)}`)
          if (matchingRanges.length < userAmount) continue;

          const endOfDay = dayjs.unix(startTime).endOf('day')
          const startOfNewDay = endOfDay.add(1, 'day').startOf('day')

          if (dayjs.unix(smallestEndTime).isAfter(endOfDay)) {

            carryRange = {
              startTime: startOfNewDay.unix(),
              endTime: smallestEndTime
            }

            smallestEndTime = endOfDay.unix()
          }
          const maxAvailabilityRange = {
            startTime: startTime,
            endTime: smallestEndTime
          }

          maxAvailabilityRanges.push(maxAvailabilityRange)
        }
        
        if(maxAvailabilityRanges.length) {
          days.push({
            times: maxAvailabilityRanges
          })
        }
        currentDate = currentDate.add(1, 'day')
      }
      timezones.push({
        utcOffset: timezone.utcOffset,
        voters: timezone.voters,
        days
      })
    }

    return {
      timezones: timezones,
    }
  }

  readonly ANSI = {
    BOLD_WHITE: '\u001b[1;37m',
    CYAN: '\u001b[0;36m',
    SPACER: ` \u001b[0;30m|\u001b[0;36m `
  };

  createBodyText(timezones) {
    let bodyText = ''

    for (const timezone of timezones) {
      const operator = timezone.utcOffset > 0 ? '+' : ''
      bodyText += `## UTC ${operator}${timezone.utcOffset} | ${(timezone.voters as string[]).join(',  ')}\n`
      bodyText += "```ansi\n"

      for(const day of timezone.days) {
        const timeRanges = day.times.map((time: { startTime: number; endTime: number; }) => this.getTimeRangeString(time))
        const currentDay = dayjs.unix(day.times[0].startTime)

        const dayLabel = currentDay.format('ddd')
        const dayNumber = Number(currentDay.format('DD'))

        bodyText += `\n`
        bodyText += `${this.formatDateHeader(dayLabel, dayNumber)} ${timeRanges.join(this.ANSI.SPACER)}`
      }

      bodyText += "```\n"
    }
    if (timezones[0]?.days.length === 0) bodyText = "No availabilities";
    
    return bodyText;
  }

  formatDateHeader(dayLabel: string, dateNumber: number) {
    return `${this.ANSI.BOLD_WHITE}${dateNumber} ${dayLabel}:${this.ANSI.CYAN}`;
  }

  getTimeRangeString(timeRange: {startTime: number, endTime: number}){
    const start = dayjs.unix(timeRange.startTime).format("HH:mm")
    const end = dayjs.unix(timeRange.endTime).format("HH:mm")

    if (start === "00:00" && end === "23:59") return `All day`;

    return `${start} - ${end}`
  }
}
