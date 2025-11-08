<script setup>
import TimeCell from './TimeCell.vue';
import { useTimeStore } from '../../store/store';
import { storeToRefs } from 'pinia';

const timeStore = useTimeStore()
const { timeTable } = storeToRefs(timeStore)

function updateTime(dayKey, hourKey, index, value) {
    timeTable.value
    timeTable.value[dayKey][hourKey][index] = value
}


</script>

<template>
    <div class="timeTable">
        <!-- <div class="timeRow">
            <span class="time"></span>
            <span class="time" v-for="(hour, hourKey) in timeTable['Mon']">{{ hourKey }}</span>
        </div> -->
        <div class="timeColumn" v-for="(day, dayKey) in timeTable">
            <span>{{ dayKey }}</span>
            <TimeCell v-for="(hour, hourKey) in day" :hour="hour" :hourKey="hourKey" :dayKey="dayKey" :updateTime="updateTime" />
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
        
    }

    .timeColumn {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        border-bottom: white solid 1px;
    }
</style>
