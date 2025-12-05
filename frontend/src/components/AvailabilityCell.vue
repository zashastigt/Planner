<script setup>
import { storeToRefs } from 'pinia';
import { useColorStore } from '../store/store';
import dayjs from 'dayjs';
import { ref } from 'vue';

const props = defineProps([
    'hour',
    'hourKey',
    'dayKey',
    'index',
    'hourIndex',
])

const colorStore = useColorStore()
const { color } = storeToRefs(colorStore)

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
                @click="() => console.log(selected.userList)"
                :key="index"
                :style="{ backgroundColor: selected.checked ? color : 'transparent'}">
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
    border: var(--table-border-color) solid 1px;
    border-bottom: none;
}

.timeCell {
    height: 8px;
    width: 40px;
}

.timeCell:nth-child(3) {
    border-top: var(--table-border-color) dashed 1px;
}

.timeCell:nth-child(4) {
    border-bottom: var(--table-border-color) solid 1px;
}

.hourText {
    margin-top: -11px;
    margin-right: 5px;
}
</style>