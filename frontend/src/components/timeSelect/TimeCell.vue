<script setup>
    import dayjs from 'dayjs'
    import { useColorStore } from '../../store/store'
    import { storeToRefs } from 'pinia'

    const colorStore = useColorStore()
    const { color } = storeToRefs(colorStore)

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
    </div>
</template>
<style scoped>
    .timeCell{
        width: 40px;
        height: 8px;
        border-right: 1px solid var(--table-border-color);
        font-size: 40%;
        &:nth-child(4n+2){
            border-bottom: 1px solid var(--table-border-color);
        }
        &:nth-child(4n+1){
            border-top: 1px dotted var(--table-border-color);
        }
        &.selected{
            background-color: v-bind(color);
        }
        &.editable{
            &:hover{
                background-color: v-bind('color + 88');
            }
        }
    }
</style>