<script setup>
import Card from '../components/Card.vue'
import InputName from '../components/InputName.vue';
import TimeSelect from '../components/timeSelect/TimeSelect.vue';
import { ref } from "vue";
import ShowAvailibility from '../components/timeSelect/ShowAvailibility.vue';

defineProps({
    planningId: Number
})

const handleMouse = ref(null);

const nameCheck = ref(false)
const updateNameCheck = (newValue) => {
    nameCheck.value = newValue
}
</script>

<template>
    <div id="container" 
    @mouseup="() => handleMouse?.handleMouseGone()"
    @mouseleave="() => handleMouse?.handleMouseGone()">
        <Card v-if="!nameCheck" title="Input your name">
            <InputName nameCheck="nameCheck" @updateNameCheck="updateNameCheck" />
        </Card>
        <Card v-if="nameCheck" title="Your Availibility">
            <TimeSelect ref="handleMouse" />
        </Card>
        <Card title="Group Availibility">
            <ShowAvailibility />
        </Card>
    </div>
    
</template>

<style scoped>
    #container {
        display: flex;
        width: 100vw;
        min-height: 100vh;
        justify-content: center;
        align-items: center;
    }
</style>