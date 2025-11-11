<script setup>
import InputName from './components/InputName.vue';
import TimeSelect from './components/timeSelect/TimeSelect.vue';
import { ref } from "vue";


const handleMouse = ref(null);

</script>

<template>
    <div id="container" 
    @mouseup="() => handleMouse.handleMouseGone()"
    @mouseleave="() => handleMouse.handleMouseGone()"
    >
        <InputName />
        <TimeSelect ref="handleMouse" />
    </div>
    
</template>

<style scoped>
    #container {
        display: flex;
        align-items: flex-start;
        width: 100vw;
        min-height: 100vh;
        justify-content: center;
        align-items: center;
    }
</style>
