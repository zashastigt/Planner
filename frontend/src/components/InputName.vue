<script setup>
import { storeToRefs } from 'pinia';
import { useTimeStore, useTimeCellIdsStore } from '../store/store';
import { router } from '../router.js'

const timeStore = useTimeStore()
const { name } = storeToRefs(timeStore)

async function requestUser() {
    const url = router.currentRoute._value
    const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}planning/${url.params.planningId}/availability/${timeStore.name}`);
    const availablilityTimes = await response.json()
    const timeCellIdsStore = useTimeCellIdsStore()

    timeCellIdsStore.enableIdsByTimestamps(availablilityTimes)
}

</script>

<template>
    <div class="inputName">
        <input type="text" v-model="name"></input>
        <button @click="requestUser()">
            <img src="../assets/loginWhite.png" />
        </button>
    </div>
    
</template>

<style scoped>
    .inputName {
        display: flex;
        align-items: start;
    }

    .inputName input {
        height: 30px;
        border: none;
        font-size: 1em;
        border-radius: 0 0 0 20px;
        padding: 0 20px;
    }

    .inputName input:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    .inputName input:focus {
        outline: none;
    }

    .inputName button {
        height: 30px;
        border: none;
        width: 30px;
        background-color: rgb(110, 110, 110);
    }

    .inputName button:hover {
        background-color: rgba(255, 255, 255, 0.5);
    }

    .inputName button:active {
        background-color: rgb(81, 81, 81);
    }

    .inputName button img {
        height: 18px;
        margin-right: auto;
        margin-top: 5px;
    }
</style>