import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadDb } from '@/utils/harddata'

Vue.config.productionTip = false

async function boot() {
    try {
        await loadDb()        // >>> public/database.txt okunur
    } catch (e) {
        console.error('database.txt yüklenemedi:', e)
    }

    new Vue({
        router,
        vuetify,
        render: h => h(App),
    }).$mount('#app')
}

boot()
