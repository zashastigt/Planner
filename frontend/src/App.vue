<script setup>
    import { useColorStore } from './store/store'
    import { storeToRefs } from 'pinia'

    const colorStore = useColorStore()
    const { color } = storeToRefs(colorStore)
</script>

<template>
    <div class="app">
        <RouterView />
    </div>
</template>

<style scoped>
    .app{
        --planner-color: v-bind(color);
        --planner-color--hover: v-bind('`${color}88`');
    }
</style>
