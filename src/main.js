import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
let savedTheme
try {savedTheme=localStorage.getItem('jr-theme')} catch {}
document.documentElement.dataset.theme=['light','dark'].includes(savedTheme)?savedTheme:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')
createApp(App).mount('#app')
