<script setup>
    import Card from '../components/Card.vue'
    import InputName from '../components/InputName.vue';
    import { onBeforeMount, ref, computed } from 'vue';
    import ColorPicker from '../components/ColorPicker.vue';
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

    onBeforeMount(()=>{
        getPlanning().then(res=>planning.value = res)
        getAvailability().then((res)=>{
            availability.value = res
            maxAvailabilityCells.value = availabilitiesToMaxAvailability(res)
        })
        ;(new EventSource(`${import.meta.env.VITE_API_ENDPOINT}planning/${urlId()}/sse`)).onmessage = ({data})=>{
            maxAvailabilityCells.value = availabilitiesToMaxAvailability(JSON.parse(data))
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
    <section class="availability">
        <section class="side left">
            <Card v-if="!name" title="Input your name">
                <InputName nameCheck="nameCheck" @updateNameCheck="_name=>name=_name" />
            </Card>
            <Card v-if="planning && name && personCells !== null" title="Your availability">
                <TimeTable 
                    :editable="true" 
                    :startDate="planning.startDate" 
                    :endDate="planning.endDate" 
                    :timeInterval="15"
                    :onEdited="saveSelection"
                    :cells="personCells"
                />
            </Card>
        </section>
        <section class="side right">
            <Card v-if="planning && maxAvailabilityCells !== null" title="Group availability">
                <TimeTable 
                    :editable="false" 
                    :startDate="planning.startDate" 
                    :endDate="planning.endDate" 
                    :timeInterval="15" 
                    :cells="maxAvailabilityCells"
                />
            </Card>
            <ColorPicker />
        </section>
    </section>
</template>

<style scoped>
    .availability {
        display: flex;
        width: 100vw;
        height: 100vh;
        justify-content: center;
        align-items: center;

        .side {
            display: flex;
            align-items: flex-start;
            width: 50%;
            padding: 0 30px;
            height: max-content;
            &.left {
                justify-content: flex-end;
            }
            &.right {
                justify-content: flex-start;
            }
        }
    }
</style>