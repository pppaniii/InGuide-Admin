import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
    faRightFromBracket, 
    faUser, 
    faPlus, 
    faTrash } from '@fortawesome/free-solid-svg-icons'

library.add(
    faRightFromBracket, 
    faUser, 
    faPlus, 
    faTrash)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
