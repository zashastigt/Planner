<script setup>
import TimeCell from './TimeCell.vue';
import { useTimeStore } from '../../store/store';
import { storeToRefs } from 'pinia';
import { useMouseHold } from '../../snippets/mouse';

const timeStore = useTimeStore()
const { timeTable } = storeToRefs(timeStore)

const isMouseDown = useMouseHold()

function updateTime(dayKey, hourKey, index, value) {
    timeTable.value
    timeTable.value[dayKey][hourKey][index] = value
}
</script>

<template>
    <div class="timeTable">
        <div class="timeColumn" v-for="(day, dayKey, index) in timeTable">
            <span>{{ dayKey }}</span>
            <TimeCell
                class="timeCell2"
                v-for="(hour, hourKey) in day"
                :hour="hour"
                :hourKey="hourKey"
                :dayKey="dayKey"
                :index="index"
                :isMouseDown="isMouseDown"
                :updateTime="updateTime"/>
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
    }
</style>
