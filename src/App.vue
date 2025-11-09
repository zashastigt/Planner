<script setup>
import InputName from './components/InputName.vue';
import TimeSelect from './components/timeSelect/TimeSelect.vue';


</script>

<template>
    <div id="container">
        <InputName />
        <TimeSelect />
    </div>
    
</template>

<style scoped>
    #container {
        display: flex;
        align-items: flex-start;
    }
</style>
