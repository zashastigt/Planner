import dayjs from 'dayjs'
import { router } from '../router.js';
import { useDBCallStore, useTimeCellIdsStore } from '../store/store';
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

export async function getAvailability() {
    const response = await fetch(`${baseUrl}/${urlId()}/availability`);
    const availablilityTimes = await response.json()
    
    return availablilityTimes
}

export async function sendAvailability(timeStore, timeTable) {
    const availableTimes = readAvailableTimes(timeTable)

    await fetch(`${baseUrl}/${urlId()}/availability/create`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: timeStore.name,
            times: availableTimes
        })
    });
}

export async function requestUser(timeStore) {
    const response = await fetch(`${baseUrl}/${urlId()}/availability/${timeStore.name}`);
    const availablilityTimes = await response.json()
    const timeCellIdsStore = useTimeCellIdsStore()

    timeCellIdsStore.enableIdsByTimestamps(availablilityTimes)
}