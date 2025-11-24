<script setup>
import { ChromePicker } from 'vue-color'
import { useColorStore } from '../store/store'
import { storeToRefs } from 'pinia'

const colorStore = useColorStore()
const { color } = storeToRefs(colorStore)

</script>

<template>
    <ChromePicker v-model="color" />
</template>

<style scoped>

</style>