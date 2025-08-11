import Vue from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify kullanıyorsan:
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify)

Vue.config.productionTip = false

new Vue({
    router,
    vuetify: new Vuetify(), // Vuetify kullanıyorsan bunu ekle
    render: h => h(App)
}).$mount('#app')
