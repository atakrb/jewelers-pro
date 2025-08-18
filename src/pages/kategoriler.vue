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
          <v-spacer/>
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

        <v-list-item :to="{ name:'urunler' }" class="rounded-lg" link>
          <v-list-item-icon><v-icon>mdi-package-variant-closed</v-icon></v-list-item-icon>
          <v-list-item-title>Ürünler</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- HERO -->
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">
          {{ view==='cats' ? 'Kategoriler' : view==='list' ? selectedCat?.name : (activeProduct?.isim || activeProduct?.name || 'Ürün Detayı') }}
        </h2>
        <div class="hero-sub">
          {{ view==='cats'
            ? 'Kartlardan stok ve ürün sayısını gör; kategoriye gir.'
            : view==='list'
                ? 'Bu kategorideki ürünleri listele ve detaya gir.'
                : 'Tedarikçi, stok, varyant ve parasal detaylar burada.' }}
        </div>
      </div>
    </div>

    <!-- ARAMA + HIZLI AKSİYON -->
    <v-container class="pt-4 pb-0">
      <v-row dense align="center">
        <v-col cols="12" md="6">
          <v-text-field
              v-model="search"
              dense
              outlined
              clearable
              hide-details
              :label="view==='cats' ? 'Kategori Ara (ad/açıklama)' : 'Ürün Ara (ad, sku, barkod, ayar)'"
              prepend-inner-icon="mdi-magnify"
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-end">
          <v-btn v-if="view!=='cats'" class="glass-btn mr-2" @click="goCats">
            <v-icon left small>mdi-arrow-left</v-icon> Kategorilere Dön
          </v-btn>
          <v-btn class="glass-btn" @click="refreshDb">
            <v-icon left small>mdi-reload</v-icon> Yenile
          </v-btn>
          <v-btn
              v-if="view==='cats'"
              class="glass-btn ms-2"
              :color="accent"
              dark
              @click="openCatDialog()"
          >
            <v-icon left small>mdi-plus</v-icon> Yeni Kategori
          </v-btn>
          <v-btn
              v-if="view==='list'"
              class="glass-btn ms-2"
              :color="accent"
              dark
              @click="openProductDialog()"
          >
            <v-icon left small>mdi-plus</v-icon> Yeni Ürün
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- İÇERİK -->
    <v-container class="py-4">
      <!-- 1) KATEGORİ KARTLARI -->
      <v-row v-if="view==='cats'" dense>
        <v-col
            v-for="cat in filteredCats"
            :key="cat.id"
            cols="12" sm="6" md="4" lg="3"
        >
          <v-card class="soft-card category-card heroish" outlined @click="openCat(cat)">
            <div class="card-hero-glow"></div>

            <!-- KEBAB (3 nokta) -->
            <div class="kebab-wrap" @click.stop>
              <v-menu offset-y left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on" class="kebab-btn">
                    <v-icon small>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="openCatDialog(cat)">
                    <v-list-item-icon><v-icon small>mdi-pencil</v-icon></v-list-item-icon>
                    <v-list-item-title>Düzenle</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteCategory(cat)">
                    <v-list-item-icon><v-icon small>mdi-delete</v-icon></v-list-item-icon>
                    <v-list-item-title>Sil</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div class="cat-header" :style="catHeaderStyle(cat)">
              <div class="left">
                <v-icon size="38">{{ catIcon(cat.id) }}</v-icon>
              </div>
              <div class="mid">
                <div class="subtitle-1 font-weight-bold truncate">{{ cat.name }}</div>
                <div class="caption truncate">{{ cat.description || '—' }}</div>
              </div>
            </div>

            <v-card-text class="pt-3">
              <div class="d-flex justify-space-between">
                <span class="grey--text">Stok Değeri (Geliş+Ek)</span>
                <strong>{{ tl(catStockValue(cat)) }}</strong>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" v-if="!filteredCats.length">
          <v-alert type="info" outlined>Sonuç bulunamadı.</v-alert>
        </v-col>
      </v-row>

      <!-- 2) KATEGORİ ÜRÜN LİSTESİ -->
      <v-row v-else-if="view==='list'" dense>
        <v-col cols="12">
          <v-card class="soft-card heroish" outlined>
            <v-card-title class="subtitle-1 font-weight-bold">
              {{ selectedCat?.name }} — Ürünler

            </v-card-title>

            <v-card-text class="pt-0">
              <v-row dense>
                <v-col
                    v-for="p in productsFiltered"
                    :key="p.id"
                    cols="12" sm="6" md="4" lg="3"
                >
                  <v-card class="soft-card product-card heroish" outlined @click="openDetail(p)">
                    <div class="card-hero-glow"></div>

                    <!-- KEBAB (3 nokta) -->
                    <div class="kebab-wrap" @click.stop>
                      <v-menu offset-y left>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn icon v-bind="attrs" v-on="on" class="kebab-btn">
                            <v-icon small>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item @click="openProductDialog(p)">
                            <v-list-item-icon><v-icon small>mdi-pencil</v-icon></v-list-item-icon>
                            <v-list-item-title>Düzenle</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="deleteProduct(p)">
                            <v-list-item-icon><v-icon small>mdi-delete</v-icon></v-list-item-icon>
                            <v-list-item-title>Sil</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>

                    <div class="prod-top">
                      <v-icon class="muted mr-2">mdi-diamond-stone</v-icon>
                      <div class="title-area">
                        <div class="name truncate">{{ pName(p) }}</div>
                        <div class="meta muted truncate">
                          #{{ p.sku || p.id }} • {{ p.karat ? p.karat + 'k' : '' }} {{ p.ayar || '' }}
                        </div>
                      </div>
                    </div>

                    <div class="prod-bottom">
                      <div class="caption muted">Tedarikçi</div>
                      <div class="supplier-name truncate">{{ supplierName(p.supplierId) }}</div>
                      <div class="caption muted mt-1">
                        Son alış: <strong>{{ lastBuySummary(p.id) || '-' }}</strong>
                      </div>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" v-if="!productsFiltered.length">
                  <v-alert type="info" outlined>Bu kategoride ürün bulunamadı.</v-alert>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 3) ÜRÜN DETAY -->
      <v-row v-else-if="view==='detail'" dense>
        <v-col cols="12" md="8">
          <v-card class="soft-card heroish" outlined>
            <div class="card-hero-glow"></div>

            <v-card-title class="subtitle-1 font-weight-bold">
              <v-icon class="mr-2">mdi-diamond-stone</v-icon>
              {{ pName(activeProduct) }}
              <v-spacer/>
              <v-chip :color="stockChipColor(pStock(activeProduct))" text-color="white" small>
                Stok: {{ pStock(activeProduct) }}
              </v-chip>

              <!-- Detay'ta da kebab -->
              <div class="ml-2" @click.stop>
                <v-menu offset-y left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon small>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item @click="openProductDialog(activeProduct)">
                      <v-list-item-icon><v-icon small>mdi-pencil</v-icon></v-list-item-icon>
                      <v-list-item-title>Düzenle</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteProduct(activeProduct)">
                      <v-list-item-icon><v-icon small>mdi-delete</v-icon></v-list-item-icon>
                      <v-list-item-title>Sil</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-card-title>

            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-simple-table dense>
                    <tbody>
                    <tr><td>SKU</td><td class="text-right">#{{ activeProduct.sku || activeProduct.id }}</td></tr>
                    <tr><td>Barkod</td><td class="text-right">{{ activeProduct.barcode || '-' }}</td></tr>
                    <tr><td>Kategori</td><td class="text-right">{{ primaryCatName(activeProduct) }}</td></tr>
                    <tr><td>Karat/Ayar</td><td class="text-right">{{ activeProduct.karat ? activeProduct.karat + 'k' : '' }} {{ activeProduct.ayar || '' }}</td></tr>
                    <tr v-if="(activeProduct.colorOptions||[]).length"><td>Renk</td><td class="text-right">{{ (activeProduct.colorOptions||[]).join(', ') }}</td></tr>
                    <tr v-if="ringLike(activeProduct)"><td>Beden</td><td class="text-right">9–20 (opsiyonel)</td></tr>
                    </tbody>
                  </v-simple-table>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-simple-table dense>
                    <tbody>
                    <tr>
                      <td>Tedarikçi</td>
                      <td class="text-right">
                        <span class="font-weight-bold">{{ supplierName(activeProduct.supplierId) }}</span>
                        <div class="caption">{{ supplierPhone(activeProduct.supplierId) || '' }}</div>
                      </td>
                    </tr>
                    <tr><td>Son Alış</td><td class="text-right">{{ lastBuySummary(activeProduct.id) || '-' }}</td></tr>
                    <tr><td>Son Satış</td><td class="text-right">{{ lastSellSummary(activeProduct.id) || '-' }}</td></tr>
                    </tbody>
                  </v-simple-table>

                  <div class="mt-2 d-flex justify-end">
                    <v-btn
                        v-if="supplierPhone(activeProduct.supplierId)"
                        small class="glass-btn mr-2"
                        :href="waLink(activeProduct)" target="_blank"
                    >
                      <v-icon left small>mdi-whatsapp</v-icon> WhatsApp
                    </v-btn>
                    <v-btn small :color="accent" dark :href="waOrderLink(activeProduct)" target="_blank">
                      <v-icon left small>mdi-cart-plus</v-icon> Sipariş Ver
                    </v-btn>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4"/>

              <div>
                <div class="subtitle-2 font-weight-bold mb-2">Hareketler</div>
                <v-timeline dense align-top>
                  <v-timeline-item
                      v-for="ev in movementTimeline(activeProduct.id)"
                      :key="ev.id"
                      :color="ev.type==='in' ? 'green' : 'orange'"
                      small
                  >
                    <div class="font-weight-bold">{{ ev.type==='in' ? 'Alış' : 'Satış' }}</div>
                    <div class="caption muted">{{ formatDate(ev.date) }} • {{ ev.qty }} adet • {{ ev.reason }}</div>
                  </v-timeline-item>
                  <div v-if="movementTimeline(activeProduct.id).length===0" class="grey--text caption">
                    Hareket bulunamadı.
                  </div>
                </v-timeline>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="soft-card heroish" outlined>
            <div class="card-hero-glow"></div>

            <v-card-title class="subtitle-1 font-weight-bold">
              Detay (Parasal)
            </v-card-title>
            <v-card-text>
              <v-simple-table dense>
                <tbody>
                <tr><td>Geliş</td><td class="text-right">{{ tl(activeProduct.cost || 0) }}</td></tr>
                <tr><td>Ek Masraf</td><td class="text-right">{{ tl(activeProduct.extras || 0) }}</td></tr>
                <tr><td>KDV %</td><td class="text-right">{{ activeProduct.vatPercent || 0 }}%</td></tr>
                <tr><td>Satış (KDV Dahil)</td><td class="text-right font-weight-bold">{{ tl(salePrice(activeProduct)) }}</td></tr>
                <tr><td>Kâr (TL, teorik)</td><td class="text-right">{{ tl(calc(activeProduct).profitTL) }}</td></tr>
                <tr><td>Kâr % (teorik)</td><td class="text-right">{{ calc(activeProduct).profitPct.toFixed(1) }}%</td></tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>

          <div class="mt-3 d-flex">
            <v-btn class="glass-btn mr-2" block @click="backToList">
              <v-icon left small>mdi-arrow-left</v-icon> Listeye Dön
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2200">{{ snack.text }}</v-snackbar>

    <!-- KATEGORİ DİYALOĞU -->
    <v-dialog v-model="dialogs.cat" max-width="520">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ catForm.id ? 'Kategoriyi Düzenle' : 'Yeni Kategori' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="catFormRef" lazy-validation>
            <v-text-field v-model="catForm.name" label="Ad" outlined dense :rules="[r.req]" />
            <v-text-field v-model="catForm.description" label="Açıklama" outlined dense />
            <v-text-field v-model="catForm.color" label="Renk (HEX)" outlined dense placeholder="#5865F2" />
            <v-select
                v-model="catForm.icon"
                :items="catIcon"
                label="İkon"
                item-text="label" item-value="value"
                outlined dense
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="dialogs.cat=false">Vazgeç</v-btn>
          <v-btn :color="accent" dark @click="saveCategory">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ÜRÜN DİYALOĞU -->
    <v-dialog v-model="dialogs.prod" max-width="720">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ prodForm.id ? 'Ürünü Düzenle' : 'Yeni Ürün' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="prodFormRef" lazy-validation>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="prodForm.name" label="Ad" outlined dense :rules="[r.req]" />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model="prodForm.sku" label="SKU" outlined dense />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model="prodForm.barcode" label="Barkod" outlined dense />
              </v-col>

              <v-col cols="6" md="3">
                <v-text-field v-model.number="prodForm.karat" label="Karat (k)" type="number" outlined dense />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field v-model="prodForm.ayar" label="Ayar" outlined dense />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                    v-model="prodForm.categoryIds"
                    :items="categoryOptions"
                    label="Kategoriler"
                    multiple chips small-chips outlined dense
                    :rules="[r.min1]"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                    v-model="prodForm.supplierId"
                    :items="supplierOptions"
                    label="Tedarikçi"
                    outlined dense
                />
              </v-col>

              <v-col cols="4" md="3">
                <v-text-field v-model.number="prodForm.stock" label="Stok" type="number" outlined dense :rules="[r.num0]" />
              </v-col>
              <v-col cols="4" md="3">
                <v-text-field v-model.number="prodForm.cost" label="Geliş" type="number" outlined dense :rules="[r.num0]" />
              </v-col>
              <v-col cols="4" md="3">
                <v-text-field v-model.number="prodForm.extras" label="Ek Masraf" type="number" outlined dense :rules="[r.num0]" />
              </v-col>
              <v-col cols="4" md="3">
                <v-text-field v-model.number="prodForm.vatPercent" label="KDV %" type="number" outlined dense :rules="[r.num0]" />
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="prodForm.type" label="Tür (örn: yüzük, kolye...)" outlined dense />
              </v-col>

              <v-col cols="12">
                <v-combobox
                    v-model="prodForm.colorOptions"
                    :items="[]"
                    multiple chips small-chips
                    label="Renkler (enter ile ekle)"
                    outlined dense
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="dialogs.prod=false">Vazgeç</v-btn>
          <v-btn :color="accent" dark @click="saveProduct">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { get, reload, subscribe } from '@/utils/harddata'
