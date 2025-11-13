<script setup>
import dayjs from 'dayjs'
import { Calendar, DatePicker } from 'v-calendar';
import { ref } from 'vue';

const date = ref({
    start: new Date(),
    end: new Date()
})

function createPlanning() {
    console.log(dayjs(date.value.start).unix())
    console.log(dayjs(date.value.end).unix())
}

</script>

<template>
    <div id="container">
        <DatePicker
            v-model.range="date"
            mode="date"
            is-dark="isDark"
            color="green"
        />
        <button class="createButton" @click="createPlanning">create planning</button>
    </div>
</template>

<style scoped>
    #container {
        display: flex;
        flex-direction: column;
        width: 100vw;
        min-height: 100vh;
        justify-content: center;
        align-items: center;
    }

    .createButton {
        margin-top: 20px;
        font-size: 1.2em;
    }
</style>