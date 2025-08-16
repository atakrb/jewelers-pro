<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
    <!-- SOL YAN MENÜ -->
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
            link
            exact
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
              icon
              small
              :style="{ color: c }"
              @click="setAccent(c)"
          ><v-icon>mdi-circle</v-icon></v-btn>
        </v-list-item>

        <v-list-item class="rounded-lg" @click="cycleTheme">
          <v-list-item-icon><v-icon>mdi-theme-light-dark</v-icon></v-list-item-icon>
          <v-list-item-title>Tema</v-list-item-title>
          <v-spacer /><v-chip x-small>{{ themeLabel }}</v-chip>
        </v-list-item>

        <v-list-item :to="{ name: 'musteriBilgi' }" class="rounded-lg" link>
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
        <h2 class="hero-title">Stok & Envanter</h2>
        <div class="hero-sub">Filtrele, hareket gir, sayım yap ve raporla.</div>
      </div>
    </div>

    <!-- HIZLI AKSİYONLAR -->
    <v-container class="pt-4 pb-0">
      <v-slide-group show-arrows>
        <v-slide-item v-for="qa in quickActions" :key="qa.key">
          <v-card class="qa" :style="{ borderColor: accent }" @click="qa.click && qa.click()">
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

    <!-- SAYFA GÖVDE -->
    <v-container class="pt-4">
      <!-- FİLTRE ŞERİDİ -->
      <v-sheet class="filters-sheet sticky-top mb-3">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field
                v-model="filters.q"
                dense outlined clearable hide-details
                label="Ara (ad, SKU, barkod, karat, ayar)"
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="quickSearchEnter"
            />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.categoryId" :items="categories.map(c=>({text:c.name,value:c.id}))"
                      dense outlined clearable hide-details label="Kategori"/>
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.supplierId" :items="suppliers.map(s=>({text:s.name,value:s.id}))"
                      dense outlined clearable hide-details label="Toptancı"/>
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.type" :items="typeOptions" dense outlined clearable hide-details label="Tür"/>
          </v-col>
          <v-col cols="6" md="2" class="d-flex align-center">
            <v-checkbox v-model="filters.inStockOnly" hide-details label="Stokta"/>
          </v-col>
        </v-row>

        <div class="d-flex flex-wrap mt-1">
          <v-chip small class="mr-2 mb-1" :color="quick==='low' ? 'orange' : ''" :text-color="quick==='low' ? 'white' : ''" @click="setQuick('low')">Düşük Stok (≤ Min)</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='out' ? 'red' : ''" :text-color="quick==='out' ? 'white' : ''" @click="setQuick('out')">Stok Yok</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='all' ? accent : ''" :text-color="quick==='all' ? 'white' : ''" @click="setQuick('all')">Tümü</v-chip>

          <v-spacer/>
          <v-btn small class="glass-btn mr-2" @click="openMovementDialog(null)"><v-icon left small>mdi-swap-vertical</v-icon> Hareket Ekle</v-btn>
          <v-btn small class="glass-btn mr-2" @click="exportCSV"><v-icon left small>mdi-file-delimited</v-icon> CSV</v-btn>
          <v-btn small class="glass-btn" @click="yazdir"><v-icon left small>mdi-printer</v-icon> Yazdır (Rapor)</v-btn>
        </div>
      </v-sheet>

      <!-- KPI KARTLARI -->
      <div id="stockPrint">
        <v-row dense>
          <v-col cols="12" md="2">
            <v-card outlined class="kpi"><v-card-text class="py-3">
              <div class="caption">Ürün</div>
              <div class="headline font-weight-bold">{{ filtered.length }}</div>
            </v-card-text></v-card>
          </v-col>
          <v-col cols="12" md="2">
            <v-card outlined class="kpi"><v-card-text class="py-3">
              <div class="caption">Toplam Adet</div>
              <div class="headline font-weight-bold">{{ totalUnits }}</div>
            </v-card-text></v-card>
          </v-col>
          <v-col cols="12" md="2">
            <v-card outlined class="kpi"><v-card-text class="py-3">
              <div class="caption">Stok Değeri (Baz)</div>
              <div class="headline font-weight-bold">{{ tl(stockValueBase) }}</div>
            </v-card-text></v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card outlined class="kpi"><v-card-text class="py-3">
              <div class="caption">Perakende Değeri (KDV)</div>
              <div class="headline font-weight-bold">{{ tl(stockValueRetail) }}</div>
            </v-card-text></v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card outlined class="kpi"><v-card-text class="py-3">
              <div class="caption">Beklenen Kâr</div>
              <div class="headline font-weight-bold">{{ tl(stockExpectedProfit) }}</div>
            </v-card-text></v-card>
          </v-col>
        </v-row>

        <!-- STOK TABLOSU -->
        <v-card class="mt-3 table-card" outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Stok Listesi</v-card-title>
          <v-data-table
              :headers="headers"
              :items="filtered"
              dense fixed-header height="580"
              :items-per-page="12"
          >
            <template v-slot:item.product="{ item }">
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="caption grey--text">#{{ item.sku || item.id }} • {{ item.karat ? item.karat + 'k' : '' }} {{ item.ayar }}</div>
            </template>
            <template v-slot:item.type="{ item }">{{ item.type }}</template>
            <template v-slot:item.category="{ item }">{{ categoryName(item.categoryId) }}</template>
            <template v-slot:item.supplier="{ item }">{{ supplierName(item.supplierId) }}</template>

            <template v-slot:item.stock="{ item }">
              <v-chip small :color="stockColor(item)" text-color="white">{{ item.stock }}</v-chip>
            </template>
            <template v-slot:item.minStock="{ item }">
              <div class="d-flex align-center justify-end">
                <v-text-field v-model.number="item.minStock" type="number" min="0" dense hide-details class="text-right" style="max-width:80px"/>
              </div>
            </template>

            <template v-slot:item.cost="{ item }">{{ tl(item.cost) }}</template>
            <template v-slot:item.extras="{ item }">{{ tl(item.extras||0) }}</template>
            <template v-slot:item.base="{ item }">{{ tl(priceCalc(item).base) }}</template>
            <template v-slot:item.unit="{ item }">{{ tl(priceCalc(item).priceGross) }}</template>
            <template v-slot:item.profitPP="{ item }">{{ tl(priceCalc(item).profitTL) }}</template>
            <template v-slot:item.profitPct="{ item }">{{ priceCalc(item).profitPct.toFixed(1) }}%</template>
            <template v-slot:item.valueBase="{ item }">{{ tl(item.stock * priceCalc(item).base) }}</template>
            <template v-slot:item.valueRetail="{ item }">{{ tl(item.stock * priceCalc(item).priceGross) }}</template>

            <template v-slot:item.ops="{ item }">
              <v-btn icon small @click="decStock(item)"><v-icon small>mdi-minus</v-icon></v-btn>
              <v-btn icon small @click="incStock(item)"><v-icon small>mdi-plus</v-icon></v-btn>
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon small v-bind="attrs" v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="openMovementDialog(item)">
                    <v-list-item-icon><v-icon>mdi-swap-vertical</v-icon></v-list-item-icon>
                    <v-list-item-title>Hareket Ekle</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openHistoryDialog(item)">
                    <v-list-item-icon><v-icon>mdi-history</v-icon></v-list-item-icon>
                    <v-list-item-title>Hareket Geçmişi</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <template v-slot:footer.prepend>
              <div class="px-4 py-2">
                <v-chip small class="mr-2">Ürün: {{ filtered.length }}</v-chip>
                <v-chip small class="mr-2" color="teal" text-color="white">Adet: {{ totalUnits }}</v-chip>
                <v-chip small class="mr-2" color="grey" text-color="white">Baz: {{ tl(stockValueBase) }}</v-chip>
                <v-chip small class="mr-2" color="deep-purple" text-color="white">Perakende: {{ tl(stockValueRetail) }}</v-chip>
                <v-chip small color="green" text-color="white">Beklenen Kâr: {{ tl(stockExpectedProfit) }}</v-chip>
              </div>
            </template>
          </v-data-table>
        </v-card>

        <!-- SAYIM MODU -->
        <v-card class="mt-4 table-card" outlined>
          <v-card-title class="subtitle-1 font-weight-bold">
            Sayım Modu
            <v-spacer/><v-switch v-model="sayim.enabled" inset hide-details label="Aktif"/>
          </v-card-title>

          <v-expand-transition>
            <div v-show="sayim.enabled">
              <v-card-text>
                <v-row dense>
                  <v-col cols="12" md="5">
                    <v-text-field v-model="sayim.q" dense outlined clearable
                                  label="Barkod / SKU / ID" @keyup.enter="sayimQuickEnter"/>
                  </v-col>
                  <v-col cols="6" md="2">
                    <v-text-field v-model.number="sayim.qty" type="number" min="0" dense outlined label="Sayım Adet"/>
                  </v-col>
                  <v-col cols="6" md="2">
                    <v-btn block color="indigo" dark @click="sayimaEkle"><v-icon left small>mdi-plus</v-icon> Ekle</v-btn>
                  </v-col>
                  <v-col cols="12" md="3" class="d-flex justify-end">
                    <v-btn small class="glass-btn mr-2" @click="exportSayimCSV"><v-icon left small>mdi-file-delimited</v-icon> CSV</v-btn>
                    <v-btn small class="glass-btn" @click="yazdirSayim"><v-icon left small>mdi-printer</v-icon> Yazdır</v-btn>
                  </v-col>
                </v-row>

                <div id="sayimPrint">
                  <v-data-table :headers="sayimHeaders" :items="sayim.lines" dense hide-default-footer class="mt-2">
                    <template v-slot:item.product="{ item }">
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div class="caption grey--text">#{{ item.sku || item.id }}</div>
                    </template>
                    <template v-slot:item.sys="{ item }">{{ item.system }}</template>
                    <template v-slot:item.count="{ item }">
                      <v-text-field v-model.number="item.counted" type="number" min="0" dense hide-details style="max-width:100px"/>
                    </template>
                    <template v-slot:item.delta="{ item }">
                      <span :class="itemDelta(item)>=0 ? 'green--text' : 'red--text'">{{ itemDelta(item) }}</span>
                    </template>
                    <template v-slot:item.ops="{ item, index }">
                      <v-btn icon x-small @click="sayimRemove(index)"><v-icon small>mdi-delete</v-icon></v-btn>
                    </template>
                    <template v-slot:footer.prepend>
                      <div class="px-4 py-2">
                        <v-chip small class="mr-2">Kalem: {{ sayim.lines.length }}</v-chip>
                        <v-chip small color="teal" text-color="white" class="mr-2">Pozitif: {{ sayim.lines.filter(x=>itemDelta(x)>0).length }}</v-chip>
                        <v-chip small color="orange" text-color="white" class="mr-2">Negatif: {{ sayim.lines.filter(x=>itemDelta(x)<0).length }}</v-chip>
                        <v-chip small color="grey" text-color="white">Sıfır Delta: {{ sayim.lines.filter(x=>itemDelta(x)===0).length }}</v-chip>
                      </div>
                    </template>
                  </v-data-table>
                </div>
              </v-card-text>

              <v-card-actions class="px-4 pb-4">
                <v-btn text @click="sayimClear" :disabled="sayim.lines.length===0">Temizle</v-btn>
                <v-spacer/>
                <v-btn color="success" dark :disabled="sayim.lines.length===0" @click="sayimUygula">
                  <v-icon left>mdi-check</v-icon> Düzeltmeleri Uygula
                </v-btn>
              </v-card-actions>
            </div>
          </v-expand-transition>
        </v-card>
      </div>

      <!-- HAREKET DİYALOĞU -->
      <v-dialog v-model="dialogs.movement" max-width="560px">
        <v-card>
          <v-card-title class="subtitle-1 font-weight-bold">{{ moveForm.id ? 'Hareket Düzenle' : 'Yeni Stok Hareketi' }}</v-card-title>
          <v-card-text>
            <v-form ref="moveFormRef">
              <v-text-field v-model="moveForm.productText" label="Ürün" dense outlined readonly/>
              <v-row dense>
                <v-col cols="6"><v-text-field v-model.number="moveForm.qty" type="number" label="Adet (+/-)" dense outlined/></v-col>
                <v-col cols="6"><v-select v-model="moveForm.reason" :items="reasonOptions" dense outlined label="Sebep"/></v-col>
              </v-row>
              <v-row dense>
                <v-col cols="6"><v-text-field v-model="moveForm.ref" label="Referans (fiş, sipariş no…)" dense outlined/></v-col>
                <v-col cols="6"><v-text-field v-model="moveForm.date" type="datetime-local" label="Tarih" dense outlined/></v-col>
              </v-row>
              <v-textarea v-model="moveForm.note" label="Not" dense outlined rows="2"/>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn text @click="dialogs.movement=false">Vazgeç</v-btn>
            <v-spacer/>
            <v-btn color="indigo" dark @click="saveMovement">Kaydet</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- GEÇMİŞ DİYALOĞU -->
      <v-dialog v-model="dialogs.history" max-width="760px">
        <v-card>
          <v-card-title class="subtitle-1 font-weight-bold">Hareket Geçmişi — {{ history.product?.name }}</v-card-title>
          <v-card-text>
            <v-data-table :headers="historyHeaders" :items="history.items" dense hide-default-footer>
              <template v-slot:item.date="{ item }">{{ fmtDateTime(item.date) }}</template>
              <template v-slot:item.qty="{ item }">
                <span :class="item.qty>=0 ? 'green--text' : 'red--text'">{{ item.qty>=0? '+'+item.qty : item.qty }}</span>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer/><v-btn outlined color="indigo" @click="dialogs.history=false">Kapat</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snack.show" :color="snack.color" timeout="2200">{{ snack.text }}</v-snackbar>
    </v-container>
  </v-container>
