<script setup>
const props = defineProps([
    'title',
    'class'
])
</script>

<template>
    <div :class="`card${props.class ? ' '+props.class : ''}`">
        <div class="header">{{ title }}</div>
        <div class="content">
            <slot></slot>
        </div>
        
    </div>
</template>

<style scoped>
    .card {
        width: fit-content;
        color: var(--black);
        border-radius: 20px 20px 0 20px;
        overflow: hidden;
        position: relative;
        isolation: isolate;

        .header {
            height: 25px;
            background-color: var(--light-gray);        
            z-index: 2;
            position: relative;
        }
        .content{
            background-color: var(--dark-gray);
            overflow: auto;
        }
        &::after{
            content: "";
            box-shadow: inset -5px 0px 10px var(--dark-gray);
            position: absolute;
            inset: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }
    }
</style>