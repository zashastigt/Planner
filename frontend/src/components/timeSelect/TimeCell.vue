<script setup>
    import { computed, getCurrentInstance, ref, useTemplateRef } from 'vue';
    import { useSettingsStore } from '../../store/store';
    import { storeToRefs } from 'pinia';
    
    const props = defineProps([
        "startTime",
        "endTime",
        "selected",
        "names"
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

    function handle(eventName, isSelecting, args = undefined) {
        const {startTime, endTime, selected} = props
        emit(eventName, {startTime, endTime, selected}, args)
    }

</script>
<template>
    <div 
        ref="cell"
        :class="`
            timeCell
            ${props.selected ? ' selected' : (showGradient && props.names.length ? ' partially-selected': ' not-selected')}
            ${editable ? ' editable' : ''}
            ${selecting ? ' selecting' : ''}
        `"
        @pointerdown="(e) => handle('pointerDown', true, e)"
        @pointermove="(e) => handle('pointerMove', e.buttons === 1 || e.pointerType === 'touch', cellComponent)"
        @pointerup="handle('pointerUp', false)"
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
        &.editable{
            &:not(.selecting){
                &:hover{
                    background-color: rgb(from var(--planner-color) r g b / .5);
                }
            }
            &.selected{
                background-color: var(--planner-color);
            }
        }
        &.editable:not(.selecting){
            &.not-selected:hover{
                background-color: hsl(from var(--planner-color) h s l / .5);
            }
        }
    }
</style>