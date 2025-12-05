<script setup>
import TimeCell from './TimeCell.vue';
import { useTimeStore, useCellsStore } from '../../store/store';
import { storeToRefs } from 'pinia';
import { useMouseHold } from '../../snippets/mouse';
import { sendAvailability } from '../../snippets/fetchCalls.js';
import { ref } from "vue";

// Stores
const timeStore = useTimeStore()
const cellsStore = useCellsStore()
const { editableTimeTable } = storeToRefs(timeStore)

// States
const isMouseDown = useMouseHold()
const startCell = ref(-1)
const isHoldingDown = ref(false)

function handleMouseDown(cell) {
    startCell.value = cell.target.id

    isHoldingDown.value = true;

    cellsStore.addTempCells(startCell.value, startCell.value)
}

function handleMouseOver(cell) {
    if (!isHoldingDown.value) return;

    cellsStore.addTempCells(startCell.value, cell.target.id)
}

function handleMouseGone() {
    if (startCell.value == -1 || !isHoldingDown.value) return;
    
    isHoldingDown.value = false;
    cellsStore.mergeTempCells()

    // cellsStore.setJsonActive(cellsStore.deleteCells, false)
    // cellsStore.setJsonActive(cellsStore.cells, true)
    // cellsStore.deleteCells.clear()

    //sendAvailability(timeStore.name, editableTimeTable)
}

defineExpose({
  handleMouseGone
});

</script>

<template>
    <div class="timeTable">
        <div class="timeColumn" v-for="(day, dayKey, index) in editableTimeTable"
            @mousedown="(e) => handleMouseDown(e)"
            @mouseover="(e) => handleMouseOver(e)">
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
        color: var(--table-border-color);
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
