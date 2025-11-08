<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const isMouseDown = ref(false);
const props = defineProps([
    'hour',
    'hourKey',
    'dayKey',
    'updateTime'
])

function handleMouseOver(selected, index) {
    if (isMouseDown.value) {
        changeColor(selected, index);
    }
}

function handleMouseDown() {
    isMouseDown.value = !isMouseDown.value;
}

function changeColor(selected, index) {  
    selected = !selected;
    props.updateTime(props.dayKey, props.hourKey, index, selected)
}

onMounted(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', () => isMouseDown.value = false);
});

onUnmounted(() => {
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', () => isMouseDown.value = false);
});
</script>

<template>
    <div class="tab">
        <span class="hourText" v-if="dayKey === 'Mon'">{{ hourKey }}</span>
        <div class="cellBlock">
            <div
                class="timeCell"
                v-for="(selected, index) in hour"
                :key="index"
                @mouseover="() => handleMouseOver(selected, index)"
                :style="{ backgroundColor: selected ? 'red': 'transparent'}">
            </div>
            
        </div>
    </div>
</template>

<style scoped>
.tab {
    display: flex;
    justify-content: end;
    align-items: flex-end;
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
</style>