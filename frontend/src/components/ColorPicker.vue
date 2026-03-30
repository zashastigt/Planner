<script setup>
import { ChromePicker } from 'vue-color'
import { ref, watch } from 'vue'

const props = defineProps([
    "defaultColor"
])

const color = ref(props.defaultColor)
const emit = defineEmits([
    "change",
    "close"
])

watch(color, ()=>emit("change", color.value))

</script>

<template>
    <div class="colorMenu picker">
        <div class="title">
            <div class="back"  @click="()=>emit('close')"><</div> 
            <slot/>
                
        </div>
        <ChromePicker v-model="color" />
    </div>
</template>

<style scoped>
    .colorMenu {
        background-color: var(--dark-gray);
        color: var(--black);
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
        display: flex;
        height: 25px;
        background-color: var(--light-gray);
        color: var(--black);
        user-select: none;
        &:hover {
            background-color: var(--light-gray);
            color: var(--black);
        }
        .back {
            margin-right: 5px;
            width: 30px;
            height: 25px;
            &:hover {
                background-color: var(--medium-gray);
            }
        }
    }

    @media (max-width: 600px) {
        .colorMenu {
            border-radius: 20px 20px 0 0;
        }
    }
</style>