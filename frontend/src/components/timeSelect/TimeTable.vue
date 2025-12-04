<script setup>
    import dayjs from 'dayjs'
    import minmax from 'dayjs/plugin/minMax'
    import dayjsTimePlugin from '../../snippets/dayjsTimePlugin'
    import _, { first } from 'lodash'
    import TimeCell from './TimeCell.vue'
    import {ref} from 'vue'

    dayjs.extend(dayjsTimePlugin)
        .extend(minmax)

    const props = defineProps([
        "startDate",
        "endDate",
        "timeInterval",
        "editable",
        "onEdited"
    ])

    const startDate = dayjs.unix(props.startDate).time(0)
    const endDate   = dayjs.unix(props.endDate).time(0)
    const cells = ref({})

    let currentDate = startDate
    const hours = []
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

    let lastDay = ""
    const days = _.reduce(cells.value, (carry, cell)=>{
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

        const selectionSmallestTime = dayjs.min(dayjs.unix(firstCell.startTime).time(), dayjs.unix(currentCell.startTime).time())
        const selectionLargestTime = dayjs.max(dayjs.unix(firstCell.startTime).time(), dayjs.unix(currentCell.startTime).time())
        
        const selectionSmallestDate = dayjs.min(dayjs.unix(firstCell.startTime), dayjs.unix(currentCell.startTime))
        const selectionLargestDate = dayjs.max(dayjs.unix(firstCell.startTime), dayjs.unix(currentCell.startTime))
        
        const selectionStartDate = selectionSmallestDate.time(selectionSmallestTime) 
        const selectionEndDate = selectionLargestDate.time(selectionLargestTime)
        
        _.each(temporaryCells.value, (cell)=>{
            const startTime = dayjs.unix(cell.startTime)

            const isBeforeSelection = startTime.isBefore(selectionStartDate) || startTime.time().isBefore(selectionStartDate.time())
            const isAfterSelection = startTime.isAfter(selectionEndDate) || startTime.time().isAfter(selectionEndDate.time())

            const selected = !(isBeforeSelection || isAfterSelection)

            if(!selected) cell = undefined
            else cell.selected = firstCell.selected
        })

        temporaryCells.value = _.merge(_.cloneDeep(cells.value), _.pickBy(temporaryCells.value, cell=>cell.selected == firstCell.selected))

    }

    function onMouseUp(currentCell){
        if(!firstCell) return;
        firstCell = null
        cells.value = temporaryCells.value
        temporaryCells.value = {}
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