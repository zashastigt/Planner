<script setup>

const props = defineProps([
    'hour',
    'hourKey',
    'dayKey',
    'index',
    'hourIndex',
])

</script>

<template>
    <div class="tab">
        <span class="hourText" v-if="index === 0">{{ hourKey }}</span>
        <div class="cellBlock">
            <div
                class="timeCell"
                v-for="(selected, index) in hour"
                @click="() => console.log(selected)"
                :key="index"
                :style="{ backgroundColor: selected.checked ? '#17aa41' : 'transparent'}">
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

.hourText {
    margin-top: -11px;
    margin-right: 5px;
}
</style>