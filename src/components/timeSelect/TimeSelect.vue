<script setup>
import TimeCell from './TimeCell.vue';
import { useTimeStore, useTimeCellIdsStore } from '../../store/store';
import { storeToRefs } from 'pinia';
import { useMouseHold } from '../../snippets/mouse';
import { ref, provide } from "vue";

const timeStore = useTimeStore()
const { timeTable } = storeToRefs(timeStore)

const isMouseDown = useMouseHold()

const timeCellIdsStore = useTimeCellIdsStore()
const globalIdCounter = ref(-4)
provide("getId", getId)

function getId() {
  globalIdCounter.value += 4
  return globalIdCounter.value
}

function updateTime(dayKey, hourKey, index, value) {
    timeTable.value
    timeTable.value[dayKey][hourKey][index] = value
}

let startColumnIndex = -1;
let startTimeCellId = -1;
let previousLastTimeCellId = -1;
let holdingDown = false;

function handleMouseDown(firstTimeCell, columnIndex) {
    startColumnIndex = columnIndex;
    startTimeCellId = Number(firstTimeCell.target.id)

    if (!startTimeCellId) {
        if (!firstTimeCell.target.firstElementChild) return
        startTimeCellId = firstTimeCell.target.firstElementChild.id
    }
    previousLastTimeCellId = startTimeCellId
    holdingDown = true;
    timeCellIdsStore.updateTempColorIds(startTimeCellId, startTimeCellId)
}

function handleMouseOver(lastTimeCell, columnIndex) {
    if (!holdingDown) return;
    let lastTimeCellId = Number(lastTimeCell.target.id)

    if (!lastTimeCellId) {
        console.log(`${startTimeCellId} ${lastTimeCellId} ${previousLastTimeCellId} ${lastTimeCellId - timeStore.timeTableColumnLength * -(startColumnIndex - columnIndex)}`)
        lastTimeCellId = previousLastTimeCellId
    }
    
    if (startColumnIndex !== columnIndex && lastTimeCellId != previousLastTimeCellId) {
        lastTimeCellId = lastTimeCellId - timeStore.timeTableColumnLength * -(startColumnIndex - columnIndex)
        console.log(lastTimeCellId)
    }
    previousLastTimeCellId = lastTimeCellId
    timeCellIdsStore.updateTempColorIds(startTimeCellId, lastTimeCellId)
}

function handleMouseGone() {
    holdingDown = false;

    timeCellIdsStore.updateColorIds()
}

</script>

<template>
    <div class="timeTable">
        <div class="timeColumn" v-for="(day, dayKey, index) in timeTable"
            @mousedown="(e) => handleMouseDown(e, index)"
            @mouseover="(e) => handleMouseOver(e, index)"
            @mouseup="() => handleMouseGone()"
            >
            <span>{{ dayKey }}</span>
            <TimeCell
                class="timeCell2"
                v-for="(hour, hourKey, hourIndex) in day"
                :hour="hour"
                :hourKey="hourKey"
                :dayKey="dayKey"
                :index="index"
                :hourIndex="hourIndex"
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
