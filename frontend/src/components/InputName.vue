<script setup>
import { ref } from 'vue';

const props = defineProps([
    'nameCheck'
])

const emit = defineEmits()

const name = ref("")

function updateNameCheck() {
    console.log(name.value)
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
        background-color: rgba(255, 255, 255, 0.15);
    }

    .inputName input:focus {
        outline: none;
    }

    .inputName button {
        height: 30px;
        border: none;
        width: 30px;
        background-color: rgb(110, 110, 110);
    }

    .inputName button:hover {
        background-color: rgba(255, 255, 255, 0.5);
    }

    .inputName button:active {
        background-color: rgb(81, 81, 81);
    }

    .inputName button img {
        height: 18px;
        margin-right: auto;
        margin-top: 5px;
    }
</style>