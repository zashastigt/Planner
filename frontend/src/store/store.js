import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
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

export const useCellsStore = defineStore('cells', () => {
    const cells = ref(new Set([]));
    const tempCells = ref(new Set([]));
    const deleteCells = ref(new Set([]));
    const jsonSizeStore = useJsonSizeStore()

    function mergeTempCells() {
        tempCells.value.forEach(value => cells.value.add(value));
    }

    function addTempCells(startCell, endCell) {
        startCell = Number(startCell);
        endCell = Number(endCell);

        if (!startCell || !endCell) return; //Return if cell border gets hit

        const distance = Math.abs(startCell - endCell);
        let heightDistance = distance % jsonSizeStore.cellColumn;

        if (heightDistance > jsonSizeStore.cellColumn / 2) heightDistance -= jsonSizeStore.cellColumn;
        let heightDifference = heightDistance / jsonSizeStore.cell

        const columnDistance = distance - heightDistance;
        let columnDifference = columnDistance / jsonSizeStore.cellColumn;

        let columnStep = 1;
        if (startCell > endCell) {
            columnStep = -1;
            columnDifference *= -1;
            heightDifference *= -1;
        }

        const cellStep = heightDifference > 0 ? 1 : -1;

        tempCells.value.clear();
        for (let column = 0; (column >= 0 && column <= columnDifference) || (column <= 0 && column >= columnDifference); column += columnStep) {
            for (let cell = 0; (cell >= 0 && cell <= heightDifference) || (cell <= 0 && cell >= heightDifference); cell += cellStep) {
                const combined = startCell + column * jsonSizeStore.cellColumn + cell * jsonSizeStore.cell;

                tempCells.value.add(combined)

                if (cells.value.has(combined) && tempCells.value.has(combined)) {//Hovered over cells become tempCells
                    cells.value.delete(combined)
                }
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
                cells.value.add(currentTime);
                allTimestamps.push(currentTime)

                currentTime += SECONDS_BETWEEN_CELLS;
            }
        });

        setJsonActive(allTimestamps, true)
    }

    function setJsonActive(allTimestamps, isActive) {
        const jsonSizeStore = useJsonSizeStore()
        const timeStore = useTimeStore()

        for (const timestamp of allTimestamps) {
            let time = dayjs.unix(timestamp)

            if (time.hour() < jsonSizeStore.cellsBetweenHour) time = time.subtract(1, 'd');

            const dayKey = time.format('ddd')
            const hourKey = time.format('HH:00')
            const subHourKey = time.format('m')

            timeStore.editableTimeTable[dayKey][hourKey][subHourKey / (jsonSizeStore.cellBlock / jsonSizeStore.cellsBetweenHour)].checked = isActive;
        }
    }

    return { cells, tempCells, deleteCells, mergeTempCells, addTempCells, setJsonActive, setTimeCellAndJsonActive }
})

export const useDBCallStore = defineStore('dbCall', () => {
    const storedPlanningDto = ref(null)

    function setPlanningDto(planningDto) {
        storedPlanningDto.value = planningDto
    }

    return { storedPlanningDto, setPlanningDto }
})

export const useJsonSizeStore = defineStore('jsonSize', () => {
    const cellsBetweenHour = 4 // 4 x 15 minutes
    const cellBlock = 60 // hour
    const cellColumn = 86400 //24 hour
    const cell = 900 //15 minutes

    return { cellsBetweenHour, cellBlock, cellColumn, cell }
})

export const useAvailabilityStore = defineStore('availability', () => {
    const availability = ref([])

    return { availability }
})

export const useColorStore = defineStore('color', () => {
    const color = ref(
        localStorage.getItem("tableColor")
            ? localStorage.getItem("tableColor")
            : '#17aa41')

    watch(color, () => {
        localStorage.setItem("tableColor", color.value)
    })

    return { color }
})