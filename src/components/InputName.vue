<script setup>
import { storeToRefs } from 'pinia';
import { useTimeStore } from '../store/store';

const timeStore = useTimeStore()
const { name } = storeToRefs(timeStore)

</script>

<template>
    <div class="inputName">
        <input type="text" v-model="name"></input>
        <button @click="() => console.log('pressed')">
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
    }

    .inputName button:hover {
        background-color: rgba(255, 255, 255, 0.5);
    }

    .inputName button:active {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .inputName button img {
        height: 18px;
        margin-right: auto;
        margin-top: 5px;
    }
</style>