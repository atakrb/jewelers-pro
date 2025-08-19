<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
    <v-navigation-drawer
        v-model="drawer"
        :mini-variant.sync="mini"
        :permanent="$vuetify.breakpoint.lgAndUp"
        expand-on-hover
        app width="280"
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
            :key="it.to" :to="{ name: it.to }"
            link exact class="rounded-lg"
        >
          <v-list-item-icon><v-icon>{{ it.icon }}</v-icon></v-list-item-icon>
          <v-list-item-title>{{ it.title }}</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item class="rounded-lg">
          <v-list-item-icon><v-icon>mdi-palette</v-icon></v-list-item-icon>
          <v-list-item-title>Vurgu</v-list-item-title>
          <v-spacer/>
          <v-btn
              v-for="c in accents" :key="c"
              icon small :style="{ color: c }"
              @click="setAccent(c)"
          ><v-icon>mdi-circle</v-icon></v-btn>
        </v-list-item>

        <v-list-item class="rounded-lg" @click="cycleTheme">
          <v-list-item-icon><v-icon>mdi-theme-light-dark</v-icon></v-list-item-icon>
          <v-list-item-title>Tema</v-list-item-title>
          <v-spacer/><v-chip x-small>{{ themeLabel }}</v-chip>
        </v-list-item>

        <v-list-item :to="{ name:'musteriBilgi' }" class="rounded-lg" link>
          <v-list-item-icon><v-icon>mdi-lifebuoy</v-icon></v-list-item-icon>
          <v-list-item-title>Destek</v-list-item-title>
        </v-list-item>

        <v-list-item :to="{ name:'urunler' }" class="rounded-lg" link>
          <v-list-item-icon><v-icon>mdi-plus</v-icon></v-list-item-icon>
          <v-list-item-title>Yeni Sipariş Ekle</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <div class="hero">
      <div class="hero-glow" :style="{ '--accent': accent }"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Müşteriler & Sipariş Özeti</h2>
        <div class="hero-sub">Müşteri kayıtları, siparişler ve durumlar — tek ekranda.</div>
      </div>
    </div>

    <v-container fluid class="pt-4 pb-0">
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
            <v-spacer/>
            <v-chip x-small :color="accent" text-color="white">{{ qa.key }}</v-chip>
          </v-card>
        </v-slide-item>
      </v-slide-group>
    </v-container>

    <v-container fluid class="pt-4 pb-0">
      <v-sheet class="filters-sheet">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
                v-model="filters.q" dense outlined clearable hide-details
                label="Ara (ad, telefon, e-posta, adres)"
                prepend-inner-icon="mdi-magnify"
            />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.platform" :items="platformOptions" dense outlined hide-details clearable label="Platform"/>
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.status" :items="statusOptions" dense outlined hide-details clearable label="Durum"/>
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="filters.startDate" type="date" dense outlined hide-details label="Başlangıç"/>
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="filters.endDate" type="date" dense outlined hide-details label="Bitiş"/>
          </v-col>
        </v-row>

        <div class="d-flex flex-wrap mt-3">
          <v-chip small class="mr-2 mb-1" :color="quick==='today' ? 'indigo' : ''" :text-color="quick==='today' ? 'white' : ''" @click="setQuick('today')">Bugün</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='7d' ? 'indigo' : ''" :text-color="quick==='7d' ? 'white' : ''" @click="setQuick('7d')">7 Gün</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='month' ? 'indigo' : ''" :text-color="quick==='month' ? 'white' : ''" @click="setQuick('month')">Bu Ay</v-chip>

          <v-spacer/>
          <v-btn small class="mr-2 glass-btn" @click="resetFilters"><v-icon left small>mdi-filter-off</v-icon> Sıfırla</v-btn>
          <v-btn small :color="accent" dark @click="openCustomerDialog()"><v-icon left small>mdi-account-plus</v-icon> Yeni Müşteri</v-btn>
        </div>
      </v-sheet>
    </v-container>

    <v-container fluid>
      <v-card outlined class="table-card">
        <v-data-table
            :headers="headers"
            :items="filteredCustomers"
            :items-per-page="10"
            item-key="id"
            dense fixed-header
            class="px-2 elevated-datatable"
        >
          <template v-slot:item.customer="{ item }">
            <div class="font-weight-medium">{{ item.fullName }}</div>
            <div class="caption grey--text">#{{ item.id }}</div>
          </template>

          <template v-slot:item.contact="{ item }">
            <div class="d-flex align-center">
              <span class="mr-2">{{ item.phone || '-' }}</span>
              <v-btn v-if="item.phone" icon x-small :href="'tel:' + item.phone"><v-icon small>mdi-phone</v-icon></v-btn>
              <v-btn v-if="item.phone" icon x-small :href="waLink(item.phone)" target="_blank"><v-icon small color="green">mdi-whatsapp</v-icon></v-btn>
            </div>
            <div class="caption grey--text">{{ item.email || '-' }}</div>
          </template>

          <template v-slot:item.addressShort="{ item }">
            <div class="d-flex align-center">
              <span class="mr-2">{{ item.addressShort || '-' }}</span>
              <v-btn v-if="item.addressShort" icon x-small @click="copy(item.addressShort)"><v-icon small>mdi-content-copy</v-icon></v-btn>
            </div>
          </template>

          <template v-slot:item.lastOrderAt="{ item }">
            {{ fmtDateTime(item.lastOrderAt) }}
          </template>

          <template v-slot:item.platforms="{ item }">
            <div class="d-flex flex-wrap">
              <v-chip
                  v-for="(p,i) in item.platforms"
                  :key="p + i" x-small class="mr-1 mb-1"
                  :color="accent" text-color="white"
              >{{ p }}</v-chip>
              <span v-if="item.platforms.length===0" class="caption grey--text">-</span>
            </div>
          </template>

          <template v-slot:item.shippingStatus="{ item }">
            <v-chip :color="statusColor(item.shippingStatus)" text-color="white" small>
              {{ item.shippingStatus || '-' }}
            </v-chip>
          </template>

          <template v-slot:item.progress="{ item }">
            <v-chip :color="item.isDone ? 'teal' : 'orange'" text-color="white" small>
              {{ item.isDone ? 'Tamamlandı' : 'Devam Ediyor' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon small @click="openCustomerInfoDialog(item)"><v-icon small>mdi-account-details</v-icon></v-btn>
            <v-btn icon small @click="openCustomerDialog(item)"><v-icon small>mdi-account-edit</v-icon></v-btn>
            <v-btn icon small @click="openOrderDialog(null, item)"><v-icon small>mdi-cart-plus</v-icon></v-btn>
          </template>

          <template v-slot:footer.prepend>
            <div class="px-4 py-2">
              <v-chip small class="mr-2">Müşteri: {{ filteredCustomers.length }}</v-chip>
              <v-chip small color="teal" text-color="white" class="mr-2">Toplam Sipariş: {{ totalOrders }}</v-chip>
              <v-chip small color="deep-purple" text-color="white">Ciro (filtre): {{ tl(totalRevenue) }}</v-chip>
            </div>
          </template>
        </v-data-table>      </v-card>
    </v-container>

    <v-dialog v-model="dialogs.customer" max-width="560px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ customerForm.id ? 'Müşteri Düzenle' : 'Yeni Müşteri' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="customerFormRef">
            <v-text-field v-model="customerForm.fullName" label="Ad Soyad" dense outlined required />
            <v-text-field v-model="customerForm.phone" label="Telefon" dense outlined />
            <v-text-field v-model="customerForm.email" label="E-posta" dense outlined />
            <v-text-field v-model="customerForm.addressShort" label="Kısa Adres" dense outlined />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.customer=false">Vazgeç</v-btn>
          <v-spacer/><v-btn :color="accent" dark @click="saveCustomer" :disabled="!customerForm.fullName">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogs.order" max-width="720px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ orderForm.id ? 'Sipariş Düzenle' : 'Yeni Sipariş' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="orderFormRef">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                    v-model="orderForm.customerId"
                    :items="customers.map(c=>({ text: c.fullName + ' (#'+c.id+')', value: c.id }))"
                    label="Müşteri" dense outlined
                    :disabled="!!orderFixedCustomer"
                    :rules="[v=>!!v || 'Zorunlu']" required
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model="orderForm.date" type="datetime-local" label="Tarih" dense outlined />
              </v-col>
              <v-col cols="6" md="3">
                <v-select v-model="orderForm.platform" :items="platformMaster" label="Platform" dense outlined clearable />
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="4" md="2"><v-text-field v-model.number="orderForm.items" type="number" min="1" label="Adet" dense outlined /></v-col>
              <v-col cols="8" md="4"><v-text-field v-model.number="orderForm.total" type="number" min="0" label="Tutar" dense outlined /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="orderForm.cargoCompany" label="Kargo" dense outlined /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="orderForm.trackingNo" label="Takip No" dense outlined /></v-col>
            </v-row>

            <v-row dense>
              <v-col cols="6" md="3">
                <v-select v-model="orderForm.status" :items="statusOptions" label="Durum" dense outlined />
              </v-col>
              <v-col cols="6" md="4">
                <v-text-field v-model="orderForm.deliveredAt" type="datetime-local" label="Teslim Tarihi" dense outlined />
              </v-col>
            </v-row>
            <div class="caption grey--text">* Müşteri seçmeden kaydedemezsin.</div>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.order=false">Vazgeç</v-btn>
          <v-spacer/><v-btn :color="accent" dark :disabled="!orderForm.customerId" @click="saveOrder">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogs.customerInfo" max-width="600px">
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2200">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
import { get } from '@/utils/harddata'
import { priceCalc } from '@/utils/pricing'

export default {
  name: "MusteriBilgileriPage",
  data() {
    return {
      // tema
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini: this.$vuetify?.breakpoint?.lgAndUp || false,
      accent: localStorage.getItem('jp_accent') || '#5865F2',
      accents: ["#5B6EF7","#6E7CFF","#7C8AFF","#4FA5FF","#36C2C2","#E5B25E","#8BA0B8"],
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
        { key:'Y', icon:'mdi-account-plus', title:'Yeni Müşteri', subtitle:'Hızlı ekle', click:()=>this.openCustomerDialog() },
        { key:'S', icon:'mdi-cart-plus',    title:'Yeni Sipariş', subtitle:'Hızlı ekle', click:()=>this.openOrderDialog() },
        { key:'T', icon:'mdi-clock-check-outline', title:'Bugün', subtitle:'Bugün siparişler', click:()=>this.setQuick('today') },
        { key:'H', icon:'mdi-calendar-week',       title:'Haftalık', subtitle:'Son 7 gün siparişler', click:()=>this.setQuick('7d') },
      ],
      quick: 'today',


      // veri
      customers: [],
      filters: { q: "", platform: null, status: null, startDate: "", endDate: "" },

      headers: [
        { text: "Müşteri", value: "customer", width: 200 },
        { text: "İletişim", value: "contact", width: 220 },
        { text: "Kısa Adres", value: "addressShort", width: 160 },
        { text: "Son Sipariş", value: "lastOrderAt", width: 150 },
        { text: "Sipariş Sayısı", value: "orderCount", width: 120, align: "end" },
        { text: "Platform(lar)", value: "platforms" },
        { text: "Kargo Durumu", value: "shippingStatus", width: 140 },
        { text: "Süreç", value: "progress", width: 120 },
        { text: "", value: "actions", sortable: false, width: 120, align: "end" },
      ],
      orderHeaders: [
        { text: "Tarih", value: "tarih", width: 170 },
        { text: "No", value: "id", width: 80 },
        { text: "Platform", value: "platform", width: 120 },
        { text: "Adet", value: "items", width: 80, align: "end" },
        { text: "Tutar", value: "tutar", width: 120, align: "end" },
        { text: "Kargo", value: "cargoCompany", width: 130 },
        { text: "Takip No", value: "trackingNo", width: 130 },
        { text: "Durum", value: "status", width: 120 },
        { text: "Teslim", value: "teslim", width: 170 },
        { text: "", value: "ops", sortable: false, width: 90, align: "end" },
      ],

      expanded: [],
      dialogs: { customer: false, order: false, customerInfo: false },
      customerForm: { id: null, fullName: "", phone: "", email: "", addressShort: "" },
      orderForm: {
        id: null, customerId: null,
        date: "", platform: "", items: 1, total: 0,
        cargoCompany: "", trackingNo: "", status: "Hazırlanıyor",
        deliveredAt: ""
      },
      orderFixedCustomer: null,

      // müşteri içi not/etiket taslakları
      noteDrafts: {},
      tagDrafts: {},
      customerInfoData: null,


      snack: { show:false, color:"green", text:"" },
      platformMaster: ["Mağaza","Web","Instagram","WhatsApp","Trendyol","Hepsiburada","N11"],
    };
  },

  created(){
    try{
      const dbCustomers = get('customers') || [];
      const dbOrders    = get('orders')    || [];
      const dbShipments = get('shipments') || [];
      const products    = get('products')  || [];
      const platforms   = get('platforms');
      if (Array.isArray(platforms) && platforms.length) this.platformMaster = platforms;

      this.customers = dbCustomers.map(c => {
        const ordersFor = dbOrders.filter(o => o.customerId === c.id);
        const normalizedOrders = this.normalizeOrders(ordersFor, dbShipments, products);
        return {
          id: c.id,
          fullName: c.name || c.fullName || '',
          phone: c.phone || '',
          email: c.email || '',
          addressShort: c.addressShort || [c.city, c.district].filter(Boolean).join(', '),
          tags: Array.isArray(c.tags) ? c.tags : [],
          notes: Array.isArray(c.notes) ? c.notes : [],
          orders: normalizedOrders
        };
      });

      this.setQuick('today');
    }catch(e){
      console.error('musteriler yüklenemedi:', e);
      this.customers = [];
    }
  },

  computed: {
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },
    platformOptions() {
      const set = new Set(this.platformMaster);
      this.customers.forEach(c => c.orders.forEach(o => o.platform && set.add(o.platform)));
      return Array.from(set);
    },
    statusOptions() {
      const s = new Set();
      this.customers.forEach(c => c.orders.forEach(o => o.status && s.add(o.status)));
      return Array.from(s);
    },
    customersEnriched() {
      return this.customers.map(c => {
        const sorted = [...c.orders].sort((a,b) => new Date(b.date) - new Date(a.date));
        const last = sorted[0] || null;
        const platforms = Array.from(new Set(c.orders.map(o => o.platform).filter(Boolean)));
        const orderCount = c.orders.length;
        const lastOrderAt = last ? new Date(last.date) : null;
        const shippingStatus = last ? last.status : null;
        const isDone = shippingStatus === "Teslim Edildi";
        return { ...c, platforms, orderCount, lastOrderAt, shippingStatus, isDone, orders: sorted };
      });
    },
    filteredCustomers() {
      const q = (this.filters.q || "").toLowerCase().trim();
      const p = this.filters.platform;
      const s = this.filters.status;
      const sd = this.parseDate(this.filters.startDate);
      const ed = this.parseDate(this.filters.endDate, true);

      return this.customersEnriched.filter(c => {
        const txt = [c.fullName, c.phone, c.email, c.addressShort].join(" ").toLowerCase();
        const matchQ = q ? txt.includes(q) : true;
        const matchP = p ? c.platforms.includes(p) : true;
        const matchS = s ? c.shippingStatus === s : true;
        const matchDate = (sd || ed)
            ? c.orders.some(o => { const d = new Date(o.date); return (!sd || d >= sd) && (!ed || d <= ed); })
            : true;
        return matchQ && matchP && matchS && matchDate;
      });
    },
    totalOrders() { return this.filteredCustomers.reduce((t,c)=> t + c.orders.length, 0); },
    totalRevenue() { return this.filteredCustomers.reduce((t,c)=> t + c.orders.reduce((x,o)=>x+o.total,0), 0); }
  },

  methods: {
    // tema
    setAccent(c){ this.accent = c; localStorage.setItem('jp_accent', c) },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark },

    // hızlı tarih aralıkları
    setQuick(mode){
      this.quick = mode;
      const d = new Date(); const p = v => String(v).padStart(2,'0');
      const today = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
      if(mode==='today'){
        this.filters.startDate = today; this.filters.endDate = today;
      }else if(mode==='7d'){
        const d2 = new Date(d); d2.setDate(d2.getDate() - 6);
        this.filters.startDate = `${d2.getFullYear()}-${p(d2.getMonth()+1)}-${p(d2.getDate())}`; this.filters.endDate = today;
      }else if(mode==='month'){
        const d2 = new Date(d.getFullYear(), d.getMonth(), 1);
        this.filters.startDate = `${d2.getFullYear()}-${p(d2.getMonth()+1)}-${p(d2.getDate())}`; this.filters.endDate = today;
      }
    },
    resetFilters(){ this.filters = { q:"", platform:null, status:null, startDate:"", endDate:"" } },

    /* ---------- DB order -> UI order normalize ---------- */
    normalizeOrders(orders, shipments, products){
      const findProduct = id => (products||[]).find(p => p.id === id) || {};
      const shipOf = orderId => (shipments||[]).find(s => s.orderId === orderId) || null;

      return (orders||[]).map(o => {
        const items = (o.lines||[]).reduce((t,l)=> t + Number(l.qty||0), 0);
        let totalGross = 0;
        (o.lines||[]).forEach(l => {
          const prod = findProduct(l.productId);
          const calc = priceCalc(prod);
          let unitGross = (l.manualPrice != null && !isNaN(l.manualPrice))
              ? Number(l.manualPrice) : calc.priceGross;

          if(l.discountType === 'pct')      unitGross = Math.max(0, unitGross * (1 - Number(l.discountValue||0)/100));
          else if(l.discountType === 'tl')  unitGross = Math.max(0, unitGross - Number(l.discountValue||0));

          totalGross += unitGross * (Number(l.qty)||0);
        });

        const sh = shipOf(o.id);
        const deliveredEvent = sh?.events?.find(e => e.code === 'DELIVER') || null;

        return {
          id: o.id,
          date: o.date,
          platform: o.platform || '',
          items,
          total: Math.round(totalGross),
          cargoCompany: sh ? sh.carrier : (o.cargoCompany || ''),
          trackingNo: sh ? sh.trackingNo : (o.trackingNo || ''),
          status: sh ? sh.status : (o.status || 'Hazırlanıyor'),
          deliveredAt: deliveredEvent ? deliveredEvent.time : (o.deliveredAt || null)
        };
      });
    },

    // helpers
    tl(n){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n||0); },
    fmtDateTime(d){ if(!d) return "-"; const dt=(d instanceof Date)?d:new Date(d); const p=v=>String(v).padStart(2,"0"); return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}`; },
    parseDate(s, endOfDay=false){ if(!s) return null; const d=new Date(s+"T00:00:00"); if(endOfDay) d.setHours(23,59,59,999); return isNaN(d)?null:d; },
    statusColor(st){ return st==="Teslim Edildi"?"teal": st==="Dağıtımda"?"indigo": st==="Kargoya Verildi"?"blue": st==="Hazırlanıyor"?"orange":"grey"; },
    statusIcon(st){ return st==="Teslim Edildi"?'mdi-check-circle': st==="Dağıtımda"?'mdi-truck-delivery': st==="Kargoya Verildi"?'mdi-package-variant-closed':'mdi-progress-clock'; },
    newId(){ return Date.now() + Math.floor(Math.random()*1000); },
    toast(text,color="green"){ this.snack={show:true,color,text}; },
    initials(n){ return (n||'').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase() || 'M'; },

    // etiket & not
    addTag(c){ const t=(this.tagDrafts[c.id]||'').trim(); if(!t) return; c.tags=c.tags||[]; if(!c.tags.includes(t)) c.tags.push(t); this.tagDrafts[c.id]=''; },
    removeTag(c,t){ c.tags = (c.tags||[]).filter(x=>x!==t); },
    addNote(c){ const txt=(this.noteDrafts[c.id]||'').trim(); if(!txt) return; c.notes=c.notes||[]; c.notes.push({ id:this.newId(), text:txt, at:new Date().toISOString() }); this.noteDrafts[c.id]=''; this.toast('Not eklendi'); },
    showAllNotes(c){ alert((c.notes||[]).map(n=>`${this.fmtDateTime(n.at)} — ${n.text}`).join('\n')); },

    // müşteri CRUD (runtime)
    openCustomerDialog(c=null){
      this.customerForm = c ? { ...c } : { id:null, fullName:"", phone:"", email:"", addressShort:"" };
      this.dialogs.customer = true;
    },
    saveCustomer(){
      const f = this.customerForm;
      if(!f.fullName){ this.toast("Ad Soyad zorunlu","red"); return; }
      if(f.id){
        const i = this.customers.findIndex(x=>x.id===f.id);
        if(i>-1) this.$set(this.customers, i, { ...this.customers[i], ...f });
        this.toast("Müşteri güncellendi");
      }else{
        this.customers.push({ ...f, id: this.newId(), orders: [], notes: [], tags: [] });
        this.toast("Müşteri eklendi");
      }
      this.dialogs.customer = false;
    },
    removeCustomer(c){
      if(confirm(`"${c.fullName}" silinsin mi? (Tüm siparişleriyle)`)){
        const i = this.customers.findIndex(x=>x.id===c.id);
        if(i>-1) this.customers.splice(i,1);
        this.toast("Müşteri silindi");
      }
    },

    // sipariş CRUD (runtime)
    openOrderDialog(order=null, customer=null){
      this.orderFixedCustomer = null;
      if(order){
        const owner = this.customers.find(c => c.orders.some(o => o.id===order.id));
        this.orderForm = {
          id: order.id,
          customerId: owner ? owner.id : null,
          date: this.toLocalInput(order.date),
          platform: order.platform || "",
          items: order.items || 1,
          total: order.total || 0,
          cargoCompany: order.cargoCompany || "",
          trackingNo: order.trackingNo || "",
          status: order.status || "Hazırlanıyor",
          deliveredAt: order.deliveredAt ? this.toLocalInput(order.deliveredAt) : ""
        };
      }else{
        this.orderForm = {
          id: null,
          customerId: customer ? customer.id : null,
          date: this.toLocalInput(new Date()),
          platform: "",
          items: 1,
          total: 0,
          cargoCompany: "",
          trackingNo: "",
          status: "Hazırlanıyor",
          deliveredAt: ""
        };
        if(customer){ this.orderFixedCustomer = customer.id; }
      }
      this.dialogs.order = true;
    },
    saveOrder(){
      const f = this.orderForm;
      if(!f.customerId){ this.toast("Müşteri seç","red"); return; }
      const cust = this.customers.find(c=>c.id===f.customerId);
      if(!cust){ this.toast("Müşteri bulunamadı","red"); return; }

      const normalized = {
        id: f.id || this.newId(),
        date: this.fromLocalInput(f.date) || new Date().toISOString(),
        platform: f.platform || "",
        items: Number(f.items)||1,
        total: Number(f.total)||0,
        cargoCompany: f.cargoCompany || "",
        trackingNo: f.trackingNo || "",
        status: f.status || "Hazırlanıyor",
        deliveredAt: f.deliveredAt ? this.fromLocalInput(f.deliveredAt) : null
      };

      if(f.id){
        const oldOwner = this.customers.find(c => c.orders.some(o => o.id===f.id));
        if(oldOwner && oldOwner.id !== cust.id){
          const idx = oldOwner.orders.findIndex(o => o.id===f.id);
          const old = oldOwner.orders[idx];
          oldOwner.orders.splice(idx,1);
          cust.orders.push({ ...old, ...normalized });
        }else{
          const idx = cust.orders.findIndex(o => o.id===f.id);
          if(idx>-1) this.$set(cust.orders, idx, { ...cust.orders[idx], ...normalized });
        }
        this.toast("Sipariş güncellendi");
      }else{
        cust.orders.push(normalized);
        this.toast("Sipariş eklendi");
      }
      this.dialogs.order = false;
    },
    removeOrder(customer, order){
      const owner = customer || this.customers.find(c => c.orders.some(o => o.id===order.id));
      if(!owner) return;
      if(confirm(`#${order.id} sipariş silinsin mi?`)){
        const i = owner.orders.findIndex(o=>o.id===order.id);
        if(i>-1) owner.orders.splice(i,1);
        this.toast("Sipariş silindi");
      }
    },

    // datetime-local yardımcıları
    toLocalInput(d){
      const dt = (d instanceof Date) ? d : new Date(d);
      if(isNaN(dt)) return "";
      const p=v=>String(v).padStart(2,"0");
      return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}`;
    },
    fromLocalInput(s){ if(!s) return null; const d=new Date(s); return isNaN(d)?null:d.toISOString(); },

    // kpi
    kpi(customer) {
      const count = customer.orders.length;
      const revenue = customer.orders.reduce((sum, o) => sum + o.total, 0);
      const deliveredCount = customer.orders.filter(o => o.status === 'Teslim Edildi').length;

      return {
        count,
        revenue,
        avg: count > 0 ? revenue / count : 0,
        deliveredRate: count > 0 ? deliveredCount / count : 0
      };
    },
    waLink(phone){
      if(!phone) return null;
      const digits = String(phone).replace(/\D/g,'');
      return `https://wa.me/${digits}`;
    },
    async copy(text){
      if(!text) return;
      try{
        await navigator.clipboard.writeText(text);
        this.toast('Panoya kopyalandı');
      }catch(e){
        this.toast('Kopyalanamadı','red');
      }
    },
    openCustomerInfoDialog(c){
      this.customerInfoData = c;
      this.dialogs.customerInfo = true;
    },
    getLogs(customer) {
      const logs = [];

      (customer.orders || []).forEach(o => {
        logs.push({
          date: new Date(o.date),
          title: `Sipariş Oluşturuldu - #${o.id}`,
          subtitle: `${o.total} TL tutarında sipariş. Platform: ${o.platform}`,
          color: 'blue',
          icon: 'mdi-cart-plus',
        });
        if (o.deliveredAt) {
          logs.push({
            date: new Date(o.deliveredAt),
            title: `Sipariş Teslim Edildi - #${o.id}`,
            subtitle: `${o.trackingNo ? 'Kargo No: ' + o.trackingNo : ''}`,
            color: 'teal',
            icon: 'mdi-truck-check',
          });
        }
      });

      (customer.notes || []).forEach(n => {
        logs.push({
          date: new Date(n.at),
          title: 'Yeni Not Eklendi',
          subtitle: n.text,
          color: 'purple',
          icon: 'mdi-note',
        });
      });

      (customer.tags || []).forEach(t => {
        logs.push({
          date: new Date(),
          title: 'Yeni Etiket Eklendi',
          subtitle: `Etiket: ${t}`,
          color: 'orange',
          icon: 'mdi-tag',
        });
      });

      return logs.sort((a, b) => b.date - a.date);
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
.hero-glow{ position:absolute; inset:-30%; background:
    radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
    radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
    linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite; filter:blur(42px); opacity:.55; }
.theme--dark .hero-glow{ opacity:.35; }
.hero-content{ position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding:12px 24px; }
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px; }
.hero-sub{ opacity:.8 }

