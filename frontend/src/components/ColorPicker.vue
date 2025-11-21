<script setup>
import { ChromePicker } from 'vue-color'

const color = defineModel({
    default: '#17aa41'
})
</script>

<template>
    {{ color }}
    <ChromePicker v-model="color" />
</template>

<style scoped>

</style>