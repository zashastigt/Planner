<script setup>
    import dayjs from 'dayjs'

    const props = defineProps([
        "startTime",
        "endTime",
        "selected",
        "onMouseUp",
        "onMouseDown",
        "onMouseOver"
    ])

</script>
<template>
    <div 
        :class="`timeCell${props.selected ? ' selected' : ''}${props.onMouseDown ? ' editable' : ''}`"
        @[onMouseDown?"mousedown":null] ="onMouseDown({startTime, endTime, selected})"
        @[onMouseOver?"mouseover":null] ="onMouseOver({startTime, endTime, selected})"
        @[onMouseUp?"mouseup":null]     ="onMouseUp()"
    >
    {{ props.startTime }}
    </div>
</template>
<style scoped>
    .timeCell{
        width: 40px;
        height: 8px;
        border-right: 1px solid white;
        font-size: 40%;
        &:nth-child(4n+2){
            border-bottom: 1px solid white;
        }
        &:nth-child(4n+1){
            border-top: 1px dotted white;
        }
        &.selected{
            background-color: green;
        }
        &.editable{
            &:hover{
                background-color: rgba(0, 128, 0, 0.629);
            }
        }
    }
</style>