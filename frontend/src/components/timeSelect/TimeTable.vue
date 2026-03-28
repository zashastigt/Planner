<script setup>
    import dayjs from 'dayjs'
    import minmax from 'dayjs/plugin/minMax'
    import utc from 'dayjs/plugin/utc'
    import _ from 'lodash'
    import TimeCell from './TimeCell.vue'
    import {ref, watch, onBeforeMount, computed, getCurrentInstance, useTemplateRef} from 'vue'
    import isBetween from 'dayjs/plugin/isBetween'
    import { useSettingsStore } from '../../store/store'
    import { storeToRefs } from 'pinia'
    
    dayjs.extend(minmax)
    dayjs.extend(isBetween)
    dayjs.extend(utc)

    const props = defineProps([
        "startDate",
        "endDate",
        "timeInterval",
        "cells",
        "allPersons"
    ])

    const emit = defineEmits([
        "edited",
    ])

    const settingsStore = useSettingsStore()
    
    const startDate = dayjs.unix(props.startDate).startOf('day')
    const endDate   = dayjs.unix(props.endDate).add(1, 'day').startOf('day')
    const cells     = ref({})
    const editable  = computed(()=>getCurrentInstance()?.vnode.props.onEdited)
    const maxNames  = computed(()=>_.reduce(props.cells, (acc, cell)=>Math.max(cell.names?.length, acc), 0))
    
    const hours = []
    const hourInMinutes = 60
    let currentDate = startDate
    while(currentDate.diff(endDate) < 0){
        
        const hour = currentDate.format("HH:00")
        if(!hours.includes(hour)) hours.push(hour)

        const newDate = currentDate.add(props.timeInterval, "minute")
        
        const currentUnix = currentDate.unix()
        const baseCell = {
            startTime: currentUnix,
            endTime: newDate.unix(),
            selected: false,
            names: [],
            dst: 0
        }
        
        if (currentDate.utcOffset() !== newDate.utcOffset())
        {
            for (let index = 1; index <= (hourInMinutes / props.timeInterval); index++) {
                cells.value[currentUnix + index] = {
                    ...baseCell,
                    startTime: currentUnix + index * props.timeInterval * hourInMinutes,
                    dst: currentDate.utcOffset() > newDate.utcOffset() ? 1 : -1
                }
            }
        }
        
        cells.value[currentUnix] = baseCell

        currentDate = newDate 
    }
    const emptyCells = cells.value

    watch(()=>props.cells, ()=>{
        cells.value = mergeCells(emptyCells, props.cells)
    })
    onBeforeMount(()=>cells.value = mergeCells(emptyCells, props.cells))

    function mergeCells(mainCells, selectedCells) {
        selectedCells = _.pickBy(selectedCells, (cell) => dayjs.unix(cell.startTime).isBetween(startDate, endDate, 'hour', '[)'))
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
        if(!firstCell || !currentCell) return;

        temporaryCells.value = _.cloneDeep(cells.value)

        const unixFirstCell = dayjs.unix(firstCell.startTime)
        const firstCellMinutes = toMinutes(unixFirstCell)
        const unixCurrentCell =  dayjs.unix(currentCell.startTime) 
        const currentCellMinutes = toMinutes(unixCurrentCell)

        const dstHour = currentCell.dst !== 0 ? currentCell.dst * hourInMinutes : 0;
        const currentCellMinutesDst = firstCellMinutes > currentCellMinutes + dstHour ? currentCellMinutes + dstHour : currentCellMinutes

        const selectionSmallestTime = Math.min(firstCellMinutes,currentCellMinutesDst)
        let selectionLargestTime = Math.max(firstCellMinutes,currentCellMinutesDst)

        const selectionSmallestDate = dayjs.min(unixFirstCell,unixCurrentCell)
        const selectionLargestDate = dayjs.max(unixFirstCell,unixCurrentCell)
        
        const startHoursAndMinutes = seperateHourAndMinutes(selectionSmallestTime)
        let selectionStartDate = selectionSmallestDate.hour(startHoursAndMinutes.hours).minute(startHoursAndMinutes.minutes)

        const endHoursAndMinutes = seperateHourAndMinutes(selectionLargestTime)
        const selectionEndDate = selectionLargestDate.hour(endHoursAndMinutes.hours).minute(endHoursAndMinutes.minutes)

        if (currentCell.dst !== 0 && firstCellMinutes <= currentCellMinutes + dstHour) selectionLargestTime += dstHour

        _.each(temporaryCells.value, (cell)=>{
            const startTime = dayjs.unix(cell.startTime)
            const isBeforeSelection = startTime.isBefore(selectionStartDate, 'day') || toMinutes(startTime) < selectionSmallestTime
            const isAfterSelection = startTime.isAfter(selectionEndDate, 'day') || toMinutes(startTime) > selectionLargestTime
            
            const selected = !(isBeforeSelection || isAfterSelection)

            if(!selected) cell = undefined
            else {
                if(cell.dst === 0) cell.selected = firstCell.selected
            }
        })

        temporaryCells.value = _.merge(_.cloneDeep(cells.value), _.pickBy(temporaryCells.value, cell=>cell.selected == firstCell.selected))
    }

    function onMouseUp(){
        currentNames.value = []
        if(!firstCell) return;
        firstCell = null
        cells.value = temporaryCells.value
        temporaryCells.value = {}
        emit("edited", cells.value)
    }

    const toMinutes = (time) => time.hour() * hourInMinutes + time.minute()
    const seperateHourAndMinutes = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / hourInMinutes)
        const minutes = totalMinutes % hourInMinutes

        return { hours, minutes }
    }

    const {showGradient, showUnavailable} = storeToRefs(settingsStore)

    const currentNames = ref([])
    const namesPopup = useTemplateRef("namesPopup")
    function showNamesSelected(cellData, cellComponent) {
        let names = cellData.names
        if (showUnavailable.value) names = cellData.names.length ? [...props.allPersons].map((name, i) => {return cellData.names.includes(name) ? name : `<s>${name}</s>`}) : []
        currentNames.value = showGradient.value ? names : (cellData.selected ? names : [])

        const namesPopupElement = namesPopup.value
        const backgroundColor = getComputedStyle(cellComponent).getPropertyValue('background-color')
        const {x: cellX, y: cellY, width: cellWidth, height: cellHeight} = cellComponent.getBoundingClientRect()
        
        namesPopupElement.style.left = `${cellX + cellWidth }px`
        namesPopupElement.style.top = `${cellY + cellHeight/2}px`
        namesPopupElement.style.setProperty("--names-popup-color", `linear-gradient(${backgroundColor}, ${backgroundColor}), var(--dark-gray)`)
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
                :names="cell.names"
                :dst="cell.dst"
                :dstTime="cell.dstTime"
                @[editable&&'mouseDown']="cell=>onMouseDown(cell)"
                @[editable&&'mouseOver']="cell=>onMouseOver(cell)"
                @[editable&&'mouseUp']="cell=>onMouseUp(cell)"
                @[!editable&&'mouseOver']="(_, cellComponent)=>showNamesSelected(cell, cellComponent)"
            />
        </div>
        <dialog class="namesPopup" ref="namesPopup" v-show="!editable && currentNames.length">
            <span class="name" v-for="name in currentNames" v-html="name"></span>
        </dialog>
    </section>
</template>

<style scoped>
    .timeTable{
        --max-names: v-bind('maxNames');
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

        .namesPopup{
            --names-popup-color: hsl(from var(--planner-color) h s calc(l * .7));
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            translate: 5px -50%;
            margin: 0;
            pointer-events: none;
            font-size: 13px;
            border: none;
            padding: 10px;
            background: var(--names-popup-color);
            border: 1px solid white;
            border-radius: 5px;
            z-index: 99;
            transition: .1s;

            display: grid;
                grid-template-rows: repeat(5, max-content);
                grid-auto-flow: column;
                gap: 0 5px;
                text-align: left;

            &::after,&::before {
                position: absolute;
                top: 50%;
                right: 100%;
                border: solid transparent;
                content: "";
                height: 0;
                width: 0;
                pointer-events: none;
            }
            &::before{
                border-right-color: white;
                border-width: 6px;
                margin-top: -6px;
            }
        }
    }
</style>