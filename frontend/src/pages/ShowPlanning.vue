<script setup>
    import Card from '../components/Card.vue'
    import InputName from '../components/InputName.vue';
    import TimeSelect from '../components/timeSelect/TimeSelect.vue';
    import { onBeforeMount, ref } from 'vue';
    import ShowAvailability from '../components/timeSelect/ShowAvailability.vue';
    import ColorPicker from '../components/ColorPicker.vue';
    import PlannerMenu from '../components/PlannerMenu.vue';
    import TimeTable from '../components/timeSelect/TimeTable.vue'
    import { getAvailability, getPlanning } from '../snippets/fetchCalls';



    defineProps({
        planningId: Number
    })

    const handleMouse = ref(null);
    const nameCheck = ref(false)
    const updateNameCheck = (newValue) => {
        nameCheck.value = newValue
    }

    const planning = ref(null)

    onBeforeMount(async ()=>{
        planning.value = await getPlanning()
    })
</script>

<template>
    <!-- <div id="container" 
    @mouseup="() => handleMouse?.handleMouseGone()"
    @mouseleave="() => handleMouse?.handleMouseGone()">
        <PlannerMenu />
        <Card v-if="!nameCheck" title="Input your name">
            <InputName nameCheck="nameCheck" @updateNameCheck="updateNameCheck" />
        </Card>
        <Card v-if="nameCheck" title="Your Availability">
            <TimeSelect ref="handleMouse" />
        </Card>
        <Card title="Group Availability">
            <ShowAvailability />
        </Card>
    </div> -->
    <TimeTable v-if="planning" :editable="true" :startDate="planning.startDate" :endDate="planning.endDate" :timeInterval="15"/>
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