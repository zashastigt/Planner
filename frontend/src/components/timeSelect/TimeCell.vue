<script setup>
    import { ref } from 'vue';

    const props = defineProps([
        "startTime",
        "endTime",
        "selected",
        "onMouseUp",
        "onMouseDown",
        "onMouseOver"
    ])

    const selecting = ref(false)

</script>
<template>
    <div 
        :class="`
            timeCell
            ${props.selected ? ' selected' : ''}
            ${props.onMouseDown ? ' editable' : ''}
            ${selecting ? ' selecting' : ''}
        `"
        @[onMouseDown?"mousedown":null] ="onMouseDown({startTime, endTime, selected})"
        @[onMouseOver?"mouseover":null] ="(e)=>{
            selecting = e.buttons === 1
            onMouseOver({startTime, endTime, selected})
        }"
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
        &:nth-child(4n){
            border-bottom: 1px solid var(--table-border-color);
        }
        &:nth-child(4n-1){
            border-top: 1px dotted var(--table-border-color);
        }
        &.selected{
            background-color: var(--planner-color);
        }
        &.editable:not(.selecting){
            &:hover{
                background-color: var(--planner-color--hover);
            }
        }
    }
</style>