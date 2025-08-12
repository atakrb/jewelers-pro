import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Home from '@/pages/home.vue'
import Satis from '@/pages/satis.vue'
import Toptanci from '@/pages/toptanci.vue'
import Raporlar from "@/pages/raporlar.vue"
import kategoriler from "@/pages/kategoriler.vue"
import urunler from "@/pages/urunler.vue"
import musteriBilgi from "@/pages/musteriBilgi.vue";
import stok from "@/pages/stok.vue";
import kargo from "@/pages/kargo.vue";

Vue.use(VueRouter)
const routes: RouteConfig[] = [
    { path: '/', name: 'home', component: Home },
    { path: '/satis', name: 'satis', component: Satis },
    { path: '/raporlar', name: 'raporlar', component: Raporlar },
    { path: '/toptanci', name: 'toptanci', component: Toptanci },
    { path: '/kategoriler', name: 'kategoriler', component: kategoriler },
    { path: '/urunler', name: 'urunler', component: urunler },
    { path: '/musteriBilgi', name: 'musteriBilgi', component: musteriBilgi },
    { path: '/stok', name: 'stok', component: stok },
    { path: '/kargo', name: 'kargo', component: kargo },




    { path: '*', redirect: '/' } // opsiyonel
]

const router = new VueRouter({
    mode: 'history',
    routes,
    scrollBehavior: () => ({ x: 0, y: 0 })
})

export default router
