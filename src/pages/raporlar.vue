<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
    <!-- SOL MENÜ -->
    <v-navigation-drawer
        v-model="drawer"
        :mini-variant.sync="mini"
        :permanent="$vuetify.breakpoint.lgAndUp"
        expand-on-hover
        app
        width="280"
        class="elevated-drawer"
    >
      <v-list dense>
        <v-list-item two-line class="mb-1">
          <v-list-item-avatar size="30">
            <v-icon color="white">mdi-diamond-stone</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">Jewelers Pro</v-list-item-title>
            <v-list-item-subtitle>Mağaza Paneli</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="mb-2" />

        <v-list-item
            v-for="it in drawerItems"
            :key="it.to"
            :to="{ name: it.to }"
            link exact
            class="rounded-lg"
        >
          <v-list-item-icon><v-icon>{{ it.icon }}</v-icon></v-list-item-icon>
          <v-list-item-title>{{ it.title }}</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item class="rounded-lg">
          <v-list-item-icon><v-icon>mdi-palette</v-icon></v-list-item-icon>
          <v-list-item-title>Vurgu</v-list-item-title>
          <v-spacer />
          <v-btn
              v-for="c in accents"
              :key="c"
              icon small
              :style="{ color: c }"
              @click="setAccent(c)"
          ><v-icon>mdi-circle</v-icon></v-btn>
        </v-list-item>

        <v-list-item class="rounded-lg" @click="cycleTheme">
          <v-list-item-icon><v-icon>mdi-theme-light-dark</v-icon></v-list-item-icon>
          <v-list-item-title>Tema</v-list-item-title>
          <v-spacer /><v-chip x-small>{{ themeLabel }}</v-chip>
        </v-list-item>

        <v-list-item :to="{ name:'musteriBilgi' }" class="rounded-lg" link>
          <v-list-item-icon><v-icon>mdi-lifebuoy</v-icon></v-list-item-icon>
          <v-list-item-title>Destek</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- HERO -->
    <div class="hero">
      <div class="hero-glow" :style="{ '--accent': accent }"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Raporlar & Analitik</h2>
        <div class="hero-sub">Satış, kâr, platform/ödeme dağılımları — tek ekranda.</div>
      </div>
    </div>

    <!-- HIZLI AKSİYONLAR -->
    <v-container class="pt-4 pb-0">
      <v-slide-group show-arrows>
        <v-slide-item v-for="qa in quickActions" :key="qa.key">
          <v-card
              class="qa"
              :to="qa.to ? { name: qa.to } : undefined"
              :link="!!qa.to"
              :style="{ borderColor: accent }"
              @click="qa.click && qa.click()"
          >
            <v-icon class="mr-2" :color="accent">{{ qa.icon }}</v-icon>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ qa.title }}</div>
              <div class="caption grey--text">{{ qa.subtitle }}</div>
            </div>
            <v-spacer />
            <v-chip x-small :color="accent" text-color="white">{{ qa.key }}</v-chip>
          </v-card>
        </v-slide-item>
      </v-slide-group>
    </v-container>

    <!-- FİLTRELER -->
    <v-container class="pt-4 pb-0">
      <v-sheet class="filters-sheet">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
                v-model="filters.q" dense outlined clearable hide-details
                label="Ara (sipariş no, ürün, platform, ödeme)"
                prepend-inner-icon="mdi-magnify"
            />
          </v-col>
          <v-col cols="6" md="2"><v-text-field v-model="filters.startDate" type="date" dense outlined hide-details label="Başlangıç"/></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="filters.endDate" type="date" dense outlined hide-details label="Bitiş"/></v-col>
          <v-col cols="6" md="2"><v-select v-model="filters.platform" :items="platformOptions" dense outlined hide-details clearable label="Platform"/></v-col>
          <v-col cols="6" md="2"><v-select v-model="filters.payment" :items="paymentOptions" dense outlined hide-details clearable label="Ödeme"/></v-col>
        </v-row>

        <div class="d-flex flex-wrap mt-3">
          <v-chip small class="mr-2 mb-1" :color="quick==='today' ? 'indigo' : ''" :text-color="quick==='today' ? 'white' : ''" @click="setQuick('today')">Bugün</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='7d' ? 'indigo' : ''" :text-color="quick==='7d' ? 'white' : ''" @click="setQuick('7d')">Son 7 Gün</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='month' ? 'indigo' : ''" :text-color="quick==='month' ? 'white' : ''" @click="setQuick('month')">Bu Ay</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='year' ? 'indigo' : ''" :text-color="quick==='year' ? 'white' : ''" @click="setQuick('year')">Bu Yıl</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='all' ? 'indigo' : ''" :text-color="quick==='all' ? 'white' : ''" @click="setQuick('all')">Tümü</v-chip>

          <v-spacer />
          <v-btn small class="mr-2 glass-btn" @click="resetFilters"><v-icon left small>mdi-filter-off</v-icon> Sıfırla</v-btn>
          <v-btn small :color="accent" dark class="mr-2" @click="exportCSV"><v-icon left small>mdi-file-delimited</v-icon> CSV</v-btn>
          <v-btn small class="glass-btn" @click="yazdir"><v-icon left small>mdi-printer</v-icon> Yazdır</v-btn>
        </div>
      </v-sheet>
    </v-container>

    <!-- İÇERİK -->
    <v-container id="reportPrint">
      <!-- KPI -->
      <v-row dense>
        <v-col cols="12" md="2" v-for="k in kpiCards" :key="k.key">
          <v-card outlined class="kpi">
            <div class="kpi-glow" />
            <v-card-text class="py-3">
              <div class="caption grey--text text--darken-1">{{ k.title }}</div>
              <div class="headline font-weight-bold">{{ k.display }}</div>
              <div class="d-flex align-center mt-1" v-if="k.delta != null">
                <v-icon :color="k.delta >= 0 ? 'green' : 'red'" small class="mr-1">
                  {{ k.delta >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                </v-icon>
                <span :class="k.delta >= 0 ? 'green--text' : 'red--text'">{{ pct(k.delta) }}</span>
                <span class="caption grey--text ml-1">önceki dönem</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- DAĞILIMLAR -->
      <v-row dense class="mt-2">
        <v-col cols="12" md="6">
          <v-card outlined class="table-card">
            <v-card-title class="subtitle-1 font-weight-bold">Platform Dağılımı</v-card-title>
            <v-card-text>
              <div v-if="platformDist.length===0" class="grey--text">Kayıt yok.</div>
              <div v-for="row in platformDist" :key="row.name" class="mb-3">
                <div class="d-flex justify-space-between">
                  <div>{{ row.name }}</div>
                  <div class="font-weight-bold">{{ tl(row.total) }} ({{ pct(row.percent) }})</div>
                </div>
                <v-progress-linear :value="row.percent*100" height="10"></v-progress-linear>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card outlined class="table-card">
            <v-card-title class="subtitle-1 font-weight-bold">Ödeme Dağılımı</v-card-title>
            <v-card-text>
              <div v-if="paymentDist.length===0" class="grey--text">Kayıt yok.</div>
              <div v-for="row in paymentDist" :key="row.name" class="mb-3">
                <div class="d-flex justify-space-between">
                  <div>{{ row.name }}</div>
                  <div class="font-weight-bold">{{ tl(row.total) }} ({{ pct(row.percent) }})</div>
                </div>
                <v-progress-linear :value="row.percent*100" height="10"></v-progress-linear>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- TOP SELLERS + LOW STOCK -->
      <v-row dense class="mt-2">
        <v-col cols="12" md="6">
          <v-card outlined class="table-card">
            <v-card-title class="subtitle-1 font-weight-bold">En Çok Satılanlar</v-card-title>
            <v-data-table :headers="topsHeaders" :items="topSellers" dense hide-default-footer class="elevated-datatable">
              <template v-slot:item.birim="{ item }">{{ tl(item.unit) }}</template>
              <template v-slot:item.ciro="{ item }">{{ tl(item.revenue) }}</template>
              <template v-slot:item.kar="{ item }">{{ tl(item.profit) }}</template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card outlined class="table-card">
            <v-card-title class="subtitle-1 font-weight-bold">Az Kalan Stok</v-card-title>
            <v-data-table :headers="lowHeaders" :items="lowStock" dense hide-default-footer class="elevated-datatable">
              <template v-slot:item.stok="{ item }">
                <v-chip small :color="item.stok<=0?'red':item.stok<=5?'orange':'green'" text-color="white">{{ item.stok }}</v-chip>
              </template>
              <template v-slot:item.fiyat="{ item }">{{ tl(unitGross(item)) }}</template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- SİPARİŞ LİSTESİ -->
      <v-row dense class="mt-2">
        <v-col cols="12">
          <v-card outlined class="table-card">
            <v-card-title class="subtitle-1 font-weight-bold">
              Siparişler ({{ filtered.length }})
              <v-spacer />
              <div class="caption grey--text">Tarih aralığı: {{ fmtRange(rangeStart, rangeEnd) }}</div>
            </v-card-title>
            <v-data-table
                :headers="orderHeaders"
                :items="recentOrders"
                :items-per-page="12"
                dense
                class="elevated-datatable"
            >
              <template v-slot:item.tarih="{ item }">{{ fmtDateTime(item.date) }}</template>
              <template v-slot:item.birim="{ item }">{{ tl(item.unitGross) }}</template>
              <template v-slot:item.tutar="{ item }">{{ tl(item.totalGross) }}</template>
              <template v-slot:item.maliyet="{ item }">{{ tl(item.baseCost) }}</template>
              <template v-slot:item.kar="{ item }">{{ tl(item.profit) }}</template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2400">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
import { priceCalc } from "@/utils/pricing";
import { get, ready } from "@/utils/harddata";

export default {
  name: "RaporlarPage",
  data() {
    return {
      // Tema / navigasyon
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini: this.$vuetify?.breakpoint?.lgAndUp || false,
      accent: localStorage.getItem('jp_accent') || '#5865F2',
      accents: ['#5865F2','#0EA5E9','#22C55E','#F59E0B','#EF4444','#8B5CF6'],
      drawerItems: [
        { title:'Ana Sayfa',    icon:'mdi-view-dashboard-outline', to:'home' },
        { title:'Satış',        icon:'mdi-cash-register',          to:'satis' },
        { title:'Raporlar',     icon:'mdi-file-chart',             to:'raporlar' },
        { title:'Toptancı',     icon:'mdi-storefront-outline',     to:'toptanci' },
        { title:'Kategoriler',  icon:'mdi-shape-outline',          to:'kategoriler' },
        { title:'Ürünler',      icon:'mdi-package-variant-closed', to:'urunler' },
        { title:'Müşteri Bilgi',icon:'mdi-account-group-outline',  to:'musteriBilgi' },
        { title:'Stok',         icon:'mdi-archive-outline',        to:'stok' },
        { title:'Kargo',        icon:'mdi-truck-outline',          to:'kargo' },
      ],
      quickActions: [
        { key:'B', icon:'mdi-calendar-today',  title:'Bugün',      subtitle:'Tarih filtresi', click:()=>this.setQuick('today') },
        { key:'7', icon:'mdi-calendar-range',  title:'7 Gün',      subtitle:'Hızlı aralık',   click:()=>this.setQuick('7d') },
        { key:'A', icon:'mdi-calendar-month',  title:'Bu Ay',      subtitle:'Aylık görünüm',  click:()=>this.setQuick('month') },
        { key:'Y', icon:'mdi-calendar',        title:'Bu Yıl',     subtitle:'Yıllık',         click:()=>this.setQuick('year') },
        { key:'C', icon:'mdi-file-delimited',  title:'CSV',        subtitle:'Dışa aktar',     click:()=>this.exportCSV() },
        { key:'P', icon:'mdi-printer',         title:'Yazdır',     subtitle:'Rapor',          click:()=>this.yazdir() },
      ],

      // Filtreler
      quick: "today",
      filters: { q:"", startDate:"", endDate:"", platform:null, payment:null },

      // DB'den gelecek
      products: [],
      orders: [],
      platformMaster: [],
      paymentMaster:  [],

      // Tablolar
      orderHeaders: [
        { text: "No", value: "id", width: 80 },
        { text: "Tarih", value: "tarih", width: 150 },
        { text: "Ürün", value: "urun" },
        { text: "Adet", value: "qty", align:"end", width: 70 },
        { text: "Birim (KDV)", value: "birim", align:"end", width: 120 },
        { text: "Tutar (KDV)", value: "tutar", align:"end", width: 140 },
        { text: "Maliyet", value: "maliyet", align:"end", width: 120 },
        { text: "Kâr", value: "kar", align:"end", width: 120 },
        { text: "Platform", value: "platform", width: 120 },
        { text: "Ödeme", value: "payment", width: 110 },
      ],
      topsHeaders: [
        { text: "Ürün", value: "urun" },
        { text: "Adet", value: "qty", align:"end", width: 80 },
        { text: "Birim", value: "birim", align:"end", width: 110 },
        { text: "Ciro", value: "ciro", align:"end", width: 120 },
        { text: "Kâr", value: "kar", align:"end", width: 110 },
      ],
      lowHeaders: [
        { text: "SKU", value: "sku", width: 140 },
        { text: "Ürün", value: "isim" },
        { text: "Stok", value: "stok", align:"end", width: 90 },
        { text: "Fiyat", value: "fiyat", align:"end", width: 120 },
      ],

      snack: { show:false, color:"green", text:"" },
    };
  },

  async created(){
    await ready();
    this.loadFromDb();
    this.setQuick("today");
  },

  computed: {
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },
    platformOptions(){ return this.platformMaster; },
    paymentOptions(){ return this.paymentMaster; },

    rangeStart(){ return this.parseInputDate(this.filters.startDate); },
    rangeEnd(){ return this.parseInputDate(this.filters.endDate, true); },

    filtered(){
      const q = (this.filters.q||"").toLowerCase().trim();
      const p = this.filters.platform;
      const pay = this.filters.payment;
      return this.orders.filter(o => {
        const inRange = (!this.rangeStart || o.date >= this.rangeStart) && (!this.rangeEnd || o.date <= this.rangeEnd);
        const txt = [o.id, o.urun, o.platform, o.payment].join(" ").toLowerCase();
        const qok = q ? txt.includes(q) : true;
        const pok = p ? o.platform === p : true;
        const payok = pay ? o.payment === pay : true;
        return inRange && qok && pok && payok;
      }).sort((a,b)=> b.date - a.date);
    },

    prevRange(){
      if(!this.rangeStart || !this.rangeEnd) return null;
      const ms = this.rangeEnd - this.rangeStart;
      const prevEnd = new Date(this.rangeStart.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - ms);
      return { start: prevStart, end: prevEnd };
    },
    filteredPrev(){
      if(!this.prevRange) return [];
      const { start, end } = this.prevRange;
      return this.orders.filter(o => o.date >= start && o.date <= end);
    },

    kpi(){
      const agg = this.aggregate(this.filtered);
      const prev = this.aggregate(this.filteredPrev);
      const safeDelta = (a,b)=> (b.totalGross>0 ? (a.totalGross - b.totalGross) / b.totalGross : null);

      return {
        revenueGross: agg.totalGross,
        revenueNet: agg.totalNet,
        vat: agg.totalVAT,
        profit: agg.totalProfit,
        orders: agg.orderCount,
        aov: agg.orderCount>0 ? agg.totalGross/agg.orderCount : 0,
        deltaRevenue: (prev ? safeDelta(agg, prev) : null),
        deltaProfit:  (prev ? (prev.totalProfit>0 ? (agg.totalProfit-prev.totalProfit)/prev.totalProfit : null) : null),
        deltaOrders:  (prev ? (prev.orderCount>0 ? (agg.orderCount-prev.orderCount)/prev.orderCount : null) : null),
        itemsPerOrder: agg.orderCount>0 ? agg.totalQty/agg.orderCount : 0,
      };
    },
    kpiCards(){
      return [
        { key:'gross',  title:'Ciro (KDV Dahil)', display:this.tl(this.kpi.revenueGross), delta:this.kpi.deltaRevenue },
        { key:'net',    title:'Net Ciro',         display:this.tl(this.kpi.revenueNet),   delta:null },
        { key:'vat',    title:'KDV',              display:this.tl(this.kpi.vat),          delta:null },
        { key:'profit', title:'Kâr',              display:this.tl(this.kpi.profit),       delta:this.kpi.deltaProfit },
        { key:'orders', title:'Sipariş',          display:String(this.kpi.orders),        delta:this.kpi.deltaOrders },
        { key:'aov',    title:'AOV',              display:this.tl(this.kpi.aov),          delta:null },
      ];
    },

    platformDist(){
      const total = this.kpi.revenueGross || 1;
      const m = {};
      this.filtered.forEach(o => { m[o.platform] = (m[o.platform]||0) + o.totalGross; });
      return Object.keys(m).map(k => ({ name:k, total:m[k], percent: m[k]/total })).sort((a,b)=> b.total-a.total);
    },
    paymentDist(){
      const total = this.kpi.revenueGross || 1;
      const m = {};
      this.filtered.forEach(o => { m[o.payment] = (m[o.payment]||0) + o.totalGross; });
      return Object.keys(m).map(k => ({ name:k, total:m[k], percent: m[k]/total })).sort((a,b)=> b.total-a.total);
    },

    topSellers(){
      const map = {};
      this.filtered.forEach(o => {
        if(!map[o.productId]) map[o.productId] = { urun:o.urun, qty:0, unit:o.unitGross, revenue:0, profit:0 };
        map[o.productId].qty += o.qty;
        map[o.productId].revenue += o.totalGross;
        map[o.productId].profit  += o.profit;
      });
      return Object.values(map).sort((a,b)=> b.qty - a.qty).slice(0,10).map(x => ({
        urun: x.urun, qty:x.qty, unit:x.unit, revenue:x.revenue, profit:x.profit
      }));
    },

    lowStock(){
      return [...this.products].sort((a,b)=> (a.stok||0) - (b.stok||0)).slice(0,8);
    },

    recentOrders(){ return this.filtered.slice(0, 50); }
  },

  methods: {
    // Tema
    setAccent(c){ this.accent = c; localStorage.setItem('jp_accent', c) },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark },

    // DB'DEN YÜKLE
    loadFromDb(){
      const dbProducts = get('products') || [];
      const dbOrders   = get('orders')   || [];
      const knownPlatforms = get('platforms') || get('settings.platforms') || null;

      this.products = dbProducts;
      this.orders   = this.flattenOrders(dbOrders, dbProducts);

      const fromOrdersPlatforms = Array.from(new Set(this.orders.map(o=>o.platform).filter(Boolean)));
      const fromOrdersPayments  = Array.from(new Set(this.orders.map(o=>o.payment).filter(Boolean)));
      this.platformMaster = knownPlatforms && knownPlatforms.length ? knownPlatforms : fromOrdersPlatforms;
      this.paymentMaster  = fromOrdersPayments.length ? fromOrdersPayments : ['Bilinmiyor'];
    },

    // DB.orders -> satır listesi
    flattenOrders(orderList, products){
      const byId = {};
      for(const p of (products||[])) byId[p.id] = p;

      const rows = [];
      for(const o of (orderList||[])){
        const date = new Date(o.date);
        const platform = o.platform || 'Bilinmiyor';
        const payment  = o.payment  || 'Bilinmiyor';

        (o.lines||[]).forEach((ln, idx) => {
          const prod = byId[ln.productId] || {};
          const calc = priceCalc(prod);
          const baseOne = Number(calc.base||0);

          let unitGross = (ln.manualPrice!=null) ? Number(ln.manualPrice) : Number(calc.priceGross||0);

          if(ln.discountType === 'pct'){
            unitGross = Math.max(0, unitGross * (1 - Number(ln.discountValue||0)/100));
          }else if(ln.discountType === 'tl'){
            unitGross = Math.max(0, unitGross - Number(ln.discountValue||0));
          }

          const qty = Number(ln.qty||1);
          const vatP = ln.vatPercent!=null ? Number(ln.vatPercent) : Number(prod.vatPercent||0);
          const unitNet = unitGross / (1 + vatP/100);

          const totalGross = unitGross * qty;
          const net        = unitNet   * qty;
          const vat        = totalGross - net;
          const baseCost   = baseOne * qty;
          const profit     = net - baseCost;

          rows.push({
            id: o.id, idx,
            date,
            productId: ln.productId,
            urun: prod.isim || `Ürün #${ln.productId}`,
            qty,
            unitGross, totalGross,
            baseCost, profit,
            net, vat,
            platform, payment
          });
        });
      }
      return rows.sort((a,b)=> b.date - a.date);
    },

    // Helpers
    tl(n){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n||0); },
    pct(x){ if(x==null) return "-%"; const v = Number(x)*100; return (isFinite(v)?v.toFixed(1):0) + '%'; },
    fmtDate(d){ const p=v=>String(v).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; },
    fmtDateTime(d){ const dt=(d instanceof Date)?d:new Date(d); const p=v=>String(v).padStart(2,"0"); return `${this.fmtDate(dt)} ${p(dt.getHours())}:${p(dt.getMinutes())}`; },
    fmtRange(s,e){ if(!s||!e) return '-'; return `${this.fmtDate(s)} → ${this.fmtDate(e)}`; },
    parseInputDate(str, endOfDay=false){ if(!str) return null; const d=new Date(str+"T00:00:00"); if(endOfDay) d.setHours(23,59,59,999); return isNaN(d)?null:d; },

    unitGross(p){ return priceCalc(p).priceGross; },

    exportCSV(){
      const rows = [["id","tarih","urun","qty","unitGross","totalGross","baseCost","profit","platform","payment"]];
      this.filtered.forEach(o=>{
        rows.push([o.id, this.fmtDateTime(o.date), o.urun, o.qty, o.unitGross, o.totalGross, o.baseCost, o.profit, o.platform, o.payment]);
      });
      const csv = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `rapor_${this.fmtDate(this.rangeStart||new Date())}_${this.fmtDate(this.rangeEnd||new Date())}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.snack = { show:true, color:'green', text:'CSV hazırlandı' };
    },

    yazdir(){ window.print(); },

    setQuick(mode){
      this.quick = mode;
      const today = new Date(); today.setHours(0,0,0,0);
      const toStr = d => { const p=v=>String(v).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; };

      let s = new Date(today), e = new Date(today);
      if(mode === 'today'){ /* bugün */ }
      if(mode === '7d'){ s = new Date(today); s.setDate(s.getDate()-6); }
      if(mode === 'month'){ s = new Date(today.getFullYear(), today.getMonth(), 1); e = new Date(today.getFullYear(), today.getMonth()+1, 0); }
      if(mode === 'year'){ s = new Date(today.getFullYear(), 0, 1); e = new Date(today.getFullYear(), 11, 31); }
      if(mode === 'all'){ s = new Date(today); s.setMonth(s.getMonth()-6); }

      this.filters.startDate = toStr(s);
      this.filters.endDate = toStr(e);
    },
    resetFilters(){
      this.filters.q=""; this.filters.platform=null; this.filters.payment=null; this.setQuick(this.quick||"today");
    },

    aggregate(list){
      let totalGross=0, totalNet=0, totalVAT=0, totalProfit=0, totalQty=0;
      const seenOrders = new Set();
      list.forEach(o=>{
        totalGross += o.totalGross;
        totalNet   += o.net;
        totalVAT   += o.vat;
        totalProfit+= o.profit;
        totalQty   += o.qty;
        seenOrders.add(o.id);
      });
      return { totalGross, totalNet, totalVAT, totalProfit, totalQty, orderCount: seenOrders.size };
    },
  }
};
</script>

<style scoped>
/* Drawer */
.elevated-drawer{
  border-top-right-radius:16px;
  border-bottom-right-radius:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
}

/* Hero */
.hero{ position:relative; height:120px; overflow:hidden; border-bottom:1px solid rgba(0,0,0,.04); }
.theme--light .hero{ background:linear-gradient(180deg,#ffffff,#fafafa); }
.theme--dark  .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10); }
.hero-glow{ position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite; filter:blur(42px); opacity:.55;
}
.theme--dark .hero-glow{ opacity:.35 }
.hero-content{ position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding:12px 24px }
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px }
.hero-sub{ opacity:.8 }

/* Quick actions */
.qa{
  display:flex; align-items:center;
  padding:10px 14px; margin-right:12px;
  border-radius:14px; border:1px solid transparent;
  background:rgba(255,255,255,.7); backdrop-filter:blur(6px);
  transition:transform .2s ease, box-shadow .2s ease;
}
.theme--dark .qa{ background:rgba(30,30,30,.7) }
.qa:hover{ transform:translateY(-3px); box-shadow:0 10px 20px rgba(0,0,0,.08) }

/* Filters */
.filters-sheet{
  border-radius:16px; padding:14px 16px;
  border:1px solid rgba(0,0,0,.06);
  background:rgba(255,255,255,.75);
  backdrop-filter:blur(8px) saturate(120%);
}
.theme--dark .filters-sheet{
  border-color:rgba(255,255,255,.06);
  background:rgba(24,24,24,.7);
}
.glass-btn{ background:rgba(255,255,255,.6); border:1px solid rgba(0,0,0,.06) }
.theme--dark .glass-btn{ background:rgba(24,24,24,.6); border-color:rgba(255,255,255,.08) }

/* Tables & Cards */
.table-card{ border-radius:16px; overflow:hidden }
.elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#fafafa,#f4f6f8) }
.theme--dark .elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#1d1d1d,#181818) }
.elevated-datatable ::v-deep tbody tr:hover{ background:rgba(0,0,0,.02) }
.theme--dark .elevated-datatable ::v-deep tbody tr:hover{ background:rgba(255,255,255,.04) }

/* KPI */
.kpi{ border-radius:14px; position:relative; overflow:hidden }
.kpi-glow{ content:''; position:absolute; inset:0 0 auto 0; height:6px; background:linear-gradient(90deg, var(--accent), transparent); opacity:.9 }

/* Print */
@media print{
  body *{ visibility:hidden !important }
  #reportPrint, #reportPrint *{ visibility:visible !important }
  #reportPrint{ position:absolute; left:0; top:0; width:100% }
}

/* Anim */
@keyframes float{ 0%{ transform:translate3d(0,0,0) rotate(0deg) } 50%{ transform:translate3d(2%,-2%,0) rotate(1deg) } 100%{ transform:translate3d(0,0,0) rotate(0deg) } }
</style>

<style>
/* v-main default top padding'i iptal et */
.v-main__wrap{ padding-top:0 !important; }
</style>
