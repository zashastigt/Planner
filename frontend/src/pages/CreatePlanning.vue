<script setup>
import dayjs from 'dayjs'
import { DatePicker } from 'v-calendar';
import { ref } from 'vue';
import { router } from '../router.js';

const date = ref({
    start: new Date(),
    end: new Date()
})

async function createPlanning() {
    const response = await fetch(import.meta.env.VITE_API_ENDPOINT + "planning/create", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            startDate: dayjs(date.value.start).unix(),
            endDate: dayjs(date.value.end).unix()
        })
    });
    const planninId = await response.json();
    router.push({ path: `/${planninId.id}`})
    

}

</script>

<template>
    <div id="container">
        <DatePicker
            v-model.range="date"
            mode="date"
            is-dark="isDark"
            color="green"
            :first-day-of-week="2"
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