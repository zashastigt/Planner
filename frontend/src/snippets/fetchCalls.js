import dayjs from 'dayjs'
import { router } from '../router.js';
import { cellsToTimeRanges } from './cellsToTimeRanges.js';
import { useDateSavingStore } from '../store/store.js';

const baseUrl = `${import.meta.env.VITE_API_ENDPOINT}planning`

export const urlId = () => {
    const pageUrl = router.currentRoute._value
    const planningId = pageUrl.params.planningId
    return planningId
}

export async function createPlanning(date, webhook="") {
    const dateStore = useDateSavingStore()
    dateStore.setDates(dayjs(date.start).unix(), dayjs(date.end).unix())
    
    if(webhook){
        localStorage.setItem("webhook", webhook)
        const messageId = (await fetch(`${webhook}?wait=true`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "Planner",
                content: `Creating planning...`
            })
        }).then(res=>res.json())).id
        webhook = `${webhook}/messages/${messageId}`
    }

    const response = await fetch(`${baseUrl}/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            startDate: dayjs(date.start).unix(),
            endDate: dayjs(date.end).unix(),
            webhook: webhook
        })
    });

    const planningDto = await response.json();
    
    if(webhook){
        fetch(`${webhook}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "Planner",
                content: `Please enter your availability [here](${import.meta.env.VITE_FRONTEND_URL}/${planningDto.id})`
            })
        })
    }
    
    router.push({ path: `/${planningDto.id}`})
}

export async function getPlanning() {
    const url = router.currentRoute.value
    const response = await fetch(`${import.meta.env.VITE_API_ENDPOINT}planning/${url.params.planningId}`)
    return await response.json();
}

export async function getAvailability() {
    const response = await fetch(`${baseUrl}/${urlId()}/availability`);
    const availablilityTimes = await response.json()
    
    return availablilityTimes
}

export async function sendAvailability(name, cells) {
    const timeRanges = cellsToTimeRanges(cells)

    await fetch(`${baseUrl}/${urlId()}/availability/create`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            times: timeRanges
        })
    });
}