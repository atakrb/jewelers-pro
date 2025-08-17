<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
    <!-- SOL MENÜ -->
    <v-navigation-drawer
        v-model="mainDrawer"
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
        <h2 class="hero-title">Hızlı Satış</h2>
        <div class="hero-sub">Ürün arama, sepet ve fiş — tek ekranda.</div>
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

    <!-- SAYFA İÇERİĞİ -->
    <v-container fluid class="pt-4">
      <v-row dense>
        <!-- SOL: ÜRÜN ARAMA + LİSTE -->
        <v-col cols="12" md="8">
          <!-- STICKY FİLTRE ÇUBUĞU -->
          <v-sheet class="filters-sheet mb-3 sticky-top">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                    v-model="filters.q"
                    label="Ara (ad, SKU, barkod, karat, ayar)"
                    dense
                    outlined
                    clearable
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    @keyup.enter="onQuickEnter"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-select
                    v-model="filters.category"
                    :items="categoryOptions"
                    dense outlined hide-details clearable
                    label="Kategori"
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-select
                    v-model="filters.type"
                    :items="typeOptions"
                    dense outlined hide-details clearable
                    label="Tür"
                />
              </v-col>
            </v-row>
            <v-row dense class="mt-1">
              <v-col cols="6" md="3">
                <v-select v-model="filters.sort" :items="sortOptions" dense outlined hide-details label="Sırala"/>
              </v-col>
              <v-col cols="6" md="3" class="d-flex align-center">
                <v-checkbox v-model="filters.inStockOnly" hide-details label="Stokta"/>
              </v-col>
              <v-col cols="12" md="6" class="d-flex justify-end">
                <v-btn small class="glass-btn mr-2" @click="showMore = !showMore">
                  <v-icon left small>mdi-tune</v-icon>{{ showMore ? 'Filtreleri Gizle' : 'Gelişmiş Filtreler' }}
                </v-btn>
                <v-btn small class="glass-btn" @click="yenileDb">
                  <v-icon left small>mdi-reload</v-icon> Yenile
                </v-btn>
              </v-col>
            </v-row>

            <transition name="fade">
              <div v-if="showMore" class="d-flex flex-wrap mt-2">
                <div class="caption grey--text mr-2 mt-1">Kategoriler:</div>
                <v-chip
                    v-for="c in categoryOptions" :key="'cat-'+c"
                    small class="mr-1 mb-1"
                    :color="filters.category===c ? accent : ''"
                    :text-color="filters.category===c ? 'white' : ''"
                    @click="filters.category = filters.category===c ? null : c"
                >{{ c }}</v-chip>

                <div class="caption grey--text mr-2 mt-1 ml-4">Tür:</div>
                <v-chip
                    v-for="t in typeOptions" :key="'type-'+t"
                    small class="mr-1 mb-1"
                    :color="filters.type===t ? accent : ''"
                    :text-color="filters.type===t ? 'white' : ''"
                    @click="filters.type = filters.type===t ? null : t"
                >{{ t }}</v-chip>
              </div>
            </transition>
          </v-sheet>

          <!-- LİSTE BAŞLIĞI + SAYILAR -->
          <v-card outlined class="table-card mb-2">
            <v-card-title class="titlebar">
              <div class="subtitle-1 font-weight-bold">Ürünler</div>
              <v-spacer/>
              <div class="d-flex flex-wrap">
                <v-chip small class="mr-2">Kayıt: {{ filteredProducts.length }}</v-chip>
                <v-chip small color="teal" text-color="white" class="mr-2">Stok (filtre): {{ stokToplam }}</v-chip>
                <v-chip small color="deep-purple" text-color="white">Fiyat ort.: {{ tl(ortalamaFiyat) }}</v-chip>
              </div>
            </v-card-title>

            <!-- ÜRÜN TABLOSU -->
            <v-data-table
                :headers="productHeaders"
                :items="filteredProducts"
                dense
                :items-per-page="10"
                class="elevated-datatable product-table"
                :footer-props="{ 'items-per-page-options':[10,25,50,100] }"
            >
              <!-- Ürün -->
              <template v-slot:item.isim="{ item }">
                <div class="d-flex align-center">
                  <v-icon class="mr-3 grey--text">mdi-diamond-stone</v-icon>
                  <div>
                    <div class="font-weight-medium">{{ item.isim }}</div>
                    <div class="caption grey--text">
                      #{{ item.sku || item.id }} • {{ item.karat ? item.karat + 'k' : '' }} {{ item.ayar }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Kategori -->
              <template v-slot:item.type="{ item }">
                <v-chip small>{{ item.type }}</v-chip>
              </template>

              <!-- Stok -->
              <template v-slot:item.stok="{ item }">
                <v-chip
                    x-small
                    :color="item.stok<=0 ? 'red' : item.stok<=5 ? 'orange' : 'green'"
                    text-color="white"
                >{{ item.stok }}</v-chip>
              </template>

              <!-- Fiyat -->
              <template v-slot:item.price="{ item }">
                <strong>{{ tl(unitGross(item)) }}</strong>
              </template>

              <!-- İşlemler -->
              <template v-slot:item.ops="{ item }">
                <div class="row-actions">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn v-bind="attrs" v-on="on" icon small class="glass-btn-icon" @click="openProductDrawer(item)">
                        <v-icon small>mdi-tune</v-icon>
                      </v-btn>
                    </template>
                    <span>Detay</span>
                  </v-tooltip>
                  <v-btn small :color="accent" dark :disabled="item.stok<=0" @click="quickAdd(item)">
                    <v-icon left small>mdi-cart-plus</v-icon> Ekle
                  </v-btn>
                </div>
              </template>

              <template v-slot:no-data>
                <v-alert type="info" outlined>Sonuç bulunamadı.</v-alert>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <!-- SAĞ: MÜŞTERİ + SEPET + FİŞ (STICKY) -->
        <v-col cols="12" md="4" class="sticky-col">
          <!-- MÜŞTERİ -->
          <v-card class="mb-3 table-card" outlined>
            <v-card-title class="subtitle-1 font-weight-bold">Müşteri</v-card-title>
            <v-card-text>
              <v-text-field v-model="musteri.ad" label="Ad Soyad" dense outlined/>
              <v-text-field v-model="musteri.tel" label="Telefon" dense outlined/>
              <v-text-field v-model="musteri.not" label="Not" dense outlined/>
            </v-card-text>
          </v-card>

          <!-- SEPET -->
          <v-card class="mb-3 table-card" outlined>
            <v-card-title class="subtitle-1 font-weight-bold">
              Sepet
              <v-spacer/>
              <v-chip x-small>{{ sepet.length }} kalem</v-chip>
            </v-card-title>
            <v-card-text>
              <div v-if="sepet.length===0" class="grey--text">Sepet boş.</div>

              <v-list two-line v-else>
                <v-list-item v-for="(s, i) in sepet" :key="s.key" class="px-0">
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-medium">
                      {{ s.isim }} — <span class="grey--text caption">#{{ s.sku || s.id }}</span>
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <span v-if="s.beden">Beden: {{ s.beden }} • </span>
                      <span v-if="s.tas">Taş: {{ s.tas }} • </span>
                      <span class="grey--text">KDV: {{ s.vatPercent }}%</span>
                    </v-list-item-subtitle>

                    <div class="d-flex flex-wrap align-center mt-1">
                      <div class="d-flex align-center mr-2">
                        <v-btn icon x-small @click="decQty(i)"><v-icon small>mdi-minus</v-icon></v-btn>
                        <v-text-field v-model.number="s.adet" type="number" min="1" hide-details dense class="mx-1 text-right" style="max-width:70px"/>
                        <v-btn icon x-small @click="incQty(i)"><v-icon small>mdi-plus</v-icon></v-btn>
                      </div>

                      <!-- İNDİRİM MENÜSÜ — FIX -->
                      <v-menu
                          offset-y
                          max-width="340px"
                          :close-on-content-click="false"
                          transition="scale-transition"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn v-bind="attrs" v-on="on" x-small class="mr-2 glass-btn">
                            <v-icon left x-small>mdi-sale</v-icon>
                            {{ s.indirimTip ? (s.indirimTip==='pct' ? '%' : '₺') + s.indirimDeger : 'İndirim' }}
                          </v-btn>
                        </template>
                        <v-card>
                          <v-card-text>
                            <v-row dense>
                              <v-col cols="6">
                                <v-select
                                    v-model="s.indirimTip"
                                    :items="discountTypes"
                                    item-text="text"
                                    item-value="value"
                                    dense outlined label="Tür"
                                    :menu-props="{ closeOnContentClick:false }"
                                />
                              </v-col>
                              <v-col cols="6">
                                <v-text-field
                                    v-model.number="s.indirimDeger"
                                    :disabled="!s.indirimTip"
                                    type="number"
                                    dense outlined
                                    label="Değer"
                                    :min="0"
                                    :max="s.indirimTip==='pct' ? 100 : null"
                                    step="0.01"
                                />
                              </v-col>
                            </v-row>

                            <v-checkbox v-model="s.mf" hide-details label="Manuel Fiyat (₺)"/>
                            <v-text-field
                                v-model.number="s.mfDeger"
                                :disabled="!s.mf"
                                type="number" dense outlined
                                label="Manuel Birim (KDV dahil)"
                                min="0" step="0.01"
                            />
                            <v-text-field v-model="s.not" dense outlined label="Satır Notu"/>
                          </v-card-text>
                        </v-card>
                      </v-menu>

                      <div class="ml-auto text-right">
                        <div class="subtitle-2 font-weight-bold">{{ tl(lineUnitBrut(s)) }}</div>
                        <div class="caption grey--text">
                          {{ tl(lineUnitBrut(s)) }} × {{ s.adet }}
                          <span class="ml-1">| Kâr: {{ tl(lineProfit(s)) }}</span>
                        </div>
                      </div>
                    </div>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-btn icon @click="removeLine(i)"><v-icon>mdi-delete</v-icon></v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <v-divider class="my-3" v-if="sepet.length"/>
              <div v-if="sepet.length">
                <div class="d-flex justify-space-between">
                  <span>Ara Toplam (Net)</span><strong>{{ tl(sepetToplamNet) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>KDV</span><strong>{{ tl(sepetToplamKDV) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Genel Toplam (Brüt)</span><strong class="headline">{{ tl(sepetToplamBrut) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span>Kâr Toplam</span><strong class="green--text">{{ tl(sepetToplamKar) }}</strong>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="px-4 pb-4">
              <v-btn text class="glass-btn" @click="sepetiTemizle" :disabled="sepet.length===0">Sepeti Temizle</v-btn>
              <v-spacer/>
              <v-btn color="success" dark :disabled="sepet.length===0" @click="satisiOnayla">
                <v-icon left>mdi-check</v-icon> Satışı Onayla
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- FİŞ -->
          <v-card id="fisPrint" outlined class="table-card">
            <v-card-title class="subtitle-1 font-weight-bold">Fiş</v-card-title>
            <v-card-text>
              <div class="caption grey--text mb-2">{{ fis.onaylandi ? 'Satış Onaylandı' : 'Önizleme' }}</div>

              <div class="mb-2">
                <div><strong>Fiş No:</strong> {{ fis.no || '-' }}</div>
                <div><strong>Tarih:</strong> {{ fis.tarih || nowStr }}</div>
                <div><strong>Müşteri:</strong> {{ musteri.ad || 'Genel Müşteri' }}</div>
              </div>

              <v-simple-table dense>
                <thead>
                <tr><th class="text-left">Ürün</th><th class="text-right">Adet</th><th class="text-right">Birim</th><th class="text-right">Tutar</th></tr>
                </thead>
                <tbody>
                <tr v-for="s in fisKalemleri" :key="s.key">
                  <td>{{ s.isim }}<span v-if="s.beden"> ({{ s.beden }})</span></td>
                  <td class="text-right">{{ s.adet }}</td>
                  <td class="text-right">{{ tl(lineUnitBrut(s)) }}</td>
                  <td class="text-right">{{ tl(lineTotalBrut(s)) }}</td>
                </tr>
                <tr v-if="fisKalemleri.length===0">
                  <td colspan="4" class="grey--text text-center">Sepet boş</td>
                </tr>
                </tbody>
              </v-simple-table>

              <v-divider class="my-2"/>
              <div class="d-flex justify-space-between"><div>Ara Toplam (Net)</div><div class="font-weight-bold">{{ tl(fisToplamNet) }}</div></div>
              <div class="d-flex justify-space-between"><div>KDV</div><div class="font-weight-bold">{{ tl(fisToplamKDV) }}</div></div>
              <div class="d-flex justify-space-between"><div>Genel Toplam</div><div class="font-weight-bold">{{ tl(fisToplamBrut) }}</div></div>
            </v-card-text>
            <v-card-actions class="px-4 pb-4">
              <v-btn block class="glass-btn" :disabled="!fis.onaylandi" @click="yazdir">
                <v-icon left>mdi-printer</v-icon> Yazdır (Fiş)
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-snackbar v-model="snack.show" :color="snack.color" timeout="2200">{{ snack.text }}</v-snackbar>
    </v-container>

    <!-- ÜRÜN DETAY ÇEKMECESİ -->
    <v-navigation-drawer v-model="drawer.open" app right temporary width="420" class="elevation-12">
      <v-toolbar flat>
        <v-toolbar-title class="subtitle-1 font-weight-bold">{{ drawer.p?.isim || 'Ürün' }}</v-toolbar-title>
        <v-spacer/><v-btn icon @click="drawer.open=false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-divider/>
      <v-container class="py-4">
        <div class="d-flex align-center justify-center mb-3">
          <v-icon size="96" class="grey--text">mdi-diamond-stone</v-icon>
        </div>

        <v-simple-table dense class="mb-3">
          <tbody>
          <tr><td>SKU</td><td class="text-right">{{ drawer.p?.sku || drawer.p?.id }}</td></tr>
          <tr><td>Karat/Ayar</td><td class="text-right">{{ drawer.p?.karat ? drawer.p.karat + 'k' : '' }} {{ drawer.p?.ayar }}</td></tr>
          <tr><td>Stok</td><td class="text-right">{{ drawer.p?.stok }}</td></tr>
          <tr><td>Fiyat</td><td class="text-right font-weight-bold">{{ tl(drawer.p ? unitGross(drawer.p) : 0) }}</td></tr>
          </tbody>
        </v-simple-table>

        <v-form>
          <v-select v-if="(drawer.p?.type||'').toLowerCase()==='yüzük'"
                    v-model="drawer.form.beden" :items="ringSizes" dense outlined label="Beden" class="mb-2"/>
          <v-select v-if="drawer.p?.colorOptions?.length"
                    v-model="drawer.form.tas" :items="drawer.p.colorOptions" dense outlined label="Taş/Renk" class="mb-2"/>

          <v-text-field v-model.number="drawer.form.adet" type="number" min="1" dense outlined label="Adet" class="mb-2"/>

          <v-row dense class="mb-2">
            <v-col cols="6">
              <v-select
                  v-model="drawer.form.indirimTip"
                  :items="discountTypes" item-text="text" item-value="value"
                  dense outlined label="İndirim Türü"/>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="drawer.form.indirimDeger" :disabled="!drawer.form.indirimTip"
                            type="number" dense outlined label="Değer" :min="0" step="0.01"/>
            </v-col>
          </v-row>

          <v-checkbox v-model="drawer.form.mf" hide-details label="Manuel Fiyat (₺, KDV dahil)"/>
          <v-text-field v-model.number="drawer.form.mfDeger" :disabled="!drawer.form.mf"
                        type="number" dense outlined label="Manuel Birim Fiyat" class="mb-2" min="0" step="0.01"/>

          <v-text-field v-model="drawer.form.not" dense outlined label="Satır Notu"/>
        </v-form>

        <div class="mt-4">
          <v-btn block :color="accent" dark :disabled="!drawer.p || (drawer.p && drawer.p.stok<=0)" @click="addFromDrawer">
            <v-icon left>mdi-cart-plus</v-icon> Sepete Ekle
          </v-btn>
          <div class="caption grey--text mt-2" v-if="drawer.p && drawer.p.stok<=0">Stok yok.</div>
        </div>
      </v-container>
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import { get, reloadDb } from '@/utils/harddata'
import { priceCalc } from '@/utils/pricing'

export default {
  name: 'SatisPage',

  data() {
    return {
      // Tema / navigasyon
      mainDrawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini: this.$vuetify?.breakpoint?.lgAndUp || false,
      accent: localStorage.getItem('jp_accent') || '#5865F2',
      accents: ['#5865F2', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
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
        { key:'Y', icon:'mdi-reload',       title:'Yenile',          subtitle:'Verileri tazele', click:()=>this.yenileDb() },
        { key:'S', icon:'mdi-cart-remove',  title:'Sepeti Temizle',  subtitle:'Tüm kalemleri kaldır', click:()=>this.sepetiTemizle() },
        { key:'O', icon:'mdi-check',        title:'Satışı Onayla',   subtitle:'Stok düş + fiş hazırla', click:()=>this.satisiOnayla() },
        { key:'P', icon:'mdi-printer',      title:'Fişi Yazdır',     subtitle:'Onay sonrası', click:()=>this.yazdir() },
      ],

      products: [],

      productHeaders: [
        { text: 'Ürün', value: 'isim', width: 360 },
        { text: 'Kategori', value: 'type', width: 120 },
        { text: 'Stok', value: 'stok', align: 'end', width: 90 },
        { text: 'Fiyat (KDV)', value: 'price', align: 'end', width: 140 },
        { text: '', value: 'ops', sortable: false, align: 'end', width: 160 },
      ],

      filters: { q:'', category:null, type:null, inStockOnly:false, sort:'yeni' },
      showMore: false,

      sepet: [],
      musteri: { ad:'', tel:'', not:'' },

      drawer: {
        open:false,
        p:null,
        form: { adet:1, beden:null, tas:null, indirimTip:null, indirimDeger:0, mf:false, mfDeger:null, not:'' }
      },

      fis: { onaylandi:false, no:'', tarih:'', kalemler:[] },

      snack: { show:false, color:'green', text:'' },

      sortOptions: [
        { text: 'Yeni', value:'yeni' },
        { text: 'Fiyat (Artan)', value:'fiyat_asc' },
        { text: 'Fiyat (Azalan)', value:'fiyat_desc' },
        { text: 'Stok (Azalan)', value:'stok_desc' },
      ],

      discountTypes: [
        { text:'Yok', value:null }, { text:'% Oran', value:'pct' }, { text:'₺ Tutar', value:'tl' }
      ],

      ringSizes: ['9','10','11','12','13','14','15','16','17','18','19','20'],
    }
  },

  async created() {
    try {
      const fromMem = get('products') || []
      this.products = Array.isArray(fromMem) ? fromMem : []

      if (!this.products.length) {
        const db = await reloadDb()
        this.products = db.products || []
      }
    } catch (e) {
      console.error('products yüklenemedi:', e)
      this.products = []
    }
  },

  computed: {
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },

    categoryOptions(){
      const set = new Set((this.products || []).map(p => p.type).filter(Boolean))
      return Array.from(set)
    },
    typeOptions(){
      const set = new Set((this.products || []).map(p => (p.karat ? `${p.karat}k` : p.ayar)).filter(Boolean))
      return Array.from(set)
    },

    filteredProducts(){
      const f = this.filters
      const q = (f.q||'').toLowerCase().trim()
      let arr = (this.products || []).filter(p => {
        const txt = [p.isim, p.sku, p.id, p.karat, p.ayar].join(' ').toString().toLowerCase()
        const passQ = q ? txt.includes(q) : true
        const passCat = f.category ? p.type === f.category : true
        const passType = f.type ? (p.karat ? `${p.karat}k` : p.ayar) === f.type : true
        const passStock = f.inStockOnly ? (p.stok||0) > 0 : true
        return passQ && passCat && passType && passStock
      })

      if(f.sort==='fiyat_asc')   arr.sort((a,b)=> this.unitGross(a) - this.unitGross(b))
      if(f.sort==='fiyat_desc')  arr.sort((a,b)=> this.unitGross(b) - this.unitGross(a))
      if(f.sort==='stok_desc')   arr.sort((a,b)=> (b.stok||0) - (a.stok||0))
      if(f.sort==='yeni')        arr.sort((a,b)=> b.id - a.id)

      return arr
    },

    // Özet sayılar
    stokToplam(){ return this.filteredProducts.reduce((t,p)=> t + (Number(p.stok)||0), 0) },
    ortalamaFiyat(){
      if(!this.filteredProducts.length) return 0
      const sum = this.filteredProducts.reduce((t,p)=> t + this.unitGross(p), 0)
      return sum / this.filteredProducts.length
    },

    // SEPET toplamları
    sepetToplamNet(){  return this.sepet.reduce((t,s)=> t + this.lineNet(s), 0) },
    sepetToplamKDV(){  return this.sepet.reduce((t,s)=> t + this.lineKDV(s), 0) },
    sepetToplamBrut(){ return this.sepetToplamNet + this.sepetToplamKDV },
    sepetToplamKar(){  return this.sepet.reduce((t,s)=> t + this.lineProfit(s), 0) },

    // FİŞ toplamları
    fisKalemleri(){ return this.fis.onaylandi ? this.fis.kalemler : this.sepet },
    fisToplamNet(){  return this.fisKalemleri.reduce((t,s)=> t + this.lineNet(s), 0) },
    fisToplamKDV(){  return this.fisKalemleri.reduce((t,s)=> t + this.lineKDV(s), 0) },
    fisToplamBrut(){ return this.fisToplamNet + this.fisToplamKDV },

    nowStr(){ return new Date().toLocaleString('tr-TR') },
  },

  methods: {
    // Tema
    setAccent(c){ this.accent = c; localStorage.setItem('jp_accent', c) },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark },

    /* ----- yardımcılar ----- */
    tl(n){ return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(n||0) },
    toast(t,c='green'){ this.snack = { show:true, color:c, text:t } },

    async yenileDb(){
      const db = await reloadDb()
      this.products = db.products || []
      this.toast('Veriler yenilendi')
    },

    unitGross(p){ return priceCalc(p).priceGross },

    /* ----- sepet & satır hesapları ----- */
    quickAdd(p){
      if((p.stok||0) <= 0){ this.toast('Stok yok!','red'); return }
      this.addLine({
        ...p,
        key: this.newKey(),
        adet: 1,
        indirimTip: null, indirimDeger: 0,
        mf: false, mfDeger: null,
        beden: null, tas: null, not:''
      })
    },

    openProductDrawer(p){
      this.drawer.p = p
      this.drawer.form = { adet:1, beden:null, tas:null, indirimTip:null, indirimDeger:0, mf:false, mfDeger:null, not:'' }
      this.drawer.open = true
    },
    addFromDrawer(){
      const p = this.drawer.p
      const f = this.drawer.form
      if((p.stok||0) <= 0){ this.toast('Stok yok!','red'); return }
      this.addLine({
        ...p,
        key: this.newKey(),
        adet: Number(f.adet)||1,
        beden: f.beden, tas: f.tas,
        indirimTip: f.indirimTip, indirimDeger: Number(f.indirimDeger)||0,
        mf: !!f.mf, mfDeger: f.mf ? Number(f.mfDeger||0) : null,
        not: f.not || ''
      })
      this.drawer.open = false
    },

    addLine(satir){
      const sepetteAdet = this.sepet.filter(x=>x.id===satir.id).reduce((t,x)=> t + Number(x.adet||0), 0)
      if(sepetteAdet + satir.adet > (satir.stok||0)){
        return this.toast(`Yetersiz stok. Kalan: ${(satir.stok||0) - sepetteAdet}`,'red')
      }
      this.sepet.push(satir)
      this.fis.onaylandi = false
    },

    calcLine(s){
      const base = priceCalc(s)
      let unitGross = s.mf ? Number(s.mfDeger||0) : base.priceGross
      if(s.indirimTip === 'pct'){
        unitGross = Math.max(0, unitGross * (1 - Number(s.indirimDeger||0)/100))
      }else if(s.indirimTip === 'tl'){
        unitGross = Math.max(0, unitGross - Number(s.indirimDeger||0))
      }
      const vatP = Number(s.vatPercent||0)
      const unitNet = unitGross / (1 + vatP/100)

      const adet = Number(s.adet)||1
      const lineNet = unitNet * adet
      const lineGross = unitGross * adet
      const lineKDV = lineGross - lineNet

      const unitProfit = unitNet - base.base
      const lineProfit = unitProfit * adet

      return { unitNet, unitGross, lineNet, lineGross, lineKDV, lineProfit }
    },
    lineUnitBrut(s){ return this.calcLine(s).unitGross },
    lineTotalBrut(s){ return this.calcLine(s).lineGross },
    lineNet(s){ return this.calcLine(s).lineNet },
    lineKDV(s){ return this.calcLine(s).lineKDV },
    lineProfit(s){ return this.calcLine(s).lineProfit },

    removeLine(i){ this.sepet.splice(i,1); this.fis.onaylandi=false },
    incQty(i){
      const s = this.sepet[i]
      const toplam = this.sepet.filter(x=>x.id===s.id).reduce((t,x)=> t + Number(x.adet||0), 0)
      const kalan = (s.stok||0) - toplam
      if(kalan <= 0){ this.toast('Stok yetersiz','red'); return }
      s.adet = Number(s.adet||0) + 1; this.fis.onaylandi = false
    },
    decQty(i){ const s=this.sepet[i]; s.adet = Math.max(1, Number(s.adet||1)-1); this.fis.onaylandi=false },

    sepetiTemizle(){ this.sepet = []; this.fis.onaylandi=false },

    satisiOnayla(){
      if(this.sepet.length===0) return
      const counts = {}
      for(const s of this.sepet) counts[s.id] = (counts[s.id]||0) + Number(s.adet||0)
      for(const pid in counts){
        const p = this.products.find(x=>String(x.id)===String(pid))
        if(!p) return this.toast(`Ürün yok: ${pid}`,'red')
        if(counts[pid] > (p.stok||0)) return this.toast(`${p.isim} için yetersiz stok (kalan: ${p.stok})`,'red')
      }
      for(const pid in counts){
        const p = this.products.find(x=>String(x.id)===String(pid))
        p.stok = Math.max(0, (p.stok||0) - counts[pid])
      }

      const d = new Date(); const pad = x=>String(x).padStart(2,'0')
      const no = `S-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
      this.fis.no = no
      this.fis.tarih = d.toLocaleString('tr-TR')
      this.fis.kalemler = this.sepet.map(s => ({ ...s }))
      this.fis.onaylandi = true

      this.sepet = []
      this.toast('Satış onaylandı','green')
    },
    yazdir(){ window.print() },

    onQuickEnter(){
      const q = (this.filters.q||'').trim()
      if(!q) return
      const p = this.products.find(x =>
          String(x.sku||'').toLowerCase() === q.toLowerCase()
          || String(x.id) === q
          || String(x.barcode||'') === q
      )
      if(p){ this.quickAdd(p); this.filters.q = '' }
    },

    newKey(){ return `${Date.now()}_${Math.floor(Math.random()*10000)}` },
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
.hero{ position:relative; height:120px; overflow:hidden; border-bottom:1px solid rgba(0,0,0,.04) }
.theme--light .hero{ background:linear-gradient(180deg,#ffffff,#fafafa) }
.theme--dark  .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10) }
.hero-glow{ position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite; filter:blur(42px); opacity:.55
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
  transition:transform .2s ease, box-shadow .2s ease
}
.theme--dark .qa{ background:rgba(30,30,30,.7) }
.qa:hover{ transform:translateY(-3px); box-shadow:0 10px 20px rgba(0,0,0,.08) }

/* Filters sheet */
.filters-sheet{
  border-radius:16px; padding:14px 16px;
  border:1px solid rgba(0,0,0,.06);
  background:rgba(255,255,255,.75);
  backdrop-filter:blur(8px) saturate(120%)
}
.theme--dark .filters-sheet{
  border-color:rgba(255,255,255,.06);
  background:rgba(24,24,24,.7)
}
.glass-btn{ background:rgba(255,255,255,.6); border:1px solid rgba(0,0,0,.06) }
.theme--dark .glass-btn{ background:rgba(24,24,24,.6); border-color:rgba(255,255,255,.08) }
.glass-btn-icon{ background:rgba(255,255,255,.5) }
.theme--dark .glass-btn-icon{ background:rgba(28,28,28,.6) }

/* Sticky helpers */
.sticky-top{ position:sticky; top:72px; z-index:2 }
.sticky-col{ position:sticky; top:84px }

/* Tables & Cards */
.table-card{ border-radius:16px; overflow:hidden }
.titlebar{ padding:10px 16px; border-bottom:1px solid rgba(0,0,0,.06) }
.elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#fafafa,#f4f6f8) }
.theme--dark .elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#1d1d1d,#181818) }
.elevated-datatable ::v-deep tbody tr:hover{ background:rgba(0,0,0,.02) }
.theme--dark .elevated-datatable ::v-deep tbody tr:hover{ background:rgba(255,255,255,.04) }
.row-actions{ display:flex; align-items:center; gap:8px }

/* Product table max-height */
.product-table ::v-deep .v-data-table__wrapper { max-height: 65vh; }

/* Print: sadece fiş */
@media print {
  body * { visibility: hidden !important; }
  #fisPrint, #fisPrint * { visibility: visible !important; }
  #fisPrint { position: absolute; left: 0; top: 0; width: 100%; }
}

/* Anim */
@keyframes float{
  0%{ transform:translate3d(0,0,0) rotate(0deg) }
  50%{ transform:translate3d(2%,-2%,0) rotate(1deg) }
  100%{ transform:translate3d(0,0,0) rotate(0deg) }
}
</style>

<style>
/* v-main default top padding'i iptal */
.v-main__wrap{ padding-top:0 !important; }
</style>
