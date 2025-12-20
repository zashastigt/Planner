import { Injectable } from '@nestjs/common';
import { Availability } from 'src/availability/entities/availability.entity';
import { Planning } from 'src/planning/entities/planning.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)

@Injectable()
export class WebhookService {

  sendWebhook(planning: Planning, availabilities: Availability[]) {
    const maxAvailability = this.getMaxAvailability(planning, availabilities)
    let bodyText = ""
    
    for (const timezone of maxAvailability.timezones) {
      const operator = timezone.utcOffset > 0 ? '+' : ''
      bodyText += `## UTC ${operator}${timezone.utcOffset} | ${(timezone.voters as string[]).join(',  ')}\n`

      bodyText += "```ansi\n"
      let prevDayNumber;
      let leftOverTime = "";
      for(const day of timezone.days) {
        const utcDayStart = dayjs.unix(day.times[0].startTime).utcOffset(timezone.utcOffset)
        const utcDayEnd = dayjs.unix(day.times[day.times.length -1].endTime).utcOffset(timezone.utcOffset)

        const dayLabel = utcDayStart.format('ddd')
        const dateNumber = utcDayStart.format('DD')
    
        const {text, time} = this.createBodyText(bodyText, timezone.utcOffset, day, utcDayStart, utcDayEnd, dayLabel, Number(dateNumber), Number(prevDayNumber), leftOverTime)
        bodyText = text;
        leftOverTime = time

        prevDayNumber = dateNumber;
      }
      bodyText += "```\n"
    }
    if (timezone[0]?.days.length === 0) bodyText = "No availabilities";

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

  getMaxAvailability(planning: Planning, availabilities: Availability[]) {
    const days: {
      times: {
        startTime: number,
        endTime: number
      }[]
    }[] = []

    const timezones: {
      utcOffset: number,
      voters: string[],
      days: typeof days
    }[] = []

    const times = availabilities.flatMap(availability=>availability.times)
    const userAmount = availabilities.length
    
    const startDate = dayjs.unix(planning.startDate)
    const endDate   = dayjs.unix(planning.endDate)
    let currentDate = startDate
    
    const sortedTimezones = this.getTimezones(availabilities)
    for (const timezone of sortedTimezones) {
      currentDate = currentDate.utcOffset(timezone.utcOffset)
      while (currentDate.isBefore(endDate, 'day') || currentDate.isSame(endDate, 'day')) {
        const currentDayTimes = times.filter(time => currentDate.isSame(dayjs.unix(time.startTime).utcOffset(timezone.utcOffset), 'day') ||
          currentDate.isSame(startDate, 'day') && currentDate.isSame(dayjs.unix(time.endTime).utcOffset(timezone.utcOffset), 'day'))

        const maxAvailabilityTimeBlocks: {
          startTime: number,
          endTime: number
        }[] = []

        const processedTimes: number[] = []
        for (const timeBlock of currentDayTimes) {
          const startTime = timeBlock.startTime

          if (processedTimes.includes(startTime)) continue;
          processedTimes.push(startTime)

          let smallestEndTime = Number.POSITIVE_INFINITY
          const matchingBlocks = currentDayTimes.filter((block) => {
            const blockMatches = startTime >= block.startTime && startTime < block.endTime
            if (blockMatches) smallestEndTime = Math.min(smallestEndTime, block.endTime)
            return blockMatches
          })

          if (matchingBlocks.length < userAmount) continue;

          maxAvailabilityTimeBlocks.push({
            startTime: startTime,
            endTime: smallestEndTime
          })
        }

        if(maxAvailabilityTimeBlocks.length) {
          days.push({
            times: maxAvailabilityTimeBlocks
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

  createBodyText(
    bodyText: string,
    utcOffset: number,
    day: {times: { startTime: number; endTime: number; }[]},
    utcDayStart: dayjs.Dayjs,
    utcDayEnd: dayjs.Dayjs,
    dayLabel: string,
    dateNumber: number,
    prevDayNumber: number,
    leftOverTime: string) {

    const timeRanges = day.times.map(time => this.getTimeRangeString(time, utcOffset))
    let sameDay = false;

    if (dateNumber === prevDayNumber) {
      bodyText += `${this.ANSI.SPACER}${timeRanges.join(this.ANSI.SPACER)}`
      sameDay = true;
    }
    else {
      bodyText += `\n`
      bodyText += `${this.formatDateHeader(dateNumber, dayLabel)} ${leftOverTime}${timeRanges.join(this.ANSI.SPACER)}`
      leftOverTime = ""
    }

    const endDateNumber = Number(utcDayEnd.format('DD'))

    const startsAtMidnightAndIntoNextDay = dayjs.unix(day.times[day.times.length - 1].startTime).isSame(utcDayStart.startOf('day')) && utcDayEnd.isSameOrAfter(utcDayStart.startOf('day').add(1, 'day'))
    if (utcDayEnd.startOf('day').diff(utcDayStart.startOf('day'), 'day') > 1|| startsAtMidnightAndIntoNextDay) {
      leftOverTime = `00:00 - ${bodyText.slice(-5)}${this.ANSI.SPACER}`
      bodyText = bodyText.slice(0, -5) + `00:00`

      if (dateNumber + 1 === endDateNumber || startsAtMidnightAndIntoNextDay) {
        bodyText = bodyText.slice(0, -13) + `All day`
      }

      let currentDay = utcDayStart
      for (let currentDateNumber = dateNumber + 1; currentDateNumber < endDateNumber; currentDateNumber++) {
        bodyText += `\n`
        currentDay = currentDay.add(1, 'day')
        bodyText += `${this.ANSI.BOLD_WHITE}${currentDateNumber} ${currentDay.format('ddd')}:${this.ANSI.CYAN} All day`
      }
    }

    return {text: bodyText, time: leftOverTime}
  }

  formatDateHeader(dateNumber: number, dayLabel: string) {
    return `${this.ANSI.BOLD_WHITE}${dateNumber} ${dayLabel}:${this.ANSI.CYAN}`;
  }

  getTimeRangeString(timeRange: {startTime: number, endTime: number}, utcOffset: number){
    const start = dayjs.unix(timeRange.startTime).utcOffset(utcOffset).format("HH:mm")
    const end = dayjs.unix(timeRange.endTime).utcOffset(utcOffset).format("HH:mm")

    return `${start} - ${end}`
  }
}
