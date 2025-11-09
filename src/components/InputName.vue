<script setup>
import { storeToRefs } from 'pinia';
import { useNameStore } from '../store/store';


const nameStore = useNameStore()
const { name } = storeToRefs(nameStore)

console.log(name.value);
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