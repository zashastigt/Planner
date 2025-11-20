import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from 'dayjs';

export const useTimeStore = defineStore('time', () => {
    const name = ref("")
    const editableTimeTable = ref({})
    const availabilityTimeTable = ref({})

    function setEditableJson(json) {
        editableTimeTable.value = json
    }

    function setAvailabilityJson(json) {
        availabilityTimeTable.value = json
    }
    
    const timeTableColumnLength = computed(() => {
        if (!editableTimeTable) return;
        
        const days = Object.values(editableTimeTable.value);      
        let length = Object.values(days[1])[0][0].timestampStart - Object.values(days[0])[0][0].timestampStart

        return length;
    })

    return { name, editableTimeTable, timeTableColumnLength, availabilityTimeTable, setEditableJson, setAvailabilityJson }
})

export const useTimeCellIdsStore = defineStore('timeCellIds', () => {
    const timeCellIds = ref(new Set([]));
    const timeCellTempIds = ref(new Set([]));
    const timeCellTempDeleteIds = ref(new Set([]));
    const jsonSizeStore = useJsonSizeStore()
    const SECONDS_BETWEEN_CELLS = jsonSizeStore.cellBlock * jsonSizeStore.cellBlock / jsonSizeStore.cellsBetweenHour; //15 mintues in seconds

    function mergeTempIds() {
        timeCellTempIds.value.forEach(value => timeCellIds.value.add(value));
    }

    function updateTempIds(startId, endId) {
        startId = Number(startId);
        endId = Number(endId);

        timeCellTempIds.value.clear()

        const step = startId <= endId ? SECONDS_BETWEEN_CELLS : -SECONDS_BETWEEN_CELLS;

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

    function setTimeCellAndJsonActive(timestamps) {
        const allTimestamps = []
        
        timestamps.forEach(time => {
            const startTime = time.startTime
            const endTime = time.endTime
            let currentTime = startTime         

            while (currentTime < endTime) {
                timeCellIds.value.add(currentTime);
                allTimestamps.push(currentTime)

                currentTime += SECONDS_BETWEEN_CELLS;
            }
        });

        setJsonActive(allTimestamps, true)
    }

    function setJsonActive(allTimestamps, isActive) {
        const END_TABLE_RANGE = 3
        const timeStore = useTimeStore()
        
        for (const timestamp of allTimestamps) {      
            let time = dayjs.unix(timestamp)
            
            if (time.hour() <= END_TABLE_RANGE) time = time.subtract(1, 'd');

            const dayKey = time.format('ddd')
            const hourKey = time.format('HH:00')
            const subHourKey = time.format('m')

            timeStore.editableTimeTable[dayKey][hourKey][subHourKey / (jsonSizeStore.cellBlock / jsonSizeStore.cellsBetweenHour)].checked = isActive;
        }
        console.log(timeStore.editableTimeTable)
    }

    return { timeCellIds, timeCellTempIds, timeCellTempDeleteIds, mergeTempIds, updateTempIds, setTimeCellAndJsonActive, setJsonActive }
})

export const useDBCallStore = defineStore('dbCall', () => {
    const storedPlanningDto = ref(null)

    function setPlanningDto(planningDto) {
        storedPlanningDto.value = planningDto
    }

    return {storedPlanningDto, setPlanningDto}
})

export const useJsonSizeStore = defineStore('jsonSize', () => {
    const cellsBetweenHour = 4 // 4 x 15 minutes
    const cellBlock = 60 // hour

    return {cellsBetweenHour, cellBlock}
})

export const useAvailabilityStore = defineStore('availability', () => {
    const availability = ref([])

    return {availability}
})