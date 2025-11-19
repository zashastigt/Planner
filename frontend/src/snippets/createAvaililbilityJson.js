export function createAvailibilityJson(startDate, endDate, name = "") {
    const newDefaultJson = { "name": name, "table": {}}
    const startTime = 15 //15:00
    const endTime = 27 //3:00 next day, 24 hours + 3 hours
    const betweenHours = 4 //15 minutes
    let currentDay = startDate

    while (currentDay.isBefore(endDate) || currentDay.isSame(endDate)) {
        let time = currentDay.set('h', startTime).set('m', 0).set('s', 0)
        const dayTime = {}
             
        for (let i = startTime; i <= endTime; i++) {
            const hourTime = [];
            const currentHour = time

            for (let j = 0; j < betweenHours; j++) {
                time = j > 23 ? time.add(1, 'd') : time
                let startTime = time;
                time = time.add(60/betweenHours, 'm')
                hourTime.push({ "checked": false, "timestampStart": startTime.unix(), "timestampEnd": time.unix()})
            }

            dayTime[currentHour.format('HH:mm')] = hourTime
        }
               
        newDefaultJson.table[currentDay.format("ddd")] = dayTime;
        currentDay = currentDay.add(1, 'd')
    }
    return newDefaultJson
    
}