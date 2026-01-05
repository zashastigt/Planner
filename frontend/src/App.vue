<script setup>
    import { useSettingsStore } from './store/store'
    import { storeToRefs } from 'pinia'

    const settingsStore = useSettingsStore()
    const { color, gradient } = storeToRefs(settingsStore)
</script>

<template>
    <div class="app">
        <RouterView />
    </div>
</template>

<style scoped>
    .app{
        --planner-color:                    v-bind(color);
        --planner-gradient-color:           v-bind(gradient);
        --planner-color--hover:             rgb(from v-bind(color) r g b / .5);
        --planner-gradient-color--hover:    rgb(from v-bind(gradient) r g b / .5);
    }
</style>
