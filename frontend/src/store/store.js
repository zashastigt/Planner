import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useSettingsStore = defineStore('settings', () => {
    const color = ref(
        localStorage.getItem("tableColor")
            ? localStorage.getItem("tableColor")
            : '#17aa41')

    watch(color, () => {
        localStorage.setItem("tableColor", color.value)
    })

    const gradient = ref(
        localStorage.getItem("gradientColor")
            ? localStorage.getItem("gradientColor")
            : color.value)

    watch(gradient, () => {
        localStorage.setItem("gradientColor", gradient.value)
    })

    const showGradient = ref(
        localStorage.getItem("showGradient")
            ? localStorage.getItem("showGradient") === "true"
            : false)

    watch(showGradient, () => {
        localStorage.setItem("showGradient", showGradient.value)
    })

    return { color, gradient, showGradient }
})