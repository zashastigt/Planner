<script setup>
    import { computed, getCurrentInstance, ref, useTemplateRef } from 'vue';

    const props = defineProps([
        "startTime",
        "endTime",
        "selected",
    ])

    const emit = defineEmits([
        "mouseDown",
        "mouseOver",
        "mouseUp"
    ])

    const editable = computed(()=>{
        return getCurrentInstance()?.vnode.props.onMouseDown
            && getCurrentInstance()?.vnode.props.onMouseOver
            && getCurrentInstance()?.vnode.props.onMouseUp
    });

    const cellComponent = useTemplateRef('cell')

</script>
<template>
    <div 
        ref="cell"
        :class="`
            timeCell
            ${props.selected ? ' selected' : ''}
            ${editable ? ' editable' : ''}
        `"
        @mousedown="()=>emit('mouseDown', {startTime, endTime, selected})"
        @mouseover="()=>emit('mouseOver', {startTime, endTime, selected}, cellComponent)"
        @mouseup="()=>emit('mouseUp', {startTime, endTime, selected})"
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
        &:hover{
            background-color: var(--planner-color--hover);
        }
    }
</style>