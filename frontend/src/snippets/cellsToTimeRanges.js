import _ from 'lodash'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.extend(isBetween)

export function cellsToTimeRanges(cells) {
    const ranges = [];

    let startTime = null;
    let endTime = null;
    _.forIn(cells, (cell)=>{
        if(cell.selected && !startTime) startTime = cell.startTime
        if(cell.selected && startTime) endTime = cell.endTime

        const localStartTime = dayjs.unix(startTime).utc()
        const localEndTime = dayjs.unix(endTime).utc()
        
        if((!cell.selected && startTime && endTime)) {
            ranges.push({startTime, endTime})
            startTime = null;
            endTime = null;
        }
    })

    if(startTime && endTime) ranges.push({startTime, endTime})

    return ranges;
}

export function timeRangesToCells(timeRanges, interval) {
    const cells = {};

    for(const timeRange of timeRanges){
        const startTime = dayjs.unix(timeRange.startTime)
        const endTime = dayjs.unix(timeRange.endTime)

        let currentTime = startTime
        while(currentTime.isBefore(endTime)){
            const nextTime = currentTime.add(interval, 'minute')

            cells[currentTime.unix()] = {
                startTime: currentTime.unix(),
                endTime: nextTime.unix(),
                selected: true
            }
            currentTime = nextTime
        }
    }

    return cells;
}