<script setup>
import { onBeforeMount, ref } from 'vue';
import { getAvailability, getPlanning } from '../../snippets/fetchCalls';
import { createAvailibilityJson } from '../../snippets/createAvaililbilityJson';
import AvailibilityCell from '../AvailibilityCell.vue';
import { useDBCallStore, useJsonSizeStore, useTimeStore, useAvailabilityStore } from '../../store/store';
import dayjs from 'dayjs';

const timeStore = useTimeStore()
const availabilityJson = ref({})

onBeforeMount(async () => {
    const { storedPlanningDto } = useDBCallStore()
    const availabilityStore = useAvailabilityStore()
    let planningDto = storedPlanningDto

    if (!planningDto) {
        planningDto = await getPlanning()
    }
    availabilityStore.availability = await getAvailability()
    
    const startDate = dayjs.unix(planningDto.startDate)
    const endDate = dayjs.unix(planningDto.endDate)

    timeStore.setEditableJson(createJson(startDate, endDate))
    availabilityJson.value = createJson(startDate, endDate, availabilityStore.availability)
})

function createJson(startDate, endDate, usersAvailabilities = []) {
    const jsonSizeStore = useJsonSizeStore()
    return createAvailibilityJson(startDate, endDate, jsonSizeStore.cellsBetweenHour, usersAvailabilities)
}


</script>

<template>
    <div class="timeTable">
        <div class="timeColumn" v-for="(day, dayKey, index) in availabilityJson">
            <span class="day">{{ dayKey }}</span>
            <AvailibilityCell
                v-for="(hour, hourKey, hourIndex) in day"
                :hour="hour"
                :hourKey="hourKey"
                :dayKey="dayKey"
                :index="index"
                :hourIndex="hourIndex"/>
        </div>
    </div>
</template>

<style scoped>
    .timeRow {
        display: flex;
        flex-direction: column;
    }

    .time {
        display: flex;
        align-items: flex-end;
        height: 34px;        
    }

    .timeTable {
        display: flex;
        user-select: none;
        margin: 20px;
        color: aliceblue;
    }

    .timeColumn {
        display: flex;
        flex-direction: column;
        align-items: flex-end;  
    }

    .day {
        margin-right: 7px;
    }
</style>