import dayjs from 'dayjs';

export function createAvailibilityJson(startDate, endDate, cellsBetweenHour, usersAvailabilities) {
    const resultJson = {}
    const TIME_START = 15 //15:00
    const TIME_END = 27 //3:00 next day, 24 hours + 3 hours
    const MINUTES_BETWEEN = 60 / cellsBetweenHour;
    let day = startDate

    while (day.isBefore(endDate) || day.isSame(endDate)) {
        let time = day
        .hour(TIME_START)
        .minute(0)
        .second(0);

        const dayTable = {}
             
        for (let i = TIME_START; i <= TIME_END; i++) {
            const hourTime = [];
            const currentHour = time

            for (let j = 0; j < cellsBetweenHour; j++) {
                const startTime = time;
                time = time.add(MINUTES_BETWEEN, 'm')

                hourTime.push({ 
                    "checked": false, 
                    "timestampStart": startTime.unix(), 
                    "timestampEnd": time.unix(), 
                    "userList": []})
            }

            dayTable[currentHour.format('HH:mm')] = hourTime
        }
               
        resultJson[day.format("ddd")] = dayTable;
        day = day.add(1, 'd')
    }

    for (const user of usersAvailabilities) {
        for (const userTime of user.times) {
            let currentTime = dayjs.unix(userTime.startTime)
            const endTime = dayjs.unix(userTime.endTime)

            const dayKey = currentTime.format('ddd');
            while (currentTime.isBefore(endTime)) {
                const hourKey = currentTime.format('HH:00');
                const betweenHourKey = currentTime.format('mm') / MINUTES_BETWEEN;

                const newJsonTime = resultJson[dayKey][hourKey][betweenHourKey]

                newJsonTime['userList'].push(user.name)
                newJsonTime.checked = newJsonTime['userList'].length === usersAvailabilities.length

                currentTime = currentTime.add(MINUTES_BETWEEN, 'm')
            }
        }
    }

    return resultJson
    
}