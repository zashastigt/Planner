import { defineStore } from "pinia";
import availabilityTable from '../data/availabilityTable.json'
import { ref } from "vue";

export const useTimeStore = defineStore('time', () => {
    const timeTable = ref(availabilityTable)

    function updateTimeTable(newTable) {
        timeTable.value = newTable
    }

    return { timeTable, updateTimeTable }
})