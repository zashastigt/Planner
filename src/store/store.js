import { defineStore } from "pinia";
import availabilityTable from '../data/availabilityTable.json'
import { ref, computed } from "vue";

export const useTimeStore = defineStore('time', () => {
    const timeJson = ref(availabilityTable)
    const name = ref(timeJson.value.name)
    const timeTable = ref(timeJson.value.table)
    
    const timeTableColumnLength = computed(() => {
        const days = Object.values(timeTable.value);
        if (days.length === 0) return 0;
        
        const firstDay = days[0];
        const hours = Object.values(firstDay);
        if (hours.length === 0) return 0;
        
        return hours.reduce((total, hour) => total + Object.keys(hour).length, 0);
    })

    return { name, timeTable, timeTableColumnLength }
})

export const useTimeCellIdsStore = defineStore('timeCellIds', () => {
    const timeCellColorIds = ref(new Set([]));
    const timeCellTempColorIds = ref(new Set([]));
    const timeCellTempDeleteColorIds = ref(new Set([]));

    function updateColorIds() {
        timeCellTempColorIds.value.forEach(value => timeCellColorIds.value.add(value));
    }

    function updateTempColorIds(startId, endId) {
        startId = Number(startId);
        endId = Number(endId);

        timeCellTempColorIds.value.clear()

        const step = startId <= endId ? 1 : -1;

        for (let i = startId; (step >= 0 && i <= endId) || (step <= 0 && i >= endId); i += step) {
            if (timeCellColorIds.value.has(i) && (timeCellColorIds.value.has(startId) || timeCellTempDeleteColorIds.value.has(startId))) {
                timeCellColorIds.value.delete(i);
                timeCellTempDeleteColorIds.value.add(i);
            }
            else {
                if (!timeCellTempDeleteColorIds.value.has(startId)) timeCellTempColorIds.value.add(i);
            }
            
            if (timeCellColorIds.value.has(i) && timeCellTempColorIds.value.has(i)) {
                timeCellColorIds.value.delete(i);
                timeCellTempColorIds.value.add(i);
            }
        }
    }

    return { timeCellColorIds, timeCellTempColorIds, timeCellTempDeleteColorIds, updateColorIds, updateTempColorIds }
})