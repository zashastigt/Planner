import { defineStore } from "pinia";
import availabilityTable from '../data/availabilityTable.json'
import { ref } from "vue";

export const useTimeStore = defineStore('time', () => {
    const timeTable = ref(availabilityTable)
    const timeTableColumnLength = ref(tableColumnLength())

    function updateTimeTable(newTable) {
        timeTable.value = newTable
    }

    function tableColumnLength() {
        const days = Object.values(timeTable.value);
        const hours = Object.keys(Object.values(days)[0])
        const subHours = Object.keys(Object.values(hours)[0])
        return subHours.length * hours.length;
    }

    return { timeTable, timeTableColumnLength, updateTimeTable }
})

export const useNameStore = defineStore('name', () => {
    const name = ref('')

    function updateName(newName) {
        name.value = newName
    }

    return { name, updateName }
})

export const useTimeCellIdsStore = defineStore('timeCellIds', () => {
    const timeCellColorIds = ref(new Set([]));
    const timeCellTempColorIds = ref(new Set([]));
    const timeCellTempDeleteColorIds = new Set([]);

    function updateColorIds() {
        timeCellTempColorIds.value.forEach(value => timeCellColorIds.value.add(value));
        timeCellTempDeleteColorIds.clear();
    }

    function updateTempColorIds(startTimeCellId, lastTimeCellId) {
        startTimeCellId = Number(startTimeCellId);
        lastTimeCellId = Number(lastTimeCellId);
        timeCellTempColorIds.value = new Set([])

        let step = startTimeCellId <= lastTimeCellId ? 1 : -1;
        
        for (let i = startTimeCellId; (step > 0 && i <= lastTimeCellId) || (step < 0 && i >= lastTimeCellId); i += step) {
            if (timeCellColorIds.value.has(i)) 
            {
                timeCellColorIds.value.delete(i);
                timeCellTempDeleteColorIds.add(i);
            }
            else {
                if (!timeCellTempDeleteColorIds.has(i)) timeCellTempColorIds.value.add(i);
            }
        }
    }

    return { timeCellColorIds, timeCellTempColorIds, updateColorIds, updateTempColorIds }
})