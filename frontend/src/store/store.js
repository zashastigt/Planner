import { defineStore } from "pinia";
import { ref, watch } from "vue";

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

export const useDateSavingStore = defineStore('date', () => {
    const dates = ref({})

    function setDates(start, end) {
        dates.value = {
        startDate: start,
        endDate: end
        }
    }

    return { dates, setDates }
})