<script setup>
import TimeCell from './TimeCell.vue';
import { useTimeStore, useTimeCellIdsStore } from '../../store/store';
import { storeToRefs } from 'pinia';
import { useMouseHold } from '../../snippets/mouse';
import { ref, provide } from "vue";
import { router } from "../../router.js";

// Stores
const timeStore = useTimeStore()
const timeCellIdsStore = useTimeCellIdsStore()
const { timeTable } = storeToRefs(timeStore)

// States
const isMouseDown = useMouseHold()
const globalIdCounter = ref(-4)
const startColumnIndex = ref(-1)
const startTimeCellId = ref(-1)
const previousLastTimeCellId = ref(-1)
const isHoldingDown = ref(false)

// Provide
provide("getId", getId)

function getId() {
  globalIdCounter.value += 4
  return globalIdCounter.value
}

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
    timeCellIdsStore.updateTempColorIds(startTimeCellId.value, startTimeCellId.value)
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
    timeCellIdsStore.updateTempColorIds(startTimeCellId.value, lastTimeCellId)    
}

function handleMouseGone() {
    if (startTimeCellId.value == -1 || !isHoldingDown.value) return;
    
    isHoldingDown.value = false;
    timeCellIdsStore.updateColorIds()

    setTimeCellIsActiveInJson(timeCellIdsStore.timeCellTempDeleteColorIds, false)
    setTimeCellIsActiveInJson(timeCellIdsStore.timeCellColorIds, true)
    timeCellIdsStore.timeCellTempDeleteColorIds.clear()

    sendAvailability()
}

function setTimeCellIsActiveInJson(cellIds, isActive) {
    const days = timeTable.value;
    const dayKeys = Object.keys(days)
    const dayKey = dayKeys[startColumnIndex.value];
    const day = days[dayKey];

    for (const cellId of cellIds) {
        const { cellBlock, cellIndex } = parseCellId(cellId)
        const hourKey = Object.keys(day)[cellBlock];
        const subHourKey = Object.keys(day[hourKey])[cellIndex];
        
        day[hourKey][subHourKey].checked = isActive;
    }
}

function parseCellId(cellId) {
    const betweenHours = 4 //15 minutes
    const columnNumber = Math.floor(cellId / timeStore.timeTableColumnLength)
    const cellBlock = Math.floor((cellId - columnNumber * timeStore.timeTableColumnLength) / betweenHours);
    const cellIndex = (cellId - columnNumber * timeStore.timeTableColumnLength) % betweenHours;
    return { cellBlock, cellIndex }
}

function readAvailableTimes() {
    const allTimes = Object.values(timeTable.value);
    const ranges = [];
    let start = null;
    let previous = null;

    allTimes.forEach((day) => {
        Object.values(day).forEach((hour) => {
            Object.values(hour).forEach((time, i) => {
                if (time.checked && start === null) start = time.timestampStart
                if (!time.checked && start !== null) {
                    ranges.push({startTime: start, endTime: previous});
                    start = null;
                }
                previous = time.timestampEnd
             })
        })
    });

    if (start != null) ranges.push({startTime: start, endTime: previous})

    return ranges;
}

async function sendAvailability() {
    const availableTimes = readAvailableTimes()
    const url = router.currentRoute._value

    const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}planning/${url.params.planningId}/availability/create`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: timeStore.name,
            times: availableTimes
        })
    });
}

defineExpose({
  handleMouseGone
});

</script>

<template>
    <div class="timeTable">
        <div class="timeColumn" v-for="(day, dayKey, index) in timeTable"
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
