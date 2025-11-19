<script setup>
import dayjs from 'dayjs';
import Card from '../components/Card.vue'
import InputName from '../components/InputName.vue';
import TimeSelect from '../components/timeSelect/TimeSelect.vue';
import { useTimeStore, useDBCallStore } from '../store/store';
import { ref, onBeforeMount } from "vue";
import { router } from "./../router.js";
import { getAvailability } from '../snippets/fetchCalls.js';
import ShowAvailibility from '../components/timeSelect/ShowAvailibility.vue';
import { createAvailibilityJson } from '../snippets/createAvaililbilityJson.js';

defineProps({
    planningId: Number
})

onBeforeMount(async () => {
    const { storedPlanningDto } = useDBCallStore()
    let planningDto = storedPlanningDto

    if (!planningDto) {
        const url = router.currentRoute.value
        const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}planning/${url.params.planningId}`)
        planningDto = await response.json();
    }
    
    const startDate = dayjs.unix(planningDto.startDate)
    const endDate = dayjs.unix(planningDto.endDate)

    createJson(startDate, endDate)
})

function createJson(startDate, endDate) {
    const timeStore = useTimeStore()
    const newJson = createAvailibilityJson(startDate, endDate)
    
    timeStore.setJson(newJson)
}

const handleMouse = ref(null);

const nameCheck = ref(false)
const updateNameCheck = (newValue) => {
    nameCheck.value = newValue
}
</script>

<template>
    <div id="container" 
    @mouseup="() => handleMouse?.handleMouseGone()"
    @mouseleave="() => handleMouse?.handleMouseGone()">
        <Card v-if="!nameCheck" title="Input your name">
            <InputName nameCheck="nameCheck" @updateNameCheck="updateNameCheck" />
        </Card>
        <Card v-if="nameCheck" title="Your Availibility">
            <TimeSelect ref="handleMouse" />
        </Card>
        <Card title="Group Availibility">
            <ShowAvailibility />
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