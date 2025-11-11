<script setup>
import { storeToRefs } from 'pinia';
import { useTimeStore } from '../store/store';


const timeStore = useTimeStore()
const { name } = storeToRefs(timeStore)

</script>

<template>
    <div class="inputName">
        <span>name: </span>
        <input type="text" v-model="name"></input>
    </div>
    
</template>

<style scoped>
    .inputName {
        display: flex;
        flex-direction: column;
        align-items: start;
    }
</style>