import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuth } from './stores/auth'

import '@fontsource/noto-sans/400.css'
import '@fontsource/noto-sans/600.css'
import '@fontsource/noto-sans/700.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
    faRightFromBracket, 
    faUser, 
    faPlus, 
    faTrash,
    faLocationDot,
    faChevronLeft } from '@fortawesome/free-solid-svg-icons'

library.add(
    faRightFromBracket, 
    faUser, 
    faPlus, 
    faTrash,
    faLocationDot,
    faChevronLeft)

const app = createApp(App)

const pinia = createPinia()

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(pinia)
useAuth().init()

app.mount('#app')
