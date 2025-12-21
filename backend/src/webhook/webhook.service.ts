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
    const allTimeRanges = this.getMaxAvailability(planning, availabilities)
    const allTimeZones = this.getTimezones(availabilities)
    const allTimezoneTimeRanges = this.getTimezoneTimes(allTimeRanges, allTimeZones)
    const bodyText = this.createBodyText(planning, allTimezoneTimeRanges)

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
    const timezones = availabilities.reduce((allTimezones: { timezone: string, utcOffset: number, voters: string[]}[], availability) => {
      const utcOffset = dayjs().tz(availability.timezone).utcOffset() / 60
      const offsetExists = allTimezones.map(offset => offset.utcOffset).indexOf(utcOffset)

      if (offsetExists !== -1) {
        allTimezones[offsetExists].voters.push(availability.name)
      }
      else {
        allTimezones.push({
          timezone: availability.timezone,
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
    let times = _.cloneDeep(availabilities.flatMap(availability => availability.times))
    const userAmount = availabilities.length

    const startDate = dayjs.unix(planning.startDate)
    const endDate = dayjs.unix(planning.endDate)
    let currentDate = startDate

    const timeRanges: {
      startTime: number,
      endTime: number
    }[] = []

    const maxAvailabilityRanges: {
      startTime: number,
      endTime: number
    }[] = []

    const processedTimes: number[] = []
    for (const currentRange of times) {
      const startTime = currentRange.startTime

      if (processedTimes.includes(startTime)) continue;
      processedTimes.push(startTime)

      let smallestEndTime = Number.POSITIVE_INFINITY
      const matchingRanges = times.filter((range) => {
        const withinRange = startTime >= range.startTime && startTime < range.endTime
        if (withinRange) smallestEndTime = Math.min(smallestEndTime, range.endTime)
        return withinRange
      })

      if (matchingRanges.length < userAmount) continue;

      const maxAvailabilityRange = {
        startTime: startTime,
        endTime: smallestEndTime
      }

      maxAvailabilityRanges.push(maxAvailabilityRange)
    }

    if (maxAvailabilityRanges.length) {
      timeRanges.push(...maxAvailabilityRanges)
    }
    currentDate = currentDate.add(1, 'day')

    return {
      timeRanges: timeRanges,
    }
  }

  getTimezoneTimes(allTimeRanges, allTimeZones) {
    const allTimezoneRanges: {
      utcOffset: number,
      voters: string[],
      times: {
        startTime: number,
        endTime: number
      }[]
    }[] = []

    allTimeRanges.timeRanges.sort((a, b) => a.startTime - b.startTime)

    for (const timezone of allTimeZones) {
      const times = _.cloneDeep(allTimeRanges).timeRanges.map(timeRange => {
        timeRange.startTime = dayjs.unix(timeRange.startTime).tz(timezone.timezone).utcOffset(0, true).unix()
        timeRange.endTime = dayjs.unix(timeRange.endTime).tz(timezone.timezone).utcOffset(0, true).unix()

        return timeRange
      })

      allTimezoneRanges.push({
        utcOffset: timezone.utcOffset,
        voters: timezone.voters,
        times: times
      })
    }

    return allTimezoneRanges
  }


  readonly ANSI = {
    BOLD_WHITE: '\u001b[1;37m',
    CYAN: '\u001b[0;36m',
    SPACER: ` \u001b[0;30m|\u001b[0;36m `
  };

  createBodyText(planning, allTimezoneTimeRanges) {
    const startDate = dayjs.unix(planning.startDate)
    const endDate = dayjs.unix(planning.endDate)
    const startBodyText = `${startDate.format('ddd')} ${startDate.format('DD')} - ${endDate.format('ddd')} ${endDate.format('DD')}`
    let bodyText = `${startBodyText}\n`

    for (const timezoneRange of allTimezoneTimeRanges) {
      const operator = timezoneRange.utcOffset > 0 ? '+' : ''
      bodyText += `## UTC ${operator}${timezoneRange.utcOffset} | ${(timezoneRange.voters as string[]).join(',  ')}\n`
      bodyText += "```ansi\n"

      const timeRanges = timezoneRange.times.reduce((acc, timeRange) => [...acc, ...this.splitTimeRange(timeRange)], [])

      let prevDayNumber = 0
      for (const time of timeRanges) {
        const currentDay = dayjs.unix(time.startTime)
        const dayLabel = currentDay.format('ddd')
        const dayNumber = Number(currentDay.format('DD'))

        const isNewDay = prevDayNumber != dayNumber
        if (isNewDay) {
          bodyText += `\n${this.formatDateHeader(dayLabel, dayNumber)}`
        }

        bodyText += `${!isNewDay ? this.ANSI.SPACER : " "}${this.getTimeRangeString(time)}`

        prevDayNumber = dayNumber
      }

      bodyText += "```\n"
    }
    if (allTimezoneTimeRanges[0].times.length === 0) bodyText = `${startBodyText}\nNo availabilities`;

    return bodyText;
  }

  splitTimeRange(time: { startTime: number, endTime: number }) {
    let start = dayjs.unix(time.startTime);
    let end = dayjs.unix(time.endTime);
    end = end.add(end.isSame(end.startOf('day')) ? -1 : 0 , 'second')

    let carryRange: {
      startTime: number,
      endTime: number
    } | null = null
    
    if (!start.isSame(end, 'day')) {
      carryRange = {
        startTime: start.startOf('day').add(1, 'day').unix(),
        endTime: end.unix()
      }

      return [{startTime: time.startTime, endTime: carryRange.startTime - 1}, ...this.splitTimeRange(carryRange)]
    }
    else {
      return [{startTime: start.unix(), endTime: end.unix()}]
    }
  }

  formatDateHeader(dayLabel: string, dateNumber: number) {
    return `${this.ANSI.BOLD_WHITE}${dateNumber} ${dayLabel}:${this.ANSI.CYAN}`;
  }

  getTimeRangeString(timeRange: { startTime: number, endTime: number }) {
    const start = dayjs.unix(timeRange.startTime).format("HH:mm")
    const end = dayjs.unix(timeRange.endTime).format("HH:mm")

    if (start === "00:00" && end === "23:59") return `All day`;

    return `${start} - ${end}`
  }
}
