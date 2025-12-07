<script setup>

const props = defineProps([
    "saveSelection"
])

</script>

<template>
    <div class="colorMenu button" v-if="!showPicker">
        <div class="button" @click="saveSelection({})">
            Not available
        </div>
    </div>
    
</template>

<style scoped>
    .colorMenu {
        width: 100px;
        margin-top: 25px;
        background-color: var(--dark-gray);
        color: var(--black);
        border: 1px solid var(--light-gray);
        border-radius: 20px 0 0 20px;
        overflow: hidden;

        .button {
            padding: 0 5px 0 10px;
            background-color: var(--light-gray);
            font-size: 0.9em;
            user-select: none;
            &:hover {
                background-color: var(--medium-lightening);
            }
        }
    }
</style>