<script setup>
    import Card from '../components/Card.vue'
    import InputName from '../components/InputName.vue';
    import TimeSelect from '../components/timeSelect/TimeSelect.vue';
    import { onBeforeMount, ref, computed } from 'vue';
    import ShowAvailability from '../components/timeSelect/ShowAvailability.vue';
    import ColorPicker from '../components/ColorPicker.vue';
    import PlannerMenu from '../components/PlannerMenu.vue';
    import TimeTable from '../components/timeSelect/TimeTable.vue'
    import _ from 'lodash'
    import { getAvailability, getPlanning, sendAvailability, urlId} from '../snippets/fetchCalls';
    import { timeRangesToCells } from '../snippets/cellsToTimeRanges';


    defineProps({
        planningId: Number
    })

    const name = ref("")
    const planning = ref(null)
    const availability = ref(null)
    const personCells = computed(()=>{
        if(!name.value) return null

        const personAvailability = availability.value.filter(person=>person.name===name.value)[0]
        if(!personAvailability) return {}
        return timeRangesToCells(personAvailability.times, 15)
    })
    const maxAvailabilityCells = ref(null)
    // computed(()=>{
    //     if(!availability.value) return null
    //     return availabilitiesToMaxAvailability(availability.value)
    // })

    onBeforeMount(()=>{
        getPlanning().then(res=>planning.value = res)
        getAvailability().then((res)=>{
            availability.value = res
            maxAvailabilityCells.value = availabilitiesToMaxAvailability(res)
        })
        ;(new EventSource(`${import.meta.env.VITE_API_ENDPOINT}planning/${urlId()}/sse`)).onmessage = ({data})=>{
            maxAvailabilityCells.value = null//availabilitiesToMaxAvailability(JSON.parse(data))
        }
    })

    function availabilitiesToMaxAvailability(availabilities){
        let cells = {}
        for(const person of availabilities){
            const personCells = timeRangesToCells(person.times, 15)

            if(!_.size(cells)) cells = personCells
            else cells = _.pick(cells, _.intersection(Object.keys(cells), Object.keys(personCells)))
        }
        return cells
    }

    function saveSelection(cells){        
        sendAvailability(name.value, cells)
    }
</script>

<template>
    <!-- <div id="container" 
    @mouseup="() => handleMouse?.handleMouseGone()"
    @mouseleave="() => handleMouse?.handleMouseGone()">
        <PlannerMenu />
        
        <Card v-if="nameCheck" title="Your Availability">
            <TimeSelect ref="handleMouse" />
        </Card>
        <Card title="Group Availability">
            <ShowAvailability />
        </Card>
    </div> -->
    <Card v-if="!name" title="Input your name">
        <InputName nameCheck="nameCheck" @updateNameCheck="_name=>name=_name" />
    </Card>
    <TimeTable v-if="planning && name && personCells !== null" 
        :editable="true" 
        :startDate="planning.startDate" 
        :endDate="planning.endDate" 
        :timeInterval="15"
        :onEdited="saveSelection"
        :cells="personCells"
    />
    <TimeTable v-if="planning && maxAvailabilityCells !== null" 
        :editable="false" 
        :startDate="planning.startDate" 
        :endDate="planning.endDate" 
        :timeInterval="15" 
        :cells="maxAvailabilityCells"
    />
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