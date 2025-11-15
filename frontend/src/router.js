import { createRouter, createWebHistory } from "vue-router"
import CreatePlanning from "./pages/CreatePlanning.vue"
import ShowPlanning from "./pages/ShowPlanning.vue"

const routes = [
    { path: '/', component: CreatePlanning },
    { path: '/:planningId', component: ShowPlanning, props: true }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})