/* Quick actions */
.qa{
  display:flex; align-items:center;
  padding:10px 14px; margin-right:12px;
  border-radius:14px; border:1px solid transparent;
  background:rgba(255,255,255,.7);
  backdrop-filter:blur(6px);
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
.theme--dark .filters-sheet{ border-color:rgba(255,255,255,.06); background:rgba(24,24,24,.7); }
.glass-btn{ background:rgba(255,255,255,.6); border:1px solid rgba(0,0,0,.06) }
.theme--dark .glass-btn{ background:rgba(24,24,24,.6); border-color:rgba(255,255,255,.08) }

/* Table */
.table-card{ border-radius:16px; overflow:hidden }
.elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#fafafa,#f4f6f8) }
.theme--dark .elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#1d1d1d,#181818) }
.elevated-datatable ::v-deep tbody tr:hover{ background:rgba(0,0,0,.02) }
.theme--dark .elevated-datatable ::v-deep tbody tr:hover{ background:rgba(255,255,255,.04) }

/* Expanded area */
.cust-expansion{
  background: linear-gradient(180deg, rgba(0,0,0,.02), transparent);
  padding:14px 14px 4px; border-top:1px solid rgba(0,0,0,.06);
}
.cust-card{
  border:1px solid rgba(0,0,0,.06); border-radius:14px;
  padding:12px; background:rgba(255,255,255,.7)
}
.theme--dark .cust-card{ border-color:rgba(255,255,255,.08); background:rgba(28,28,28,.6) }
.cust-card-header{ display:flex; align-items:center; }
.min-w-0{ min-width:0 }
.truncate-2{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }
.tag-input{ max-width:120px }
.notes-list .note{ border-left:3px solid var(--accent); padding-left:8px; margin-bottom:8px }

/* Metrics */
.metric{ border:1px solid rgba(0,0,0,.06); border-radius:14px; padding:10px 12px; background:rgba(255,255,255,.6) }
.theme--dark .metric{ border-color:rgba(255,255,255,.08); background:rgba(28,28,28,.6) }
.metric-label{ font-size:.72rem; opacity:.7 }
.metric-value{ font-size:1.05rem; font-weight:700 }

/* Sparkline & blocks */
.sparkline-card, .order-card, .timeline-card{
  border:1px solid rgba(0,0,0,.06); border-radius:14px; padding:10px 12px; margin-top:8px;
  background:rgba(255,255,255,.6)
}
.theme--dark .sparkline-card, .theme--dark .order-card, .theme--dark .timeline-card{
  border-color:rgba(255,255,255,.08); background:rgba(28,28,28,.6)
}

/* Misc */
@keyframes float{ 0%{transform:translate3d(0,0,0) rotate(0deg)} 50%{transform:translate3d(2%,-2%,0) rotate(1deg)} 100%{transform:translate3d(0,0,0) rotate(0deg)} }
.v-data-table .v-data-table__wrapper{ font-size:.92rem; }
.font-weight-600{ font-weight:600 }
</style>

<style>
/* v-main default top padding'i iptal et */
.v-main__wrap{ padding-top:0 !important; }
</style>