import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from 'dayjs';

export const useTimeStore = defineStore('time', () => {
    const timeJson = ref({})
    const name = ref("")
    const timeTable = ref({})

    function setJson(json) {
        timeJson.value = json
        name.value = json.name
        timeTable.value = json.table
    }
    
    const timeTableColumnLength = computed(() => {
        if (!timeTable) return;
        const days = Object.values(timeTable.value);
        if (days.length === 0) return 0;
        
        const firstDay = days[0];
        const hours = Object.values(firstDay);
        if (hours.length === 0) return 0;
        
        return hours.reduce((total, hour) => total + Object.keys(hour).length, 0);
    })

    return { name, timeTable, timeTableColumnLength, setJson }
})

export const useTimeCellIdsStore = defineStore('timeCellIds', () => {
    const timeCellIds = ref(new Set([]));
    const timeCellTempIds = ref(new Set([]));
    const timeCellTempDeleteIds = ref(new Set([]));

    function mergeTempIds() {
        timeCellTempIds.value.forEach(value => timeCellIds.value.add(value));
    }

    function updateTempIds(startId, endId) {
        startId = Number(startId);
        endId = Number(endId);

        timeCellTempIds.value.clear()

        const step = startId <= endId ? 1 : -1;

        for (let i = startId; (step >= 0 && i <= endId) || (step <= 0 && i >= endId); i += step) {
            if (timeCellIds.value.has(i) && (timeCellIds.value.has(startId) || timeCellTempDeleteIds.value.has(startId))) {
                timeCellIds.value.delete(i);
                timeCellTempDeleteIds.value.add(i);
            }
            else {
                if (!timeCellTempDeleteIds.value.has(startId)) timeCellTempIds.value.add(i);
            }
            
            if (timeCellIds.value.has(i) && timeCellTempIds.value.has(i)) {
                timeCellIds.value.delete(i);
                timeCellTempIds.value.add(i);
            }
        }
    }

    function enableIdsByTimestamps(timestamps) {
        console.log(timestamps);
        
        const timeStore = useTimeStore()
        const timeTable = timeStore.timeTable
        const hour = 60; // 60 minutes
        const betweenHour = 4; //4x 15 minutes

        timestamps.forEach(time => {
            const startTime = dayjs.unix(time.startTime)
            const endTime = dayjs.unix(time.endTime)
            const daykey = startTime.format('ddd');
            const startHourKey = startTime.format('HH:00')
            const startSubHourKey = startTime.format('mm')
            const endHourKey = endTime.format('HH:00')
            const endSubHourKey = endTime.format('mm')
            let currentTime = startTime

            const startCellId = parseCellId(timeTable, timeStore.timeTableColumnLength, daykey, startHourKey, startSubHourKey, hour, betweenHour)
            const endCellId = parseCellId(timeTable, timeStore.timeTableColumnLength, daykey, endHourKey, endSubHourKey, hour, betweenHour)

            for (let cellId = startCellId; cellId < endCellId; cellId++) {
                timeCellIds.value.add(cellId);
            }

            while (currentTime.isBefore(endTime)) {
                timeTable[daykey][currentTime.format('HH:mm')]
                timeTable[daykey][currentTime.format('HH:00')][currentTime.format('mm') / (hour / betweenHour)].checked = true;
                currentTime = currentTime.add(60 / betweenHour, 'm')
            }
        });
        console.log(timeTable)
    }

    function parseCellId(timeTable, columnLength, daykey, hourKey, subHourKey, hour, betweenHour) {
        const columnNumber = Object.keys(timeTable).indexOf(daykey);
        const cellBlock = Object.keys(timeTable[daykey]).indexOf(hourKey);
        const cellIndex = subHourKey / (hour / betweenHour)

        return columnNumber * columnLength + cellBlock * betweenHour + cellIndex
    } 

    return { timeCellIds, timeCellTempIds, timeCellTempDeleteIds, mergeTempIds, updateTempIds, enableIdsByTimestamps }
})

export const useDBCallStore = defineStore('dbCall', () => {
    const storedPlanningDto = ref(null)

    function setPlanningDto(planningDto) {
        storedPlanningDto.value = planningDto
    }

    return {storedPlanningDto, setPlanningDto}
})