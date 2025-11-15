import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'
// import { SetupCalendar } from 'v-calendar';
import 'v-calendar/style.css';

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
// app.use(SetupCalendar, {})
app.mount('#app')
