<script setup>
    import { computed, getCurrentInstance, useTemplateRef } from 'vue';
    import { useSettingsStore } from '../../store/store';
    import { storeToRefs } from 'pinia';
    
    const props = defineProps([
        "startTime",
        "endTime",
        "selected",
        "names"
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
    const {showGradient} = storeToRefs(useSettingsStore())

</script>
<template>
    <div 
        ref="cell"
        :class="`
            timeCell
            ${props.selected ? ' selected' : (showGradient && props.names.length ? ' partially-selected': ' not-selected')}
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
        --selection-range: calc(v-bind('props.names.length') / var(--max-names));
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
        &.not-selected{
            background-color: transparent;
        }
        &.partially-selected{
            background-color: hsl(from var(--planner-gradient-color) h s l / var(--selection-range));
            &:hover{
                background-color: hsl(from var(--planner-gradient-color) h s l / calc(var(--selection-range) * .5));
            }
        }
        &.selected{
            background-color: var(--planner-color);
            &:hover{
                background-color: rgb(from var(--planner-color) r g b / .5);
            }
        }
    }
</style>