<script setup>
    import { computed, getCurrentInstance, ref, useTemplateRef } from 'vue';
    import { useSettingsStore } from '../../store/store';
    import { storeToRefs } from 'pinia';
    
    const props = defineProps([
        "startTime",
        "endTime",
        "selected",
        "names",
        "dst"
    ])
    
    const emit = defineEmits([
        "pointerDown",
        "pointerMove",
        "pointerUp"
    ])
    
    const editable = computed(()=>{
        return getCurrentInstance()?.vnode.props.onPointerDown
        && getCurrentInstance()?.vnode.props.onPointerMove
        && getCurrentInstance()?.vnode.props.onPointerUp
    });
    
    const cellComponent = useTemplateRef('cell')
    const {showGradient} = storeToRefs(useSettingsStore())
    const selecting = ref(false)

</script>
<template>
    <div 
        ref="cell"
        :class="`
            timeCell
            ${props.dst !== 0 ? ' dst' : props.selected ? ' selected' : (showGradient && props.names.length ? ' partially-selected': ' not-selected')}
            ${editable ? ' editable' : ''}
            ${selecting ? ' selecting' : ''}
        `"
        @pointerdown="(e) => {
            if(props.dst !== 0) return;
            selecting = editable
            emit('pointerDown', {startTime, endTime, selected, dst}, e)
        }"
        @pointermove="(e) => {
            selecting = editable && e.buttons === 1
            emit('pointerMove', {startTime, endTime, selected, dst}, e, cellComponent)
            }"
        @pointerup="()=>{
            selecting = false
            emit('pointerUp', {startTime, endTime, selected, dst})
        }"
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
        pointer-events: auto;
        touch-action: none;
        
        &:nth-child(4n){
            border-bottom: 1px solid var(--table-border-color);
        }
        &:nth-child(4n-1){
            border-top: 1px dotted var(--table-border-color);
        }
        &:not(.editable){
            &.not-selected{
                background-color: transparent;
            }
            &.partially-selected{
                background-color: hsl(from var(--planner-gradient-color) h s l / var(--selection-range));
                @media (hover: hover) {
                    &:hover{
                        background-color: hsl(from var(--planner-gradient-color) h s l / calc(var(--selection-range) * .5));
                    }
                }
            }
            &.selected{
                background-color: var(--planner-color);
                @media (hover: hover) {
                    &:hover{
                        background-color: rgb(from var(--planner-color) r g b / .5);
                    }
                }
            }
        }
        &.editable{
            &:not(.selecting, .dst){
                @media (hover: hover) {
                    &:hover{
                        background-color: rgb(from var(--planner-color) r g b / .5);
                    }
                }
            }
            &.selected{
                background-color: var(--planner-color);
            }
        }
        &.editable:not(.selecting){
            @media (hover: hover) {
                &.not-selected:hover{
                    background-color: hsl(from var(--planner-color) h s l / .5);
                }
            }
        }
        &.dst{
            background-color: white;
        }
    }
</style>