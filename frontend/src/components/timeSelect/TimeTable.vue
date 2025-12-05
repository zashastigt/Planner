<script setup>
    import dayjs from 'dayjs'
    import minmax from 'dayjs/plugin/minMax'
    import _ from 'lodash'
    import TimeCell from './TimeCell.vue'
    import {ref, onBeforeUpdate, onBeforeMount, onMounted} from 'vue'

    dayjs.extend(minmax)

    const props = defineProps([
        "startDate",
        "endDate",
        "timeInterval",
        "editable",
        "cells",
        "onEdited"
    ])

    const startDate = dayjs.unix(props.startDate).startOf('day')
    const endDate   = dayjs.unix(props.endDate).startOf('day')
    const cells = ref({})

    const hours = []
    let currentDate = startDate
    while(currentDate.diff(endDate) < 0){
        
        const hour = currentDate.format("HH:00")
        if(!hours.includes(hour)) hours.push(hour)

        const newDate = currentDate.add(props.timeInterval, "minute")
        cells.value[currentDate.unix()] = {
            startTime: currentDate.unix(),
            endTime: newDate.unix(),
            selected: false
        }
        currentDate = newDate 
    }

    let availabilityLoaded = false
    onMounted(()=>_.merge(cells.value, props.cells))
    // onBeforeUpdate(()=>{
    //     if(availabilityLoaded) return;

       
    //     availabilityLoaded = true;
    // })

    let days = []
    let lastDay = ""
    days = _.reduce(cells.value, (carry, cell)=>{
        const startTime = dayjs.unix(cell.startTime)
        const currentDay = `<span>${startTime.format("DD")}</span><span>${startTime.format("ddd")}</span>` 
        if(currentDay === lastDay) return carry

        lastDay = currentDay
        return [
            ...carry,
            currentDay
        ]
    }, [])


    let firstCell = null
    function onMouseDown(cell){
        cells.value[cell.startTime].selected = !cell.selected
        firstCell = cells.value[cell.startTime]
        this.onMouseOver(firstCell)
    }
    
    let temporaryCells = ref({})
    function onMouseOver(currentCell){
        if(!firstCell) return;

        temporaryCells.value = _.cloneDeep(cells.value)

        const unixFirstCell = dayjs.unix(firstCell.startTime)
        const unixCurrentCell =  dayjs.unix(currentCell.startTime)
        
        const selectionSmallestTime = Math.min(unixFirstCell.format("HHmm"), unixCurrentCell.format("HHmm"))
        const selectionLargestTime = Math.max(unixFirstCell.format("HHmm"), unixCurrentCell.format("HHmm"))
        
        const selectionSmallestDate = dayjs.min(unixFirstCell,unixCurrentCell)
        const selectionLargestDate = dayjs.max(unixFirstCell,unixCurrentCell)
        
        const startHoursAndMinutes = seperateHourAndMinutes(selectionSmallestTime)
        const selectionStartDate = selectionSmallestDate.hour(startHoursAndMinutes[0]).minute(startHoursAndMinutes[1])

        const endHoursAndMinutes = seperateHourAndMinutes(selectionLargestTime)
        const selectionEndDate = selectionLargestDate.hour(endHoursAndMinutes[0]).minute(endHoursAndMinutes[1])
        
        _.each(temporaryCells.value, (cell)=>{
            const startTime = dayjs.unix(cell.startTime)
            const isBeforeSelection = startTime.isBefore(selectionStartDate) || startTime.format("HHmm") < selectionStartDate.format("HHmm")
            const isAfterSelection = startTime.isAfter(selectionEndDate) || startTime.format("HHmm") > selectionEndDate.format("HHmm")

            const selected = !(isBeforeSelection || isAfterSelection)

            if(!selected) cell = undefined
            else cell.selected = firstCell.selected
        })

        temporaryCells.value = _.merge(_.cloneDeep(cells.value), _.pickBy(temporaryCells.value, cell=>cell.selected == firstCell.selected))
    }

    function onMouseUp(){
        if(!firstCell) return;
        firstCell = null
        cells.value = temporaryCells.value
        temporaryCells.value = {}
        if(props.onEdited) props.onEdited(cells.value)
    }

    function seperateHourAndMinutes(time) {
        time = String(time)
        return [time.slice(0, -2), time.slice(-2)]
    }
</script>

<template>
    <section class="timeTable"
        @mouseleave="()=>onMouseUp(null)"
        :style="`
            grid-template-columns: repeat(${days.length+1}, 1fr)
            grid-template-rows: repeat(${hours.length * 4}, 1fr)
        `"
    >
        <header class="days" :style="`grid-column: 2/${days.length+2}`">
            <div v-for="day in days" class="day" :innerHTML="day"></div>
        </header>
        <aside class="hours" :style="`grid-row: 2/${hours.length*4+2}`">
            <div v-for="hour in hours" class="hour">{{ hour }}</div>
        </aside>
        <TimeCell v-for="cell in _.size(temporaryCells) ? temporaryCells : cells"
            :key="cell.startTime"
            :startTime="cell.startTime"
            :endTime="cell.endTime"
            :selected="cell.selected"
            :onMouseDown="editable ? onMouseDown : null"
            :onMouseOver="editable ? onMouseOver : null"
            :onMouseUp="editable ? onMouseUp : null"
        />
    </section>
</template>

<style scoped>
    .timeTable{
        display: grid;
        grid-auto-flow: column;
        user-select: none;
        .days{
            display: grid;
            grid-template-columns: subgrid;
            .day{
                display: grid;
                border-bottom: 1px solid white;
                line-height: 1;
                gap: 5px;
            }
        }
        .hours{
            display: grid;
            grid-template-rows: subgrid;
            line-height: 1;
            border-right: 1px solid white;
            padding-right: 5px;
            .hour{
                grid-row: span 4
            }
        }
    }
</style>