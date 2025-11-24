<script setup>
import { ref } from 'vue';
import { useTimeStore, useTimeCellIdsStore } from '../../store/store';
import dayjs from 'dayjs';

const props = defineProps([
    'hour',
    'hourKey',
    'dayKey',
    'index',
    'hourIndex',
    'isMouseDown'
])

// Stores
const timeCellIdsStore = useTimeCellIdsStore()
const timeStore = useTimeStore()

const localHour = ref(dayjs()
    .set('hour', props.hourKey.substring(0, 2))
    .set('minute', props.hourKey.substring(3, 5))
    .add(Number(dayjs().format().split('+')[1].substring(0, 2)), 'hour')
    .format('HH:mm'))
</script>

<template>
    <div class="tab">
        <span class="hourText" v-if="index === 0">{{ localHour }}</span>
        <div class="cellBlock">
            <div
                class="timeCell"
                v-for="(selected, index) in hour"
                :id="timeStore.editableTimeTable[props.dayKey][props.hourKey][index].timestampStart"
                :key="index"
                :style="{ backgroundColor: 
                    timeCellIdsStore.timeCellIds.has(timeStore.editableTimeTable[props.dayKey][props.hourKey][index].timestampStart) || 
                    timeCellIdsStore.timeCellTempIds.has(timeStore.editableTimeTable[props.dayKey][props.hourKey][index].timestampStart) ? 
                    '#17aa41' : 'transparent'}">
            </div>
            
        </div>
    </div>
</template>

<style scoped>
.tab {
    display: flex;
    justify-content: end;
    align-items: flex-start;
}

.cellBlock {
    border: white solid 1px;
    border-bottom: none;
}

.timeCell {
    height: 8px;
    width: 40px;
}

.timeCell:nth-child(3) {
    border-top: white dashed 1px;
}

.timeCell:nth-child(4) {
    border-bottom: white solid 1px;
}

.timeCell:hover {
    background-color: #17aa4155 !important;
}

.hourText {
    margin-top: -11px;
    margin-right: 5px;
}
</style>