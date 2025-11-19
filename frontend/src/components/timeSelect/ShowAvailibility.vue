<script setup>
import { onBeforeMount, provide, reactive, ref } from 'vue';
import { getAvailability } from '../../snippets/fetchCalls';
import dayjs from 'dayjs';
import { createAvailibilityJson } from '../../snippets/createAvaililbilityJson';
import AvailibilityCell from '../AvailibilityCell.vue';
import { useTimeStore } from '../../store/store';
import { storeToRefs } from 'pinia';


const timeStore = useTimeStore()
const { timeTable } = storeToRefs(timeStore)
const localTimeTable = reactive({...timeTable.value})

console.log(timeTable.value);


const availabilityJson = ref({})
console.log(availabilityJson.value);


onBeforeMount(async () => {
    const availability = await getAvailability()
    const name = availability[0]?.name
    const start = dayjs.unix(availability[0]?.times[0].startTime)
    const end = dayjs.unix(availability[0]?.times[0].endTime)
    console.log(availability[0]?.name);
    
    availabilityJson.value = createAvailibilityJson(start, end, name)
    console.log(availabilityJson.value);
})


</script>

<template>
    <div class="timeTable">
        <div class="timeColumn" v-for="(day, dayKey, index) in availabilityJson.table">
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
    <button @click="() => console.log(localTimeTable)">log</button>
</template>

<style scoped>

</style>