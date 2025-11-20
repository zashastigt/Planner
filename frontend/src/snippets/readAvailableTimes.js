export function readAvailableTimes(timeTable) {
    const allTimes = Object.values(timeTable.value);
    const ranges = [];
    let start = null;
    let previous = null;

    allTimes.forEach((day) => {
        Object.values(day).forEach((hour) => {
            Object.values(hour).forEach((time, i) => {
                if (time.checked && start === null) start = time.timestampStart
                if (!time.checked && start !== null) {
                    ranges.push({startTime: start, endTime: previous});
                    start = null;
                }
                previous = time.timestampEnd
             })
        })
    });

    if (start != null) ranges.push({startTime: start, endTime: previous})

    return ranges;
}