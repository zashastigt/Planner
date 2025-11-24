<script setup>
import { ref } from 'vue';
import ColorPicker from './ColorPicker.vue';
import { RouterLink } from 'vue-router';

const showColorPicker = ref(false)


</script>

<template>
    <div id="menu">
        <RouterLink to="/">
            <img src="../assets/plus.png" />
        </RouterLink>
        
        <img src="../assets/color-wheel.png" @click="showColorPicker = !showColorPicker" />
    </div>
    <div id="subMenu" v-if="showColorPicker">
        <ColorPicker v-if="showColorPicker" />
    </div>
    
</template>

<style scoped>
    #menu {
        position: fixed;
        display: flex;
        flex-direction: column;
        top: 0;
        left: 0;
        background-color: rgb(38, 38, 38);
        border-bottom: 1px solid rgb(195, 195, 195);
        border-right: 1px solid rgb(195, 195, 195);
    }

    #menu img {
        width: 60px;
        aspect-ratio: 1 / 1;
    }

    #menu img:hover {
        background-color: rgb(48, 48, 48);
    }

    #subMenu {
        position: fixed;
        top: 0;
        left: 61px;
        background-color: rgb(38, 38, 38);
        border-bottom: 1px solid rgb(195, 195, 195);
        border-right: 1px solid rgb(195, 195, 195);
    }
</style>