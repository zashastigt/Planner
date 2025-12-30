<script setup>
    import Card from '../components/Card.vue'
    import InputName from '../components/InputName.vue';
    import { onBeforeMount, ref} from 'vue';
    import ColorPicker from '../components/ColorPicker.vue';
    import TimeTable from '../components/timeSelect/TimeTable.vue'
    import NotAvailableButton from '../components/NotAvailableButton.vue';
    import _ from 'lodash'
    import { getAvailability, getPlanning, sendAvailability, urlId} from '../snippets/fetchCalls';
    import { timeRangesToCells } from '../snippets/cellsToTimeRanges';
    import { watch } from 'vue';

    defineProps({
        planningId: Number
    })

    const name = ref("")
    const planning = ref(null)
    const availability = ref(null)
    const personCells = ref({})
    const maxAvailabilityCells = ref(null)

    onBeforeMount(()=>{
        getPlanning().then(res=>planning.value = res);

        getAvailability().then((res)=>{
            availability.value = res
            maxAvailabilityCells.value = availabilitiesToMaxAvailability(res)
        })
        ;(new EventSource(`${import.meta.env.VITE_API_ENDPOINT}planning/${urlId()}/sse`)).onmessage = ({data})=>{
            maxAvailabilityCells.value = availabilitiesToMaxAvailability(JSON.parse(data))
        }    
    })

    watch(()=>name.value, ()=> {
        if(!name.value) return null
        
        const personAvailability = availability.value.filter(person=>person.name===name.value)[0]
        if(!personAvailability) return personCells.value = {};
        personCells.value = timeRangesToCells(personAvailability.times, 15)
    })

    function availabilitiesToMaxAvailability(availabilities){
        let cells = {}
        for(const person of availabilities){
            const personCells = timeRangesToCells(person.times, 15)

            for (const cell in personCells) {
                if(!cells[cell]) {
                    cells[cell] = {
                        startTime: personCells[cell].startTime,
                        endTime: personCells[cell].endTime,
                        names: []
                    }

                }
                cells[cell].names.push(person.name);
            }
        }
        
        for (const cell in cells) {
            cells[cell].selected = cells[cell].names.length === availabilities.length
        }

        return cells
    }

    function saveSelection(cells){        
        sendAvailability(name.value, cells)
    }

    function sendEmptySelection() {
        personCells.value = {}
        sendAvailability(name.value, {})
    }
</script>

<template>
    <section class="availability">
        <section class="side left">
            <NotAvailableButton v-if="planning && name && personCells !== null" :saveSelection="sendEmptySelection" />
            <Card v-if="!name" title="Input your name">
                <InputName nameCheck="nameCheck" @updateNameCheck="_name=>name=_name" />
            </Card>
            <Card v-if="planning && name && personCells !== null" title="Your availability">
                <TimeTable 
                    :startDate="planning.startDate" 
                    :endDate="planning.endDate" 
                    :timeInterval="15"
                    :cells="personCells"
                    @edited="saveSelection"
                />
                
            </Card>
        </section>
        <section class="side right">
            <Card v-if="planning && maxAvailabilityCells !== null" title="Group availability">
                <TimeTable 
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