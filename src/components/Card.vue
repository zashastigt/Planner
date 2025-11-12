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
        margin: 0 50px;
        background-color: rgb(38, 38, 38);
        color: #000;
        border: 1px solid rgb(195, 195, 195);
        border-radius: 20px 20px 0 20px;
    }

    .header {
        height: 20px;
        border-radius: 20px 20px 0 0 ;
        background-color: rgb(195, 195, 195);
    }
</style>