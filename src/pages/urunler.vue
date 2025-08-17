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
          <v-btn v-for="c in accents" :key="c" icon small :style="{ color:c }" @click="setAccent(c)">
            <v-icon>mdi-circle</v-icon>
          </v-btn>
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
      </v-list>
    </v-navigation-drawer>

    <!-- HERO -->
    <div class="hero">
      <div class="hero-glow" :style="{ '--accent': accent }"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Ürünler</h2>
        <div class="hero-sub">Filtrele, fiyatla, stokla — tek ekranda.</div>
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
            <v-spacer/>
            <v-chip x-small :color="accent" text-color="white">{{ qa.key }}</v-chip>
          </v-card>
        </v-slide-item>
      </v-slide-group>
    </v-container>

    <!-- FİLTRELER + YENİ ÜRÜN -->
    <v-container class="pt-4">
      <v-sheet class="filters-sheet mb-3">
        <v-card-text class="px-0">
          <v-row dense>
            <v-col cols="12" md="3">
              <v-text-field v-model="filters.q" dense outlined clearable label="Ara (ad, barkod, SKU)" prepend-inner-icon="mdi-magnify"/>
            </v-col>
            <v-col cols="6" md="2">
              <v-select v-model="filters.categoryId" :items="categories.map(c=>({text:c.name,value:c.id}))"
                        dense outlined clearable label="Kategori"/>
            </v-col>
            <v-col cols="6" md="2">
              <v-select v-model="filters.supplierId" :items="suppliers.map(s=>({text:s.name,value:s.id}))"
                        dense outlined clearable label="Toptancı"/>
            </v-col>
            <v-col cols="6" md="2">
              <v-select v-model="filters.type" :items="typeOptions" dense outlined clearable label="Tür"/>
            </v-col>
            <v-col cols="6" md="1">
              <v-text-field v-model="filters.ayar" dense outlined clearable label="Ayar"/>
            </v-col>
            <v-col cols="6" md="1">
              <v-text-field v-model.number="filters.minGram" type="number" dense outlined clearable label="Min g"/>
            </v-col>
            <v-col cols="6" md="1">
              <v-text-field v-model.number="filters.maxGram" type="number" dense outlined clearable label="Max g"/>
            </v-col>
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-checkbox v-model="filters.inStockOnly" hide-details label="Stokta" class="mt-0"/>
            </v-col>

            <v-spacer/>
            <v-col cols="12" md="3" class="d-flex justify-end align-center">
              <v-btn text class="mr-2" @click="resetFilters">Sıfırla</v-btn>
              <v-btn :color="accent" dark class="mr-2" @click="exportCSV">
                <v-icon left small>mdi-file-delimited</v-icon> CSV
              </v-btn>
              <v-btn outlined class="mr-2" @click="yazdir">
                <v-icon left small>mdi-printer</v-icon> Yazdır
              </v-btn>
              <v-btn :color="accent" dark @click="openProductDialog()">
                <v-icon left>mdi-plus</v-icon> Yeni Ürün
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-sheet>

      <!-- ÜRÜN TABLOSU -->
      <div id="productPrint">
        <v-data-table
            :headers="headers"
            :items="filteredProducts"
            :items-per-page="10"
            dense fixed-header height="560"
            class="px-2 product-table"
        >
          <template v-slot:item.category="{ item }">{{ categoryName(item.categoryId) }}</template>
          <template v-slot:item.supplier="{ item }">{{ supplierName(item.supplierId) }}</template>
          <template v-slot:item.cost="{ item }">{{ tl(item.cost) }}</template>
          <template v-slot:item.extras="{ item }">{{ tl(item.extras||0) }}</template>

          <template v-slot:item.profitPct="{ item }">
            {{ pct(priceCalc(item).profitPct) }}
          </template>
          <template v-slot:item.profitTL="{ item }">
            {{ tl(priceCalc(item).profitTL) }}
          </template>

          <template v-slot:item.vatPercent="{ item }">
            {{ (item.vatPercent ?? 0) }}%
          </template>

          <template v-slot:item.price="{ item }">
            <div class="font-weight-bold">{{ tl(priceCalc(item).priceGross) }}</div>
            <div class="caption grey--text">({{ tl(priceCalc(item).priceNet) }} + KDV)</div>
          </template>

          <template v-slot:item.stock="{ item }">
            <v-chip small :color="item.stock<=0 ? 'red' : item.stock<=5 ? 'orange' : 'green'" text-color="white">
              {{ item.stock }}
            </v-chip>
          </template>

          <template v-slot:item.ops="{ item }">
            <v-btn icon small @click="decStock(item)"><v-icon small>mdi-minus</v-icon></v-btn>
            <v-btn icon small @click="incStock(item)"><v-icon small>mdi-plus</v-icon></v-btn>
            <v-btn icon small @click="openProductDialog(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon small @click="removeProduct(item)"><v-icon small>mdi-delete</v-icon></v-btn>
          </template>

          <template v-slot:footer.prepend>
            <div class="px-4 py-2">
              <v-chip small class="mr-2">Ürün: {{ filteredProducts.length }}</v-chip>
              <v-chip small class="mr-2" color="teal" text-color="white">
                Toplam Stok: {{ totalStock }}
              </v-chip>
              <v-chip small color="deep-purple" text-color="white">
                Stok Değeri (Geliş): {{ tl(stockValueCost) }}
              </v-chip>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-container>

    <!-- ÜRÜN DİYALOĞU -->
    <v-dialog v-model="dialogs.product" max-width="900px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ productForm.id ? 'Ürün Düzenle' : 'Yeni Ürün' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="productFormRef">
            <!-- Üst temel bilgiler -->
            <v-row dense>
              <v-col cols="12" md="5">
                <v-text-field v-model="productForm.name" dense outlined label="Ürün Adı" required />
              </v-col>
              <v-col cols="6" md="3">
                <v-select v-model="productForm.categoryId"
                          :items="categories.map(c=>({text:c.name,value:c.id}))"
                          dense outlined label="Kategori"
                          :rules="[v=>!!v || 'Zorunlu']" required />
              </v-col>
              <v-col cols="6" md="4">
                <v-select v-model="productForm.supplierId"
                          :items="suppliers.map(s=>({text:s.name,value:s.id}))"
                          dense outlined label="Toptancı"
                          :rules="[v=>!!v || 'Zorunlu']" required />
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="6" md="2"><v-select v-model="productForm.type" :items="typeOptions" dense outlined label="Tür"/></v-col>
              <v-col cols="6" md="2"><v-text-field v-model="productForm.ayar" dense outlined label="Ayar"/></v-col>
              <v-col cols="6" md="2"><v-text-field v-model.number="productForm.gram" type="number" min="0" step="0.01" dense outlined label="Gram (opsiyonel)"/></v-col>
              <v-col cols="6" md="2"><v-text-field v-model.number="productForm.stock" type="number" min="0" dense outlined label="Stok"/></v-col>
              <v-col cols="6" md="2"><v-text-field v-model="productForm.sku" dense outlined label="SKU / Kod"/></v-col>
            </v-row>

            <!-- Fiyatlama Kartı -->
            <v-card class="mt-3" outlined>
              <v-card-title class="subtitle-2 font-weight-bold">Fiyatlama</v-card-title>
              <v-card-text>
                <v-row dense>
                  <v-col cols="6" md="3">
                    <v-text-field v-model.number="productForm.cost" type="number" min="0"
                                  dense outlined label="Geliş (TL)"/>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field v-model.number="productForm.extras" type="number" min="0"
                                  dense outlined label="Ek Masraf (TL)"/>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-text-field v-model.number="productForm.vatPercent" type="number" min="0"
                                  dense outlined label="KDV %"/>
                  </v-col>
                  <v-col cols="6" md="3" class="d-flex align-center">
                    <v-checkbox v-model="productForm.vatIncluded" hide-details label="Fiyata KDV Dahil"/>
                  </v-col>
                </v-row>

                <v-row dense>
                  <v-col cols="12" md="4">
                    <v-select
                        v-model="productForm.pricingMode"
                        :items="pricingModes"
                        dense outlined
                        label="Fiyatlama Modu"
                    />
                  </v-col>

                  <v-col cols="6" md="4" v-if="productForm.pricingMode==='markup'">
                    <v-text-field v-model.number="productForm.markupPercent" type="number" min="0"
                                  dense outlined label="Kar % (Markup)"/>
                  </v-col>

                  <v-col cols="6" md="4" v-if="productForm.pricingMode==='profit'">
                    <v-text-field v-model.number="productForm.profitTL" type="number" min="0"
                                  dense outlined label="Kar (TL)"/>
                  </v-col>

                  <v-col cols="6" md="4" v-if="productForm.pricingMode==='target'">
                    <v-text-field v-model.number="productForm.targetPrice" type="number" min="0"
                                  dense outlined :label="productForm.vatIncluded ? 'Hedef Fiyat (KDV Dahil)' : 'Hedef Fiyat (KDV Hariç)'"/>
                  </v-col>

                  <v-col cols="6" md="4">
                    <v-select
                        v-model="productForm.rounding"
                        :items="roundingOptions"
                        dense outlined label="Yuvarlama"
                    />
                  </v-col>
                </v-row>

                <!-- ÖNİZLEME -->
                <v-divider class="my-3"/>
                <v-row dense>
                  <v-col cols="12" md="6">
                    <v-simple-table dense>
                      <tbody>
                      <tr><td>Baz Maliyet</td><td class="text-right">{{ tl(pricePreview.base) }}</td></tr>
                      <tr><td>Net Fiyat (KDV Hariç)</td><td class="text-right">{{ tl(pricePreview.priceNet) }}</td></tr>
                      <tr><td>KDV Dahil</td><td class="text-right font-weight-bold">{{ tl(pricePreview.priceGross) }}</td></tr>
                      </tbody>
                    </v-simple-table>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-simple-table dense>
                      <tbody>
                      <tr><td>Kâr (TL)</td><td class="text-right">{{ tl(pricePreview.profitTL) }}</td></tr>
                      <tr><td>Kâr %</td><td class="text-right">{{ pct(pricePreview.profitPct) }}</td></tr>
                      <tr><td>Uygulanan Yuvarlama</td><td class="text-right">{{ pricePreview.roundNote }}</td></tr>
                      </tbody>
                    </v-simple-table>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Diğer alanlar -->
            <v-row dense class="mt-3">
              <v-col cols="6" md="3"><v-text-field v-model="productForm.barcode" dense outlined label="Barkod"/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.color" dense outlined label="Renk/Taş"/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.size" dense outlined label="Beden (yüzük vb.)"/></v-col>
              <v-col cols="12" md="3"><v-text-field v-model="productForm.tags" dense outlined label="Etiketler (virgülle)"/></v-col>
              <v-col cols="12"><v-textarea v-model="productForm.description" dense outlined rows="2" label="Açıklama"/></v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.product=false">Vazgeç</v-btn>
          <v-spacer/>
          <v-btn :color="accent" dark :disabled="!canSaveProduct" @click="saveProduct">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2400">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
