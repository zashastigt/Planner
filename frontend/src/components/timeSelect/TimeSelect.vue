<script setup>
import TimeCell from './TimeCell.vue';
import { useTimeStore, useTimeCellIdsStore } from '../../store/store';
import { storeToRefs } from 'pinia';
import { useMouseHold } from '../../snippets/mouse';
import { sendAvailability } from '../../snippets/fetchCalls.js';
import { ref } from "vue";

// Stores
const timeStore = useTimeStore()
const timeCellIdsStore = useTimeCellIdsStore()
const { editableTimeTable } = storeToRefs(timeStore)

// States
const isMouseDown = useMouseHold()
const startColumnIndex = ref(-1)
const startTimeCellId = ref(-1)
const previousLastTimeCellId = ref(-1)
const isHoldingDown = ref(false)

function handleMouseDown(firstTimeCell, columnIndex) {
    startColumnIndex.value = columnIndex;
    
    if (!firstTimeCell.target.classList.contains("timeCell")) {
        startTimeCellId.value = -1
    }
    else {
        startTimeCellId.value = Number(firstTimeCell.target.id)
    }

    previousLastTimeCellId.value = startTimeCellId.value
    isHoldingDown.value = true;
    timeCellIdsStore.updateTempIds(startTimeCellId.value, startTimeCellId.value)
}

function handleMouseOver(lastTimeCell, columnIndex) {
    if (!isHoldingDown.value || !lastTimeCell.target.classList.contains("timeCell")) return;

    let lastTimeCellId = Number(lastTimeCell.target.id)

    if (!lastTimeCellId && lastTimeCellId != 0) {
        lastTimeCellId = previousLastTimeCellId.value
    }
   
    // Cross column selection
    if (startColumnIndex.value !== columnIndex && lastTimeCellId != previousLastTimeCellId.value) {
        lastTimeCellId = lastTimeCellId - timeStore.timeTableColumnLength * -(startColumnIndex.value - columnIndex)
    }

    if (startTimeCellId.value == -1 && lastTimeCellId != -1) {
        startTimeCellId.value = lastTimeCellId
    }
    
    previousLastTimeCellId.value = lastTimeCellId
    timeCellIdsStore.updateTempIds(startTimeCellId.value, lastTimeCellId)    
}

function handleMouseGone() {
    if (startTimeCellId.value == -1 || !isHoldingDown.value) return;
    
    isHoldingDown.value = false;
    timeCellIdsStore.mergeTempIds()

    timeCellIdsStore.setJsonActive(timeCellIdsStore.timeCellTempDeleteIds, false)
    timeCellIdsStore.setJsonActive(timeCellIdsStore.timeCellIds, true)
    timeCellIdsStore.timeCellTempDeleteIds.clear()

    sendAvailability(timeStore.name, editableTimeTable)
}

defineExpose({
  handleMouseGone
});

</script>

<template>
    <div class="timeTable">
        <div class="timeColumn" v-for="(day, dayKey, index) in editableTimeTable"
            @mousedown="(e) => handleMouseDown(e, index)"
            @mouseover="(e) => handleMouseOver(e, index)">
            <span class="day">{{ dayKey }}</span>
            <TimeCell
                v-for="(hour, hourKey, hourIndex) in day"
                :hour="hour"
                :hourKey="hourKey"
                :dayKey="dayKey"
                :index="index"
                :hourIndex="hourIndex"
                :isMouseDown="isMouseDown"/>
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
