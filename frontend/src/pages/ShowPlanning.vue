<script setup>
import Card from '../components/Card.vue'
import InputName from '../components/InputName.vue';
import TimeSelect from '../components/timeSelect/TimeSelect.vue';
import { ref } from "vue";
import ShowAvailibility from '../components/timeSelect/ShowAvailibility.vue';
import ColorPicker from '../components/ColorPicker.vue';

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
        <div class="left side">
            <Card v-if="!nameCheck" title="Input your name">
                <InputName nameCheck="nameCheck" @updateNameCheck="updateNameCheck" />
            </Card>
            <Card v-if="nameCheck" title="Your Availibility">
                <TimeSelect ref="handleMouse" />
            </Card>
        </div>
        <div class="right side">
            <Card title="Group Availibility">
                <ShowAvailibility />
            </Card>
            <ColorPicker />
        </div>
        
    </div>
    
</template>

<style scoped>
    #container {
        display: flex;
        width: 100vw;
        height: 100vh;
        justify-content: center;
    }

    .side {
        display: flex;
        align-items: flex-start;
        width: 50%;
        padding: 0 30px;
        padding-top: 15%;
    }

    .left {
        justify-content: flex-end;
    }

    .right {
        justify-content: flex-start;
    }
</style>