import { priceCalc } from '@/utils/pricing'

export default {
  name: 'KategorilerPage',
  data(){
    return {
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini:   this.$vuetify?.breakpoint?.lgAndUp || false,
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

      categories: [],
      products:   [],
      suppliers:  [],
      stockMoves: [],

      view: 'cats',
      selectedCat: null,
      search: '',
      activeProduct: null,

      dialogs: { cat:false, prod:false },

      // Kategori form
      catForm: { id:null, name:'', description:'', color:'#5865F2', icon:'mdi-shape-outline' },

      // Ürün form
      prodForm: {
        id:null, name:'', sku:'', barcode:'',
        karat:null, ayar:'',
        categoryIds:[],
        supplierId:null,
        stock:0,
        cost:0, extras:0, vatPercent:0,
        type:'',
        colorOptions:[]
      },

      // Doğrulama
      r: {
        req: v => !!(v && String(v).trim()) || 'Gerekli',
        min1: v => (Array.isArray(v) && v.length>0) || 'En az bir kategori seç',
        num0: v => (v==='' || v===null || !isNaN(Number(v))) || 'Sayısal olmalı'
      },

      snack: { show:false, color:'green', text:'' },
    }
  },

  created(){
    this.hydrate()
    subscribe('categories', this.hydrate)
    subscribe('products',   this.hydrate)
    subscribe('suppliers',  this.hydrate)
    subscribe('stockMovements', this.hydrate)
  },

  computed:{
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },

    filteredCats(){
      const q = (this.search||'').toLowerCase().trim()
      return (this.categories||[]).filter(c =>
          (c.name + ' ' + (c.description||'')).toLowerCase().includes(q)
      )
    },

    productsOfSelected(){
      if(!this.selectedCat) return []
      const id = String(this.selectedCat.id)
      return (this.products||[]).filter(p => {
        const ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String)
            : (p.categoryId!=null ? [String(p.categoryId)] : [])
        return ids.includes(id)
      })
    },

    productsFiltered(){
      const q = (this.search||'').toLowerCase().trim()
      if(!q) return this.productsOfSelected
      return this.productsOfSelected.filter(p => {
        const txt = [p.name, p.isim, p.sku, p.barcode, p.karat, p.ayar].join(' ').toLowerCase()
        return txt.includes(q)
      })
    },

    categoryOptions(){
      return (this.categories||[]).map(c => ({ text: c.name, value: String(c.id) }))
    },
    supplierOptions(){
      return (this.suppliers||[]).map(s => ({ text: s.name, value: String(s.id) }))
    },

  },

  methods:{
    setAccent(c){ this.accent=c; localStorage.setItem('jp_accent', c) },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark },

    hydrate(){
      this.categories = get('categories') || JSON.parse(localStorage.getItem('categories')||'[]')
      this.products   = get('products')   || JSON.parse(localStorage.getItem('products')||'[]')
      this.suppliers  = get('suppliers')  || JSON.parse(localStorage.getItem('suppliers')||'[]')
      this.stockMoves = get('stockMovements') || JSON.parse(localStorage.getItem('stockMovements')||'[]')
    },
    async refreshDb(){
      try{ await reload(true); this.hydrate(); this.toast('Veriler yenilendi') }
      catch(e){ console.warn(e); this.toast('Yenileme başarısız','red') }
    },

    toast(t,c='green'){ this.snack = { show:true, color:c, text:t } },
    tl(n){ return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(Number(n)||0) },
    formatDate(d){ try{ return new Date(d).toLocaleDateString('tr-TR') }catch{ return '' } },
    calc: priceCalc,
    salePrice(p){ return priceCalc(p).priceGross },

    goCats(){ this.view='cats'; this.selectedCat=null; this.search='' },
    openCat(cat){ this.selectedCat=cat; this.view='list'; this.search='' },
    openDetail(p){ this.activeProduct=p; this.view='detail' },
    backToList(){ this.view='list' },

    // --- ikon / stil yardımcıları
    catIcon(id){
      const map = {
        diamond: 'mdi-diamond-stone',
        gold:    'mdi-crown',
        silver:  'mdi-circle-multiple-outline',
        ring:    'mdi-ring',
        necklace:'mdi-necklace',
        earring: 'mdi-ear-hearing',
        bracelet:'mdi-circle-double',
        set:     'mdi-cube-outline'
      }
      return map[String(id)] || 'mdi-shape-outline'
    },
    catHeaderStyle(cat){
      const base = cat?.color || this.accent
      return `
        background:
          linear-gradient(180deg, rgba(255,255,255,.6), transparent 60%),
          ${this.gradientFromHex(base)};
        padding:12px 14px; border-bottom:1px solid ${this.$vuetify.theme.dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'};
        display:flex; align-items:center; gap:12px;
      `
    },
    gradientFromHex(hex){
      const {h,s,l} = this.hexToHsl(hex)
      const c1 = `hsl(${h} ${Math.min(85,Math.max(35,s+8))}% ${Math.min(96,l+22)}%)`
      const c2 = `hsl(${(h+12)%360} ${Math.min(85,Math.max(35,s+5))}% ${Math.max(78,l+10)}%)`
      return `linear-gradient(135deg, ${c1}, ${c2})`
    },
    hexToHsl(hex){
      let c = (hex||'#ddd').replace('#','')
      if(c.length===3) c = c.split('').map(x=>x+x).join('')
      const r=parseInt(c.substr(0,2),16)/255
      const g=parseInt(c.substr(2,2),16)/255
      const b=parseInt(c.substr(4,2),16)/255
      const max=Math.max(r,g,b), min=Math.min(r,g,b)
      let h=0,s=0,l=(max+min)/2
      if(max!==min){
        const d=max-min
        s=l>0.5? d/(2-max-min): d/(max+min)
        switch(max){
          case r: h=(g-b)/d+(g<b?6:0); break
          case g: h=(b-r)/d+2; break
          case b: h=(r-g)/d+4; break
        }
        h=Math.round(h*60)
      }
      return {h, s:Math.round(s*100), l:Math.round(l*100)}
    },

    // --- stok chip rengi
    stockChipColor(n){
      const v = Number(n)||0
      if (v <= 0) return 'red darken-1'
      if (v <= 5) return 'orange darken-1'
      return 'green darken-1'
    },

    pName(p){ return p?.isim || p?.name || '' },
    pStock(p){ return Number(p?.stok ?? p?.stock ?? 0) },
    supplierName(id){
      const s = (this.suppliers||[]).find(x => String(x.id)===String(id))
      return s?.name || '—'
    },
    supplierPhone(id){
      const s = (this.suppliers||[]).find(x => String(x.id)===String(id))
      return (s?.phone || '').trim()
    },
    waLink(p){
      const phone = (this.supplierPhone(p?.supplierId) || '').replace(/\D/g,'')
      const text  = encodeURIComponent(`Merhaba, ${this.pName(p)} (#${p?.sku||p?.id}) hakkında bilgi rica ediyorum.`)
      return phone ? `https://wa.me/${phone}?text=${text}` : '#'
    },
    waOrderLink(p){
      const phone = (this.supplierPhone(p?.supplierId) || '').replace(/\D/g,'')
      const text  = encodeURIComponent(`Merhaba, ${this.pName(p)} (#${p?.sku||p?.id}) için sipariş vermek istiyorum.`)
      return phone ? `https://wa.me/${phone}?text=${text}` : '#'
    },
    primaryCatName(p){
      const id = Array.isArray(p?.categoryIds) && p.categoryIds.length ? p.categoryIds[0] : p?.categoryId
      const c  = (this.categories||[]).find(x => String(x.id)===String(id))
      return c?.name || '—'
    },
    ringLike(p){
      const t = (p?.type || '').toLowerCase()
      const n = (p?.name || p?.isim || '').toLowerCase()
      return t.includes('yüzük') || n.includes('yüzük')
    },

    movementTimeline(productId){
      return (this.stockMoves||[])
          .filter(m => String(m.productId)===String(productId))
          .sort((a,b)=> new Date(b.date)-new Date(a.date))
    },
    lastBuySummary(productId){
      const ins = (this.stockMoves||[]).filter(m => String(m.productId)===String(productId) && m.type==='in')
      if(!ins.length) return ''
      const last = ins.sort((a,b)=> new Date(b.date)-new Date(a.date))[0]
      return `${this.formatDate(last.date)} • ${last.qty} adet`
    },
    lastSellSummary(productId){
      const outs = (this.stockMoves||[]).filter(m => String(m.productId)===String(productId) && m.type==='out')
      if(!outs.length) return ''
      const last = outs.sort((a,b)=> new Date(b.date)-new Date(a.date))[0]
      return `${this.formatDate(last.date)} • ${last.qty} adet`
    },
    catCounts(cat){
      const items = this.products.filter(p => {
        const ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String)
            : (p.categoryId!=null ? [String(p.categoryId)] : [])
        return ids.includes(String(cat.id))
      })
      const stock = items.reduce((t,p)=> t + this.pStock(p), 0)
      return { products: items.length, stock }
    },
    catStockValue(cat){
      const items = this.products.filter(p => {
        const ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String)
            : (p.categoryId!=null ? [String(p.categoryId)] : [])
        return ids.includes(String(cat.id))
      })
      return items.reduce((t,p)=> t + (this.pStock(p) * (Number(p.cost||0) + Number(p.extras||0))), 0)
    },

    // ------- CRUD: DİYALOG AÇ
    openCatDialog(cat=null){
      if(cat){
        this.catForm = {
          id:cat.id,
          name:cat.name,
          description:cat.description||'',
          color:cat.color||this.accent,
          icon:this.catIcon(cat.id)
        }
      }else{
        this.catForm = { id:null, name:'', description:'', color:this.accent, icon:'mdi-shape-outline' }
      }
      this.dialogs.cat = true
    },
    openProductDialog(p=null){
      if(p){
        const cats = Array.isArray(p.categoryIds) ? p.categoryIds.map(String) : (p.categoryId!=null ? [String(p.categoryId)] : [])
        this.prodForm = {
          id:p.id, name:this.pName(p), sku:p.sku||'', barcode:p.barcode||'',
          karat:p.karat??null, ayar:p.ayar||'',
          categoryIds:cats,
          supplierId: p.supplierId ?? null,
          stock: this.pStock(p),
          cost: Number(p.cost||0), extras:Number(p.extras||0), vatPercent:Number(p.vatPercent||0),
          type:p.type||'',
          colorOptions: Array.isArray(p.colorOptions)? [...p.colorOptions]:[]
        }
      }else{
        this.prodForm = {
          id:null, name:'', sku:'', barcode:'',
          karat:null, ayar:'',
          categoryIds: this.selectedCat ? [String(this.selectedCat.id)] : [],
          supplierId:null, stock:0, cost:0, extras:0, vatPercent:0, type:'', colorOptions:[]
        }
      }
      this.dialogs.prod = true
    },

    // ------- CRUD: KATEGORİ
    saveCategory(){
      const ok = this.$refs.catFormRef?.validate?.() ?? true
      if(!ok) return
      const isEdit = !!this.catForm.id
      if(isEdit){
        const i = this.categories.findIndex(c => String(c.id)===String(this.catForm.id))
        if(i>-1){
          this.$set(this.categories, i, {
            ...this.categories[i],
            name:this.catForm.name,
            description:this.catForm.description,
            color:this.catForm.color
          })
        }
      }else{
        const newId = this.genId('cat')
        this.categories.push({
          id:newId,
          name:this.catForm.name,
          description:this.catForm.description,
          color:this.catForm.color
        })
      }
      this.dialogs.cat=false
      this.persistAll()
      this.toast(isEdit ? 'Kategori güncellendi' : 'Kategori eklendi')
    },

    async deleteCategory(cat){
      const ok = confirm(`'${cat.name}' kategorisini silmek istiyor musun?\nBu kategoriye bağlı ürünler kategorisiz kalır.`)
      if(!ok) return
      const idStr = String(cat.id)
      // ürünlerden bu kategoriyi düşür
      this.products = this.products.map(p=>{
        let ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String)
            : (p.categoryId!=null ? [String(p.categoryId)] : [])
        ids = ids.filter(x => x!==idStr)
        const np = { ...p }
        if(ids.length<=1){
          np.categoryId = ids[0] ?? null
          delete np.categoryIds
        }else{
          np.categoryIds = ids
          delete np.categoryId
        }
        return np
      })
      this.categories = this.categories.filter(c => String(c.id)!==idStr)
      if(this.selectedCat && String(this.selectedCat.id)===idStr){ this.goCats() }
      this.persistAll()
      this.toast('Kategori silindi','orange')
    },

    // ------- CRUD: ÜRÜN
    saveProduct(){
      const ok = this.$refs.prodFormRef?.validate?.() ?? true
      if(!ok) return

      const buildProduct = () => {
        const ids = (this.prodForm.categoryIds||[]).map(String)
        const catFields = ids.length<=1 ? { categoryId: ids[0] ?? null } : { categoryIds: ids }
        return {
          id: this.prodForm.id ?? this.genId('prd'),
          name: this.prodForm.name,
          isim: this.prodForm.name,
          sku: (this.prodForm.sku||'').trim() || undefined,
          barcode: (this.prodForm.barcode||'').trim() || undefined,
          karat: this.prodForm.karat ?? undefined,
          ayar: (this.prodForm.ayar||'').trim() || undefined,
          supplierId: this.prodForm.supplierId ?? undefined,
          stock: Number(this.prodForm.stock||0),
          stok: Number(this.prodForm.stock||0),
          cost: Number(this.prodForm.cost||0),
          extras: Number(this.prodForm.extras||0),
          vatPercent: Number(this.prodForm.vatPercent||0),
          type: (this.prodForm.type||'').trim() || undefined,
          colorOptions: Array.isArray(this.prodForm.colorOptions) ? this.prodForm.colorOptions.filter(Boolean) : undefined,
          ...catFields
        }
      }

      if(this.prodForm.id){
        const i = this.products.findIndex(p => String(p.id)===String(this.prodForm.id))
        if(i>-1) this.$set(this.products, i, buildProduct())
        this.toast('Ürün güncellendi')
      }else{
        this.products.push(buildProduct())
        this.toast('Ürün eklendi')
      }
      this.dialogs.prod=false
      this.persistAll()
    },

    deleteProduct(p){
      const ok = confirm(`'${this.pName(p)}' ürününü silmek istiyor musun?`)
      if(!ok) return
      const idStr = String(p.id)
      this.products = this.products.filter(x => String(x.id)!==idStr)
      // hareketleri de temizle
      this.stockMoves = (this.stockMoves||[]).filter(m => String(m.productId)!==idStr)
      if(this.activeProduct && String(this.activeProduct.id)===idStr){
        this.backToList()
      }
      this.persistAll()
      this.toast('Ürün silindi','orange')
    },

    // ------- PERSIST
    genId(prefix='id'){
      return `${prefix}_${Math.random().toString(36).slice(2,8)}${Date.now().toString(36).slice(-4)}`
    },
    persistAll(){
      try{
        localStorage.setItem('categories', JSON.stringify(this.categories||[]))
        localStorage.setItem('products',   JSON.stringify(this.products||[]))
        localStorage.setItem('suppliers',  JSON.stringify(this.suppliers||[]))
        localStorage.setItem('stockMovements', JSON.stringify(this.stockMoves||[]))
        try{ reload(true) }catch(e){}
      }catch(e){
        console.warn('persistAll error', e)
      }
    },
  }
}
</script>

