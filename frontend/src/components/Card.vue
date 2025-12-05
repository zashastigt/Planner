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
        border: 1px solid var(--light-gray);
        background-color: var(--light-gray);
        border-radius: 20px 20px 0 20px;
        overflow: hidden;
        .header {
            height: 25px;
            background-color: var(--light-gray);        
        }
        .content{
            background-color: var(--dark-gray);
        }
    }

</style>