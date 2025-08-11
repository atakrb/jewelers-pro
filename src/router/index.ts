import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Home from '@/views/home.vue'
import Envantory from '@/views/envantory.vue'
import Customers from '@/views/customers.vue'

Vue.use(VueRouter)

const routes: RouteConfig[] = [
    { path: '/', name: 'home', component: Home },
    { path: '/envantory', name: 'envantory', component: Envantory },
    { path: '/customers', name: 'customers', component: Customers },
    { path: '*', redirect: '/' } // opsiyonel
]

const router = new VueRouter({
    mode: 'history',
    routes,
    scrollBehavior: () => ({ x: 0, y: 0 })
})

export default router
