<script setup>
    import dayjs from 'dayjs'
    import minmax from 'dayjs/plugin/minMax'
    import _ from 'lodash'
    import TimeCell from './TimeCell.vue'
    import {ref, watch, onBeforeMount, computed, getCurrentInstance} from 'vue'
    import isBetween from 'dayjs/plugin/isBetween'

    dayjs.extend(minmax)
    dayjs.extend(isBetween)

    const props = defineProps([
        "startDate",
        "endDate",
        "timeInterval",
        "cells"
    ])

    const emit = defineEmits([
        "edited",
    ])

    
    const startDate = dayjs.unix(props.startDate).startOf('day')
    const endDate   = dayjs.unix(props.endDate).add(1, 'day').startOf('day')
    const cells = ref({})
    const editable = computed(()=>getCurrentInstance()?.vnode.props.onEdited)

    const hours = []
    let currentDate = startDate
    while(currentDate.diff(endDate) < 0){
        
        const hour = currentDate.format("HH:00")
        if(!hours.includes(hour)) hours.push(hour)

        const newDate = currentDate.add(props.timeInterval, "minute")
        cells.value[currentDate.unix()] = {
            startTime: currentDate.unix(),
            endTime: newDate.unix(),
            selected: false,
            names: []
        }
        currentDate = newDate 
    }
    const emptyCells = cells.value

    watch(()=>props.cells, ()=>{
        cells.value = mergeCells(emptyCells, props.cells)
    })
    onBeforeMount(()=>cells.value = mergeCells(emptyCells, props.cells))

    function mergeCells(mainCells, selectedCells) {
        selectedCells = _.pickBy(selectedCells, (cell) => dayjs.unix(cell.startTime).isBetween(startDate, endDate, 'hour', []))
        return _.merge(_.cloneDeep(mainCells), selectedCells)
    }

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
        emit("edited", cells.value)
    }

    function seperateHourAndMinutes(time) {
        time = String(time)
        return [time.slice(0, -2), time.slice(-2)]
    }

    function onMouseOverAvailabilities(cell) {
        console.log(cell.names)
    }
</script>

<template>
    <section class="timeTable">
        <header class="days">
            <div v-for="day in days" class="day" :innerHTML="day"></div>
        </header>
        <aside class="hours">
            <div v-for="hour in hours" class="hour">{{ hour }}</div>
        </aside>
        <div class="cells"
            @mouseleave="()=>onMouseUp(null)"
        >
            <TimeCell v-for="cell in _.size(temporaryCells) ? temporaryCells : cells"
                :key="cell.startTime"
                :startTime="cell.startTime"
                :endTime="cell.endTime"
                :selected="cell.selected"
                @[editable&&'mouseDown']="cell=>onMouseDown(cell)"
                @[editable&&'mouseOver']="cell=>onMouseOver(cell)"
                @[editable&&'mouseUp']="cell=>onMouseUp(cell)"
                @[!editable&&'mouseOver']="onMouseOverAvailabilities(cell)"
            />
        </div>
    </section>
</template>

<style scoped>
    .timeTable{
        display: grid;
        grid-auto-flow: column;
        grid-template-columns:  v-bind('`repeat(${days.length+1}, max-content)`');
        grid-template-rows:     v-bind('`repeat(${hours.length*4}, max-content)`');
        user-select: none;
        padding: 10px;
        color: white;
        min-width: max-content;

        .days{
            display: grid;
            grid-template-columns: subgrid;
            grid-column: v-bind('`2/${days.length+2}`');
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
            position: sticky;
            left: 0px;
            background-color: var(--dark-gray);
            line-height: 1;
            padding: 0 5px 5px 10px;
            margin-left: -10px;
            margin-right: 5px;
            box-shadow: 3px 0px 3px var(--dark-gray);
            grid-row: v-bind('`1/${hours.length*4+2}`');
            .hour{
                grid-row: span 4;
                translate: 0 -25%;
            }
            &::before{
                content: "";
            }
        }

        .cells{
            display: grid;
            grid-auto-flow: column;
            grid-template-columns: subgrid;
            grid-template-rows: subgrid;
            grid-column: v-bind('`2/${days.length+2}`');
            grid-row: v-bind('`2/${hours.length*4+2}`');
            border-left: 1px solid white;
        }
    }
</style>