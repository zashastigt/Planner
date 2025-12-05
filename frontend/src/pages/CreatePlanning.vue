<script setup>
    import { DatePicker } from 'v-calendar';
    import { ref } from 'vue';
    import { createPlanning } from '../snippets/fetchCalls.js';

    const date = ref({
        start: new Date(),
        end: new Date()
    })

    const useWebhook = ref(false)

    const webhookUrl = ref(localStorage.getItem("webhook"))
</script>

<template>
    <div id="container">
        <div class="datePicker">
            <DatePicker
                v-model.range="date"
                mode="date"
                is-dark="isDark"
                color="green"
                :first-day-of-week="2"
            />
        </div>
        <fieldset class="webhookFields">
            <p class="optionsTitle">Options:</p>
            <label for="useWebhook">
                Use webhook
                <input 
                    id="useWebhook" 
                    name="useWebhook" 
                    type="checkbox" 
                    v-model="useWebhook">
                </input>
            </label>
            <input 
                :class="useWebhook ? 'show' : 'hide'" 
                id="webhookUrl" 
                name="webhookUrl" 
                type="text" 
                placeholder="Webhook url" 
                v-model="webhookUrl">
            </input>
        </fieldset>
        <button class="createButton" @click="createPlanning(date, useWebhook ? webhookUrl : '')">create planning</button>
    </div>
</template>

<style scoped>
    #container {
        display: grid;
        grid-template-areas: 
            "options    calendar"
            "create create";
        grid-template-rows: max-content auto;
        gap: 10px;
    }

    .datePicker{
        grid-area: calendar;
    }
    .webhookFields{
        display: flex;
        flex-direction: column;
        grid-area: options;
        height: 100%;
        margin-bottom: auto;
        text-align: left;
        border-radius: var(--vc-rounded-lg);
        .optionsTitle{
            text-align: center;
            margin: 0;
            border-bottom: 1px solid white;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        #webhookUrl{
            &.hide{
                visibility: hidden;
            }
        }
    }

    .createButton {
        grid-area: create;
        margin-top: auto;
        width: max-content;
        font-size: 1.2em;
        justify-self: center;
    }
</style>