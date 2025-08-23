import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

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
    faLocationDot } from '@fortawesome/free-solid-svg-icons'

library.add(
    faRightFromBracket, 
    faUser, 
    faPlus, 
    faTrash,
    faLocationDot)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
