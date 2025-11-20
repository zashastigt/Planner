import dayjs from 'dayjs'
import { router } from '../router.js';
import { useDBCallStore } from '../store/store';
import { readAvailableTimes } from './readAvailableTimes.js';

const baseUrl = `${import.meta.env.VITE_API_ENDPOINT}planning`

const urlId = () => {
    const pageUrl = router.currentRoute._value
    const planningId = pageUrl.params.planningId
    return planningId
}

export async function createPlanning(date) {
    const response = await fetch(`${baseUrl}/create`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            startDate: dayjs(date.start).unix(),
            endDate: dayjs(date.end).unix()
        })
    });
    const planningDto = await response.json();
    const dbCallStore = useDBCallStore()
    dbCallStore.setPlanningDto(planningDto)
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

export async function sendAvailability(name, timeTable) {
    const availableTimes = readAvailableTimes(timeTable)

    await fetch(`${baseUrl}/${urlId()}/availability/create`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            times: availableTimes
        })
    });
}