import { get } from '@/utils/harddata'
import { priceCalc } from '@/utils/pricing'

export default {
  name: "UrunlerPage",
  data() {
    return {
      /* Drawer & tema */
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
        { key:'N', icon:'mdi-plus',             title:'Yeni Ürün',  subtitle:'Hızlı ekle',     click:()=>this.openProductDialog() },
        { key:'S', icon:'mdi-filter-check',     title:'Stokta',     subtitle:'Sadece stokta',  click:()=>this.filters.inStockOnly = !this.filters.inStockOnly },
        { key:'C', icon:'mdi-file-delimited',   title:'CSV',        subtitle:'Dışa aktar',     click:()=>this.exportCSV() },
        { key:'P', icon:'mdi-printer',          title:'Yazdır',     subtitle:'Ürün tablosu',   click:()=>this.yazdir() },
      ],

      // referanslar (DB'den gelecek)
      categories: [],
      suppliers: [],
      // ürün listesi (DB'den gelecek)
      products: [],

      headers: [
        { text: "ID", value: "id", width: 80 },
        { text: "Ürün", value: "name" },
        { text: "Kategori", value: "category", width: 140 },
        { text: "Toptancı", value: "supplier", width: 160 },
        { text: "Tür", value: "type", width: 110 },
        { text: "Ayar", value: "ayar", width: 90 },
        { text: "Geliş", value: "cost", width: 110, align: "end" },
        { text: "Ekstra", value: "extras", width: 110, align: "end" },
        { text: "Kâr %", value: "profitPct", width: 90, align: "end" },
        { text: "Kâr TL", value: "profitTL", width: 110, align: "end" },
        { text: "KDV %", value: "vatPercent", width: 90, align: "end" },
        { text: "Satış (KDV Dhl)", value: "price", width: 150, align: "end" },
        { text: "Stok", value: "stock", width: 90, align: "end" },
        { text: "Barkod", value: "barcode", width: 140 },
        { text: "SKU", value: "sku", width: 120 },
        { text: "", value: "ops", sortable: false, width: 140, align: "end" },
      ],

      filters: {
        q: "", categoryId: null, supplierId: null, type: null,
        ayar: "", karat: null, minGram: null, maxGram: null, inStockOnly: false
      },

      dialogs: { product: false },
      productForm: null,

      snack: { show:false, color:"green", text:"" },

      pricingModes: [
        { text: "Kar % (Markup)", value: "markup" },
        { text: "Kar TL", value: "profit" },
        { text: "Hedef Fiyat", value: "target" },
      ],
      roundingOptions: ["none","to10","to100","to1000","end_990"],
    };
  },

  created(){
    try{
      const cats = get('categories') || [];
      const sups = get('suppliers')  || [];
      const prods= get('products')   || [];

      this.categories = cats.map(c => ({ id:c.id, name:c.name, description:c.description || "" }));
      this.suppliers  = sups.map(s => ({ id:s.id, name:s.name }));

      this.products = prods.map(this.normalizeDbProduct);

      const ro = get('settings.roundingOptions');
      if(Array.isArray(ro) && ro.length) this.roundingOptions = ro;

    }catch(e){
      console.error('urunler yüklenemedi:', e);
      this.categories = [];
      this.suppliers = [];
      this.products = [];
    }

    this.productForm = this.emptyForm();
  },

  computed: {
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },

    typeOptions(){
      const set = new Set((this.products||[]).map(p=>p.type).filter(Boolean));
      return Array.from(set);
    },

    filteredProducts() {
      const f = this.filters;
      const q = (f.q || "").toLowerCase().trim();
      return (this.products||[]).filter(p => {
        const txt = [
          p.name, p.barcode, p.sku, p.type, p.ayar, p.color, p.tags
        ].join(" ").toLowerCase();

        const passQ     = q ? txt.includes(q) : true;
        const passCat   = f.categoryId ? p.categoryId === f.categoryId : true;
        const passSup   = f.supplierId ? p.supplierId === f.supplierId : true;
        const passType  = f.type ? p.type === f.type : true;
        const passAyar  = f.ayar ? String(p.ayar).toLowerCase().includes(String(f.ayar).toLowerCase()) : true;
        const passKarat = f.karat != null && f.karat !== "" ? Number(p.karat) === Number(f.karat) : true;
        const passMinG  = f.minGram != null && f.minGram !== "" ? Number(p.gram||0) >= Number(f.minGram) : true;
        const passMaxG  = f.maxGram != null && f.maxGram !== "" ? Number(p.gram||0) <= Number(f.maxGram) : true;
        const passStock = f.inStockOnly ? Number(p.stock||0) > 0 : true;

        return passQ && passCat && passSup && passType && passAyar && passKarat && passMinG && passMaxG && passStock;
      });
    },

    canSaveProduct() {
      const f = this.productForm || {};
      return !!(f.name && f.categoryId && f.supplierId);
    },

    totalStock() {
      return this.filteredProducts.reduce((t,p)=>t + Number(p.stock||0), 0);
    },
    stockValueCost() {
      return this.filteredProducts.reduce((t,p)=>t + Number(p.stock||0) * (Number(p.cost||0)+Number(p.extras||0)), 0);
    },

    pricePreview() {
      return priceCalc(this.productForm || {});
    }
  },

  methods: {
    /* Tema */
    setAccent(c){ this.accent = c; localStorage.setItem('jp_accent', c); },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark; },

    /* --------- DB -> UI Normalizer --------- */
    normalizeDbProduct(p){
      const catId = Array.isArray(p.categoryIds) && p.categoryIds.length ? p.categoryIds[0] : null;
      return {
        id: p.id,
        name: p.isim || p.name || "",
        categoryId: catId,
        supplierId: p.supplierId || null,
        type: p.type || "",
        karat: p.karat ?? null,
        ayar: p.ayar ?? "",
        gram: p.gram ?? null,
        stock: p.stok ?? p.stock ?? 0,
        minStock: p.minStock ?? 0,
        cost: p.cost ?? 0,
        extras: p.extras ?? 0,
        pricingMode: p.pricingMode || "markup",
        markupPercent: p.markupPercent ?? 0,
        profitTL: p.profitTL ?? 0,
        targetPrice: p.targetPrice ?? null,
        vatPercent: p.vatPercent ?? 20,
        vatIncluded: p.vatIncluded ?? true,
        rounding: p.rounding || "none",
        barcode: p.barcode || "",
        sku: p.sku || "",
        size: p.size || "",
        color: (Array.isArray(p.colorOptions) && p.colorOptions.length ? p.colorOptions[0] : (p.color || "")),
        tags: p.tags || "",
        description: p.description || ""
      };
    },

    /* ------------- helpers ------------- */
    emptyForm(){
      return {
        id: null, name: "", categoryId: null, supplierId: null, type: "",
        karat: null, ayar: "", gram: null,
        stock: 0, minStock: 0,
        cost: 0, extras: 0,
        pricingMode: "markup", markupPercent: 0, profitTL: 0, targetPrice: null,
        vatPercent: 20, vatIncluded: true, rounding: (this.roundingOptions[0]||"none"),
        barcode: "", sku: "", size: "", color: "", tags: "", description: ""
      };
    },
    tl(n){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n||0); },
    pct(n){ const v = Number(n||0); return isFinite(v) ? v.toFixed(1) + '%' : '-%'; },
    toast(text,color="green"){ this.snack = { show:true, color, text }; },
    newId(){ return Date.now() + Math.floor(Math.random()*1000); },
    categoryName(id){ return (this.categories.find(c=>c.id===id)||{}).name || "-"; },
    supplierName(id){ return (this.suppliers.find(s=>s.id===id)||{}).name || "-"; },
    resetFilters(){
      this.filters = { q:"", categoryId:null, supplierId:null, type:null, ayar:"", karat:null, minGram:null, maxGram:null, inStockOnly:false };
    },

    // stok
    incStock(p){ p.stock = Number(p.stock||0) + 1; },
    decStock(p){ p.stock = Math.max(0, Number(p.stock||0) - 1); },

    priceCalc,

    /* ------------- CRUD (runtime) ------------- */
    openProductDialog(p=null){
      this.productForm = p ? { ...p } : this.emptyForm();
      this.dialogs.product = true;
    },
    saveProduct(){
      const f = this.productForm;
      if(!f || !f.categoryId || !f.supplierId){
        this.toast("Kategori ve Toptancı seçmeden ürün eklenemez.","red");
        return;
      }
      const calc = priceCalc(f);
      const finalPrice = calc.priceGross;

      if(f.id){
        const i = this.products.findIndex(x=>x.id===f.id);
        if(i>-1) this.$set(this.products, i, { ...this.products[i], ...f, price: finalPrice });
        this.toast("Ürün güncellendi");
      }else{
        this.products.push({ ...f, id: this.newId(), price: finalPrice });
        this.toast("Ürün eklendi");
      }
      this.dialogs.product = false;
    },
    removeProduct(p){
      if(confirm(`"${p.name}" silinsin mi?`)){
        const i = this.products.findIndex(x=>x.id===p.id);
        if(i>-1) this.products.splice(i,1);
        this.toast("Ürün silindi");
      }
    },

    /* Dışa aktar & Yazdır */
    exportCSV(){
      const rows = [["id","name","category","supplier","type","ayar","cost","extras","profitPct","profitTL","vatPercent","priceGross","stock","barcode","sku"]];
      (this.filteredProducts || []).forEach(p=>{
        const c = priceCalc(p);
        rows.push([
          p.id, p.name, this.categoryName(p.categoryId), this.supplierName(p.supplierId), p.type, p.ayar,
          p.cost||0, p.extras||0, (c.profitPct||0).toFixed?.(2) ?? c.profitPct, c.profitTL||0, p.vatPercent||0,
          c.priceGross||0, p.stock||0, p.barcode||"", p.sku||""
        ]);
      });
      const csv = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "urunler.csv"; a.click();
      URL.revokeObjectURL(url);
    },
    yazdir(){ window.print(); },
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
.hero{
  position:relative; height:120px; overflow:hidden;
  border-bottom:1px solid rgba(0,0,0,.04);
}
.theme--light .hero{ background:linear-gradient(180deg,#ffffff,#fafafa); }
.theme--dark  .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10); }
.hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite;
  filter:blur(42px); opacity:.55;
}
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
.theme--dark .qa{ background:rgba(30,30,30,.7); }
.qa:hover{ transform:translateY(-3px); box-shadow:0 10px 20px rgba(0,0,0,.08); }

/* Filters */
.filters-sheet{
  border-radius:16px;
  padding: 6px 16px;
  border:1px solid rgba(0,0,0,.06);
  background:rgba(255,255,255,.75);
  backdrop-filter:blur(8px) saturate(120%);
}
.theme--dark .filters-sheet{
  border-color:rgba(255,255,255,.06);
  background:rgba(24,24,24,.7);
}

/* Table */
.product-table { border-radius: 16px; overflow: hidden; }
.v-data-table .v-data-table__wrapper { font-size: 0.92rem; }

/* YAZDIR: sadece ürün tablosu */
@media print {
  body * { visibility: hidden !important; }
  #productPrint, #productPrint * { visibility: visible !important; }
  #productPrint { position: absolute; left: 0; top: 0; width: 100%; }
}

/* Anim */
@keyframes float{
  0%{ transform: translate3d(0,0,0) }
  50%{ transform: translate3d(2%,-2%,0) }
  100%{ transform: translate3d(0,0,0) }
}
</style>

<style>
.v-main__wrap{ padding-top:0 !important; }
</style>
