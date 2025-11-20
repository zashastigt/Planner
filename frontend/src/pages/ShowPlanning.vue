<script setup>
import dayjs from 'dayjs';
import Card from '../components/Card.vue'
import InputName from '../components/InputName.vue';
import TimeSelect from '../components/timeSelect/TimeSelect.vue';
import { useTimeStore, useDBCallStore } from '../store/store';
import { ref, onBeforeMount } from "vue";
import { router } from "./../router.js";

defineProps({
    planningId: Number
})

onBeforeMount(async () => {
    const { storedPlanningDto } = useDBCallStore()
    let planningDto = storedPlanningDto

    if (!planningDto) {
        const url = router.currentRoute._value
        const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}planning/${url.params.planningId}`)
        planningDto = await response.json();
    }
    
    const startDate = dayjs.unix(planningDto.startDate)
    const endDate = dayjs.unix(planningDto.endDate)

    createJson(startDate, endDate)
})

function createJson(startDate, endDate) {
    const timeStore = useTimeStore()
    const newDefaultJson = { "name": "", "table": {}}
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
    timeStore.setJson(newDefaultJson)
}

const handleMouse = ref(null);
</script>

<template>
    <div id="container" 
    @mouseup="() => handleMouse.handleMouseGone()"
    @mouseleave="() => handleMouse.handleMouseGone()">
        <Card title="name:">
            <InputName />
        </Card>
        <Card title="table">
            <TimeSelect ref="handleMouse" />
        </Card>
    </div>
    
</template>

<style scoped>
    #container {
        display: flex;
        width: 100vw;
        min-height: 100vh;
        justify-content: center;
        align-items: center;
    }
</style>