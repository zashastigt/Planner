<script setup>
import { ChromePicker } from 'vue-color'
import { useColorStore } from '../store/store'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const colorStore = useColorStore()
const { color } = storeToRefs(colorStore)

const showPicker = ref(false)
</script>

<template>
    <div class="colorMenu button" v-if="!showPicker">
            <img class="image" src="../assets/color-wheel.png" @click="() => showPicker = !showPicker" />
    </div>
    <div class="colorMenu picker" v-if="showPicker">
        <div class="title" @click="() => showPicker = !showPicker">
            <div>< Change cell color</div> 
        </div>
        <ChromePicker v-model="color" />
    </div>
</template>

<style scoped>
    .colorMenu {
        margin-top: 25px;
        background-color: var(--dark-gray);
        color: var(--black);
        border: 1px solid var(--light-gray);
        border-radius: 0 20px 20px 0;
        overflow: hidden;
    }

    .button {
        height: 40px;
    }

    .picker {
        height: fit-content;
    }

    .image {
        width: 40px;
        aspect-ratio: 1/1;
    }

    .title {
        height: 25px;
        background-color: var(--light-gray);
        color: var(--black);
        &:hover {
            background-color: var(--light-gray);
            color: var(--black);
        }
    }
</style>