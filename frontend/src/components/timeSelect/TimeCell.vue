<script setup>
import { useTimeCellIdsStore } from '../../store/store';
import { inject } from "vue";

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

// Inject
const getId = inject("getId")
const childId = getId()

</script>

<template>
    <div class="tab">
        <span class="hourText" v-if="index === 0">{{ hourKey }}</span>
        <div class="cellBlock">
            <div
                class="timeCell"
                v-for="(selected, index) in hour"
                :id="childId + index"
                :key="index"
                :style="{ backgroundColor: timeCellIdsStore.timeCellColorIds.has(childId + index) || timeCellIdsStore.timeCellTempColorIds.has(childId + index) ? '#17aa41' : 'transparent'}">
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