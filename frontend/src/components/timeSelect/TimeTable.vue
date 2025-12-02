<script setup>
    import dayjs from 'dayjs'
    import _ from 'underscore'
    import TimeCell from './TimeCell.vue'
    import {ref} from 'vue'

    const props = defineProps([
        "startDate",
        "endDate",
        "timeInterval",
        "editable",
        "onEdited"
    ])

    const startDate = dayjs.unix(props.startDate).set("hour", 0).set("minute", 0).set("second", 0)
    const endDate   = dayjs.unix(props.endDate).set("hour", 0).set("minute", 0).set("second", 0)
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
        console.log("down")
        cells.value[cell.startTime].selected = !cell.selected
        firstCell = cells.value[cell.startTime]
    }
    
    function onMouseOver(currentCell){
        if(!firstCell) return;

        const selectionStartTime = dayjs.unix(Math.min(firstCell.startTime, currentCell.startTime))
        const selectionEndTime = dayjs.unix(Math.max(firstCell.endTime, currentCell.endTime))

        _.each(cells.value, (cell)=>{
            const startTime = dayjs.unix(cell.startTime)
            const endTime = dayjs.unix(cell.endTime)

            const isBeforeSelection = startTime.isBefore(selectionStartTime) || startTime.hour()*100+startTime.minute() < selectionStartTime.hour()*100+selectionStartTime.minute()
            const isAfterSelection = endTime.isAfter(selectionEndTime) || endTime.hour()*100+endTime.minute() > selectionEndTime.hour()*100+selectionEndTime.minute()
            // const timeIsBeforeSelection = (startTime.hour()*100+startTime.minute() < firstCellStartTime.hour()*100+firstCellStartTime.minute())
            // const timeIsAfterSelection = (endTime.hour()*100+endTime.minute() > currentCellEndTime.hour()*100+currentCellEndTime.minute())

            const selected = !(isBeforeSelection || isAfterSelection)
            // if(!selected) return;

            cell.selected = selected
        })
    }

    function onMouseUp(currentCell){
        firstCell = null
        props.onEdited(cells)
    }
</script>

<template>
    <section class="timeTable" :style="`
        grid-template-columns: repeat(${days.length+1}, 1fr)
        grid-template-rows: repeat(${hours.length * 4}, 1fr)
    `">
        <header class="days" :style="`grid-column: 2/${days.length+2}`">
            <div v-for="day in days" class="day" :innerHTML="day"></div>
        </header>
        <aside class="hours" :style="`grid-row: 2/${hours.length*4+2}`">
            <div v-for="hour in hours" class="hour">{{ hour }}</div>
        </aside>
        <TimeCell v-for="cell in cells"
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