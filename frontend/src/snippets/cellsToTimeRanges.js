import _ from 'lodash'
import dayjs from 'dayjs'

export function cellsToTimeRanges(cells) {
    const ranges = [];

    let startTime = null;
    let endTime = null;
    _.forIn(cells, (cell)=>{
        if(cell.selected && !startTime) startTime = cell.startTime
        if(cell.selected && startTime) endTime = cell.endTime
        
        if(!cell.selected && startTime && endTime) {
            ranges.push({startTime, endTime})
            startTime = null;
            endTime = null;
        }
    })

    return ranges;
    // const allTimes = Object.values(timeTable.value);
    // let start = null;
    // let previous = null;

    // allTimes.forEach((day) => {
    //     start = null;
    //     previous = null;
    //     Object.values(day).forEach((hour) => {
            
    //         Object.values(hour).forEach((time, i) => {
    //             if (time.checked && start === null) start = time.timestampStart
    //             if (!time.checked && start !== null) {
    //                 ranges.push({startTime: start, endTime: previous});
    //                 start = null;
    //             }
    //             previous = time.timestampEnd
    //          })
    //     })
    //     if (start != null) ranges.push({startTime: start, endTime: previous})
    // });

    // return ranges;
}

export function timeRangesToCells(timeRanges, interval) {
    const cells = {};

    for(const timeRange of timeRanges){
        debugger

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
    // const allTimes = Object.values(timeTable.value);
    // let start = null;
    // let previous = null;

    // allTimes.forEach((day) => {
    //     start = null;
    //     previous = null;
    //     Object.values(day).forEach((hour) => {
            
    //         Object.values(hour).forEach((time, i) => {
    //             if (time.checked && start === null) start = time.timestampStart
    //             if (!time.checked && start !== null) {
    //                 ranges.push({startTime: start, endTime: previous});
    //                 start = null;
    //             }
    //             previous = time.timestampEnd
    //          })
    //     })
    //     if (start != null) ranges.push({startTime: start, endTime: previous})
    // });

    // return ranges;
}