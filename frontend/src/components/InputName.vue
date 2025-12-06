<script setup>
import { ref } from 'vue';

const props = defineProps([
    'nameCheck'
])

const emit = defineEmits()

const name = ref("")

function updateNameCheck() {
    emit('updateNameCheck', name.value)
}

function handleKeyUp(event) {
    if (event.key === 'Enter') updateNameCheck()
}

</script>

<template>
    <div class="inputName">
        <input type="text" v-model="name" @keyup="handleKeyUp"></input>
        <button @click="updateNameCheck" >
            <img src="../assets/loginWhite.png" />
        </button>
    </div>
    
</template>

<style scoped>
    .inputName {
        display: flex;
        align-items: start;
    }

    .inputName input {
        height: 30px;
        border: none;
        font-size: 1em;
        border-radius: 0 0 0 20px;
        padding: 0 20px;
    }

    .inputName input:hover {
        background-color: var(--small-lightening);
    }

    .inputName input:focus {
        outline: none;
    }

    .inputName button {
        height: 30px;
        border: none;
        width: 30px;
        z-index: 2;
        background-color: var(--medium-gray);
    }

    .inputName button:hover {
        background-color: var(--medium-lightening);
    }

    .inputName button:active {
        background-color: var(--dark-gray);
    }

    .inputName button img {
        height: 18px;
        margin-right: auto;
        margin-top: 5px;
    }
</style>