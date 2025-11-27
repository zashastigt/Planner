<script setup>
const props = defineProps([
    'title'
])
</script>

<template>
    <div id="card">
        <div class="header">{{ title }}</div>
        <div class="content">
            <slot></slot>
        </div>
        
    </div>
</template>

<style scoped>
    #card {
        width: fit-content;
        background-color: var(--dark-gray);
        color: var(--black);
        border: 1px solid var(--light-gray);
        border-radius: 20px 20px 0 20px;
        overflow: hidden;
    }

    .header {
        height: 25px;
        border-radius: 20px 20px 0 0 ;
        background-color: var(--light-gray);
    }
</style>