<style scoped>
/* GENEL KART */
.soft-card{
  border:1px solid var(--card-border, rgba(0,0,0,.08));
  border-radius:16px;
  background: var(--card-bg, rgba(255,255,255,.75));
  backdrop-filter: blur(8px) saturate(120%);
  transition: box-shadow .2s ease, transform .15s ease, border-color .2s ease;
  position: relative;
}
.soft-card:hover{ box-shadow: 0 12px 28px rgba(0,0,0,.12); transform: translateY(-2px); }
.theme--dark .soft-card{
  border-color: rgba(255,255,255,.12);
  background: rgba(24,24,24,.7);
}

/* hero benzeri kart arkaplanı */
.heroish{ position:relative; overflow:hidden; }
.card-hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  filter: blur(42px);
  opacity:.28;
  pointer-events:none;
}
.theme--dark .card-hero-glow{ opacity:.20 }

/* Drawer */
.elevated-drawer{
  border-top-right-radius:16px;
  border-bottom-right-radius:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
}

/* Hero */
.hero{ position:relative; height:120px; overflow:hidden; border-bottom:1px solid rgba(0,0,0,.04) }
.theme--light .hero{ background:linear-gradient(180deg,#ffffff,#fafafa) }
.theme--dark .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10) }
.hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite;
  filter:blur(42px); opacity:.55
}
.theme--dark .hero-glow{ opacity:.35 }
.hero-content{ position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding:12px 24px }
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px }
.hero-sub{ opacity:.8 }