</template>

<script>
import { get } from '@/utils/harddata'
import { priceCalc } from '@/utils/pricing'

export default {
  name: 'StokPage',
  data () {
    return {
      /* Drawer & tema */
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini: this.$vuetify?.breakpoint?.lgAndUp || false,
      accent: localStorage.getItem('jp_accent') || '#5865F2',
      accents: ['#5865F2', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
      drawerItems: [
        { title:'Ana Sayfa',     icon:'mdi-view-dashboard-outline', to:'home' },
        { title:'Satış',         icon:'mdi-cash-register',          to:'satis' },
        { title:'Raporlar',      icon:'mdi-file-chart',             to:'raporlar' },
        { title:'Toptancı',      icon:'mdi-storefront-outline',     to:'toptanci' },
        { title:'Kategoriler',   icon:'mdi-shape-outline',          to:'kategoriler' },
        { title:'Ürünler',       icon:'mdi-package-variant-closed', to:'urunler' },
        { title:'Müşteri Bilgi', icon:'mdi-account-group-outline',  to:'musteriBilgi' },
        { title:'Stok',          icon:'mdi-archive-outline',        to:'stok' },
        { title:'Kargo',         icon:'mdi-truck-outline',          to:'kargo' }
      ],

      quickActions: [
        { key:'H', icon:'mdi-swap-vertical', title:'Hareket Ekle', subtitle:'Stok giriş/çıkış', click:()=>this.openMovementDialog(null) },
        { key:'D', icon:'mdi-alert',         title:'Düşük Stok',  subtitle:'≤ Min göster',     click:()=>this.setQuick('low') },
        { key:'Y', icon:'mdi-close-octagon', title:'Stok Yok',    subtitle:'0 adet',           click:()=>this.setQuick('out') },
        { key:'C', icon:'mdi-file-delimited',title:'CSV',         subtitle:'Dışa aktar',        click:()=>this.exportCSV() },
        { key:'P', icon:'mdi-printer',       title:'Yazdır',      subtitle:'Rapor',             click:()=>this.yazdir() }
      ],

      /* Referanslar (DB) */
      categories: [],
      suppliers: [],
      typeOptions: ['Yüzük', 'Kolye', 'Küpe', 'Bileklik', 'Set', 'Diğer'],

      /* Ürünler (DB) */
      products: [],

      /* Filtreler */
      filters: { q:'', categoryId:null, supplierId:null, type:null, inStockOnly:false },
      quick: 'all',

      /* Tablo başlıkları */
      headers: [
        { text:'Ürün', value:'product', width:260 },
        { text:'Tür', value:'type', width:110 },
        { text:'Kategori', value:'category', width:120 },
        { text:'Toptancı', value:'supplier', width:140 },
        { text:'Stok', value:'stock', width:90, align:'end' },
        { text:'Min', value:'minStock', width:100, align:'end' },
        { text:'Geliş', value:'cost', width:110, align:'end' },
        { text:'Ekstra', value:'extras', width:110, align:'end' },
        { text:'Baz', value:'base', width:110, align:'end' },
        { text:'Birim (KDV)', value:'unit', width:140, align:'end' },
        { text:'Kâr/adet', value:'profitPP', width:120, align:'end' },
        { text:'Kâr %', value:'profitPct', width:90, align:'end' },
        { text:'Değer (Baz)', value:'valueBase', width:140, align:'end' },
        { text:'Değer (Per.)', value:'valueRetail', width:160, align:'end' },
        { text:'', value:'ops', sortable:false, width:110, align:'end' }
      ],

      /* Hareketler (opsiyonel) */
      movements: {},

      /* Sayım */
      sayim: { enabled:false, q:'', qty:1, lines: [] },
      sayimHeaders: [
        { text:'Ürün', value:'product' },
        { text:'Sistem', value:'sys', align:'end', width:110 },
        { text:'Sayım', value:'count', align:'end', width:130 },
        { text:'Delta', value:'delta', align:'end', width:110 },
        { text:'', value:'ops', sortable:false, width:60, align:'end' }
      ],

      /* Dialoglar */
      dialogs: { movement:false, history:false },
      moveForm: { id:null, productId:null, productText:'', qty:0, reason:'Sayım Düzeltme', ref:'', date:'', note:'' },

      history: { product:null, items:[] },

      snack: { show:false, color:'green', text:'' },
      reasonOptions: ['Alış','Satış Düzeltme','İade','Sayım Düzeltme','Hasar','Transfer In','Transfer Out','Diğer']
    }
  },

  created () {
    try {
      const prods = get('products') || []
      const cats  = get('categories') || []
      const sups  = get('suppliers')  || []
      const moves = get('stockMovements') || null

      // ürünler
      this.products = this.normalizeProducts(prods)

      // kategoriler
      if (Array.isArray(cats) && cats.length) {
        this.categories = cats
      } else {
        const set = new Map()
        this.products.forEach(p => {
          if (p.categoryId != null && !set.has(p.categoryId)) {
            set.set(p.categoryId, { id:p.categoryId, name: p.type || 'Kategori' })
          }
        })
        this.categories = Array.from(set.values())
      }

      // toptancılar
      if (Array.isArray(sups) && sups.length) {
        this.suppliers = sups
      } else {
        const set = new Map()
        this.products.forEach(p => {
          if (p.supplierId != null && !set.has(p.supplierId)) {
            set.set(p.supplierId, { id:p.supplierId, name:'Toptancı' })
          }
        })
        this.suppliers = Array.from(set.values())
      }

      // typeOptions (DB’den türet)
      const tset = new Set(this.typeOptions)
      this.products.forEach(p => p.type && tset.add(p.type))
      this.typeOptions = Array.from(tset)

      // hareketler
      if (moves) {
        if (Array.isArray(moves)) {
          const map = {}
          moves.forEach(m => {
            const pid = m.productId
            if (pid == null) return
            if (!map[pid]) map[pid] = []
            map[pid].push({ date:new Date(m.date||Date.now()), qty:Number(m.qty||0), reason:m.reason||'Diğer', ref:m.ref||'', note:m.note||'' })
          })
          Object.keys(map).forEach(k => map[k].sort((a,b)=> new Date(b.date)-new Date(a.date)))
          this.movements = map
        } else {
          this.movements = moves
        }
      }
    } catch (e) {
      console.error('stok verileri yüklenemedi:', e)
      this.products = []
    }
  },

  computed: {
    themeLabel () { return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },
    filtered () {
      const f = this.filters
      const q = (f.q || '').toLowerCase().trim()
      return this.products.filter(p => {
        const txt = [p.name, p.sku, p.barcode, p.type, p.karat, p.ayar].join(' ').toString().toLowerCase()
        const passQ  = q ? txt.includes(q) : true
        const passC  = f.categoryId ? p.categoryId === f.categoryId : true
        const passS  = f.supplierId ? p.supplierId === f.supplierId : true
        const passT  = f.type ? p.type === f.type : true
        const passSt = f.inStockOnly ? (p.stock || 0) > 0 : true

        const passQuick = this.quick === 'low' ? (p.stock||0) <= (p.minStock||0)
            : this.quick === 'out' ? (p.stock||0) === 0
                : true

        return passQ && passC && passS && passT && passSt && passQuick
      })
    },
    totalUnits () { return this.filtered.reduce((t,p)=> t + Number(p.stock||0), 0) },
    stockValueBase   () { return this.filtered.reduce((t,p)=> t + Number(p.stock||0) * priceCalc(p).base, 0) },
    stockValueRetail () { return this.filtered.reduce((t,p)=> t + Number(p.stock||0) * priceCalc(p).priceGross, 0) },
    stockExpectedProfit () { return this.filtered.reduce((t,p)=> t + Number(p.stock||0) * priceCalc(p).profitTL, 0) }
  },

  methods: {
    /* Tema */
    setAccent (c) { this.accent = c; localStorage.setItem('jp_accent', c) },
    cycleTheme () { this.$vuetify.theme.dark = !this.$vuetify.theme.dark },

    /* Helpers */
    priceCalc,
    tl (n) { return new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY' }).format(n||0) },
    toast (t, c='green') { this.snack = { show:true, color:c, text:t } },
    categoryName (id) { return (this.categories.find(c=>c.id===id)||{}).name || '-' },
    supplierName (id) { return (this.suppliers.find(s=>s.id===id)||{}).name || '-' },
    stockColor (p) { const s=Number(p.stock||0), m=Number(p.minStock||0); return s<=0 ? 'red' : s<=m ? 'orange' : 'green' },
    setQuick (mode) { this.quick = mode },

    normalizeProducts (arr) {
      return (arr||[]).map(p => {
        const copy = { ...p }
        copy.stock = Number(copy.stock||0)
        copy.minStock = Number(copy.minStock||0)
        copy.cost = Number(copy.cost||0)
        copy.extras = Number(copy.extras||0)
        copy.vatPercent = Number(copy.vatPercent||0)
        copy.pricingMode = copy.pricingMode || 'markup'
        copy.rounding = copy.rounding || 'to10'
        return copy
      })
    },

    incStock (p) { p.stock = Number(p.stock||0) + 1; this.addMovement(p, +1, 'Manuel +1') },
    decStock (p) {
      if ((p.stock||0) <= 0) { this.toast('Stok 0', 'red'); return }
      p.stock = Number(p.stock||0) - 1; this.addMovement(p, -1, 'Manuel -1')
    },

    openMovementDialog (p) {
      const d = new Date(); const pad=v=>String(v).padStart(2,'0')
      const when = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      this.moveForm = p ? {
        id:null, productId:p.id, productText:`${p.name} (#${p.sku||p.id})`,
        qty:0, reason:'Sayım Düzeltme', ref:'', date:when, note:''
      } : {
        id:null, productId:null, productText:'(Ürünü tablodan seç)', qty:0, reason:'Sayım Düzeltme', ref:'', date:when, note:''
      }
      this.dialogs.movement = true
    },
    saveMovement () {
      const f = this.moveForm
      const p = this.products.find(x=>x.id===f.productId)
      if (!p) { this.toast('Ürün seç', 'red'); return }
      const qty = Number(f.qty||0)
      if (!Number.isFinite(qty) || qty===0) { this.toast('Adet gir', 'red'); return }
      if (qty<0 && (p.stock||0)+qty < 0) { this.toast('Yetersiz stok', 'red'); return }

      this.addMovement(p, qty, f.reason, f.ref, f.date ? new Date(f.date) : new Date(), f.note)
      p.stock = Math.max(0, Number(p.stock||0) + qty)
      this.toast('Hareket uygulandı')
      this.dialogs.movement = false
    },
    addMovement (p, qty, reason='Diğer', ref='', date=new Date(), note='') {
      if (!this.movements[p.id]) this.$set(this.movements, p.id, [])
      this.movements[p.id].unshift({ date, qty, reason, ref, note })
    },
    openHistoryDialog (p) {
      this.history.product = p
      this.history.items = (this.movements[p.id] || []).slice(0, 100)
      this.dialogs.history = true
    },

    exportCSV () {
      const rows = [['id','sku','isim','stok','min','baz','birimKDV','karAdet','degerBaz','degerPerakende']]
      this.filtered.forEach(p => {
        const calc = priceCalc(p)
        rows.push([
          p.id, p.sku||'', p.name, p.stock, p.minStock||0,
          calc.base, calc.priceGross, calc.profitTL,
          (p.stock||0)*calc.base, (p.stock||0)*calc.priceGross
        ])
      })
      const csv = rows.map(r=>r.join(',')).join('\n')
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href=url; a.download='stok_listesi.csv'; a.click()
      URL.revokeObjectURL(url)
    },

    yazdir () { window.print() },

    quickSearchEnter () {
      const q = (this.filters.q||'').trim().toLowerCase()
      if (!q) return
      const p = this.products.find(x =>
          String(x.sku||'').toLowerCase() === q ||
          String(x.id).toLowerCase() === q ||
          String(x.barcode||'').toLowerCase() === q
      )
      if (p) {
        this.openMovementDialog(p)
        this.moveForm.qty = 1
        this.moveForm.reason = 'Alış'
      }
    },

    /* SAYIM */
    sayimFind (q) {
      const key = (q||'').trim().toLowerCase()
      return this.products.find(x =>
          String(x.sku||'').toLowerCase() === key ||
          String(x.id).toLowerCase() === key ||
          String(x.barcode||'').toLowerCase() === key
      )
    },
    sayimQuickEnter () {
      if (!this.sayim.q) return
      if (!Number.isFinite(Number(this.sayim.qty))) this.sayim.qty = 0
      this.sayimaEkle()
    },
    sayimaEkle () {
      const p = this.sayimFind(this.sayim.q)
      if (!p) { this.toast('Ürün bulunamadı', 'red'); return }
      const exist = this.sayim.lines.find(x=>x.id===p.id)
      if (exist) exist.counted = Number(exist.counted||0) + Number(this.sayim.qty||0)
      else this.sayim.lines.unshift({ id:p.id, sku:p.sku||'', name:p.name, system:Number(p.stock||0), counted:Number(this.sayim.qty||0) })
      this.sayim.q = ''; this.sayim.qty = 1
    },
    itemDelta (item) { return Number(item.counted||0) - Number(item.system||0) },
    sayimRemove (i) { this.sayim.lines.splice(i,1) },
    sayimClear () { this.sayim.lines = [] },
    sayimUygula () {
      if (this.sayim.lines.length===0) return
      this.sayim.lines.forEach(line => {
        const p = this.products.find(x=>x.id===line.id)
        if (!p) return
        const delta = this.itemDelta(line)
        if (delta !== 0) {
          this.addMovement(p, delta, 'Sayım Düzeltme', 'SAYIM', new Date(), `Sistem:${line.system} → Sayım:${line.counted}`)
          p.stock = Math.max(0, Number(p.stock||0) + delta)
        }
      })
      this.toast('Sayım düzeltmeleri uygulandı')
    },
    exportSayimCSV () {
      const rows = [['id','sku','isim','sistem','sayim','delta']]
      this.sayim.lines.forEach(l => rows.push([l.id, l.sku, l.name, l.system, l.counted, this.itemDelta(l)]))
      const csv = rows.map(r=>r.join(',')).join('\n')
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href=url; a.download='sayim_listesi.csv'; a.click()
      URL.revokeObjectURL(url)
    },
    yazdirSayim () { window.print() },

    fmtDateTime (d) {
      const dt=(d instanceof Date)?d:new Date(d)
      const p=v=>String(v).padStart(2,'0')
      return `${dt.getFullYear()}-${p(dt.getMonth()+1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}`
    }
  }
}
</script>

<style scoped>
/* Drawer */
.elevated-drawer{
  border-top-right-radius:16px;
  border-bottom-right-radius:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
}

/* Hero */
.hero{
  position:relative; height:120px; overflow:hidden;
  border-bottom:1px solid rgba(0,0,0,.04);
}
.theme--light .hero{ background:linear-gradient(180deg,#ffffff,#fafafa) }
.theme--dark  .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10) }
.hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite;
  filter:blur(42px); opacity:.55;
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
  background:rgba(255,255,255,.7);
  backdrop-filter:blur(6px);
  transition:transform .2s ease, box-shadow .2s ease;
}
.theme--dark .qa{ background:rgba(30,30,30,.7) }
.qa:hover{ transform:translateY(-3px); box-shadow:0 10px 20px rgba(0,0,0,.08) }

/* Filters */
.filters-sheet{
  border-radius:16px;
  padding:14px 16px;
  border:1px solid rgba(0,0,0,.06);
  background:rgba(255,255,255,.75);
  backdrop-filter:blur(8px) saturate(120%);
}
.theme--dark .filters-sheet{
  border-color:rgba(255,255,255,.06);
  background:rgba(24,24,24,.7);
}
.glass-btn{
  background:rgba(255,255,255,.6);
  border:1px solid rgba(0,0,0,.06);
}
.theme--dark .glass-btn{
  background:rgba(24,24,24,.6);
  border-color:rgba(255,255,255,.08);
}

/* Cards & table */
.kpi{ border-radius:14px; }
.table-card{ border-radius:16px; overflow:hidden }
.v-data-table .v-data-table__wrapper { font-size:.92rem; }

/* Sticky filter */
.sticky-top{ position:sticky; top:72px; z-index:2 }

/* Print: sadece rapor alanları */
@media print {
  body * { visibility:hidden !important; }
  #stockPrint, #stockPrint *,
  #sayimPrint, #sayimPrint * { visibility:visible !important; }
  #stockPrint { position:absolute; left:0; top:0; width:100%; }
}

/* Anim */
@keyframes float{
  0%{ transform:translate3d(0,0,0) }
  50%{ transform:translate3d(2%,-2%,0) }
  100%{ transform:translate3d(0,0,0) }
}
</style>

<style>
.v-main__wrap{ padding-top:0 !important; }
</style>