/* Category card */
.category-card{ cursor:pointer; min-height: 100px; }
.cat-header{ display:flex; align-items:center; gap:12px; padding:12px 14px }
.cat-header .left{ display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:12px; background:rgba(255,255,255,.5) }
.theme--dark .cat-header .left{ background:rgba(0,0,0,.25) }
.truncate{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap }

/* Product card */
.product-card{ cursor:pointer; padding:12px; min-height: 150px; }
.prod-top{ display:flex; align-items:flex-start; gap:10px }
.title-area{ min-width:0 }
.title-area .name{ font-weight:700; line-height:1.2 }
.muted{ opacity:.65 }
.prod-bottom{ margin-top:8px }

/* kebab (3 nokta) */
.kebab-wrap{
  position:absolute;
  top:6px; right:6px;
  z-index: 2;
}
.kebab-btn{ background:rgba(255,255,255,.6) }
.theme--dark .kebab-btn{ background:rgba(0,0,0,.25) }

/* Timeline spacing fix */
.v-timeline{ padding-top:0 }

/* Anim */
@keyframes float{
  0%{ transform:translate3d(0,0,0) rotate(0deg) }
  50%{ transform:translate3d(2%,-2%,0) rotate(1deg) }
  100%{ transform:translate3d(0,0,0) rotate(0deg) }
}
</style>

<style>
.v-main__wrap{ padding-top:0 !important; }
</style>
