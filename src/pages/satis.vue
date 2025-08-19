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
            <v-list-item-subtitle>Satış Paneli</v-list-item-subtitle>
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
          <v-btn v-for="c in accents" :key="c" icon small :style="{ color: c }" @click="setAccent(c)">
            <v-icon>mdi-circle</v-icon>
          </v-btn>
        </v-list-item>

        <v-list-item class="rounded-lg" @click="cycleTheme">
          <v-list-item-icon><v-icon>mdi-theme-light-dark</v-icon></v-list-item-icon>
          <v-list-item-title>Tema</v-list-item-title>
          <v-spacer />
          <v-chip x-small>{{ themeLabel }}</v-chip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- HERO -->
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Hızlı Satış</h2>
        <div class="hero-sub">Barkod okut ya da ara → sepete ekle. Tüm işlemler ③ menüden.</div>
      </div>
    </div>

    <!-- ARAMA -->
    <v-container class="pt-4 pb-0">
      <v-row dense>
        <v-col cols="12" md="8">
          <v-text-field
              v-model="query"
              ref="scanInput"
              dense
              outlined
              clearable
              hide-details
              label="Barkod, SKU, ID veya ürün adı yaz / okut"
              prepend-inner-icon="mdi-barcode-scan"
              @keyup.enter="handleEnter"
              @input="onQueryInput"
              :autofocus="true"
          />
          <v-menu
              v-model="suggestOpen"
              :close-on-content-click="false"
              :nudge-width="420"
              offset-y
              transition="fade-transition"
              max-width="560"
          >
            <template v-slot:activator="{ on }"><span v-on="on"></span></template>
            <v-card outlined class="soft-card">
              <v-list dense two-line>
                <v-list-item v-for="it in searchResults" :key="it.id" @click="addById(it.id)">
                  <v-list-item-avatar tile size="36">
                    <v-icon class="grey--text">mdi-diamond-stone</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="truncate">{{ it.isim || it.name }}</v-list-item-title>
                    <v-list-item-subtitle class="truncate">
                      #{{ it.sku || it.id }} • {{ it.karat ? it.karat + 'k' : '' }} {{ it.ayar || '' }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-chip x-small :color="chipColor(it)" text-color="white">{{ it.stok || it.stock || 0 }}</v-chip>
                  </v-list-item-action>
                </v-list-item>
                <v-list-item v-if="!searchResults.length">
                  <v-list-item-content><div class="caption grey--text">Sonuç yok.</div></v-list-item-content>
                </v-list-item>
              </v-list>
              <v-card-actions class="py-2 px-3">
                <v-spacer />
                <v-btn small class="glass-btn" @click="suggestOpen = false"><v-icon left small>mdi-close</v-icon>Kapat</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-col>

        <v-col cols="12" md="4" class="d-flex justify-end">
          <v-btn class="glass-btn mr-2" @click="reloadDb"><v-icon left small>mdi-reload</v-icon>Yenile</v-btn>
          <v-btn :color="accent" dark @click="openBarcodeScanner"><v-icon left small>mdi-camera-retake</v-icon>BARKOD</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- BARKOD SCANNER -->
    <v-dialog v-model="barcodeScannerOpen" max-width="600" persistent>
      <v-card>
        <v-card-title class="headline">Barkod Okuyucu</v-card-title>
        <v-card-text>
          <div id="interactive" class="viewport"></div>
          <div class="caption text-center mt-2" v-if="scanning">Lütfen barkodu kameraya gösterin...</div>
          <div class="caption text-center mt-2 red--text" v-if="scanError">{{ scanError }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="stopBarcodeScanner">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- İÇERİK -->
    <v-container class="py-4">
      <v-row dense>
        <!-- SOL BLOK -->
        <v-col cols="12" md="7">
          <!-- SEPET -->
          <v-card outlined class="soft-card">
            <v-card-title class="subtitle-1 font-weight-bold">
              <v-icon left class="mr-2 muted">mdi-cart</v-icon> Sepet
              <v-spacer />
              <v-chip x-small>{{ cart.length }} ürün</v-chip>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-3">
              <div v-if="cart.length === 0" class="grey--text text-center py-1">
                Sepet boş. Barkod okut veya arayıp ekle.
              </div>

              <div v-else class="cart-grid">
                <!-- TEK KART – tüm işlemler 3 nokta menüde -->
                <v-card v-for="(l, i) in cart" :key="l.key" outlined class="cart-item soft-card">
                  <!-- HEADER -->
                  <div class="item-header">
                    <v-list-item class="pa-0">
                      <v-list-item-avatar tile size="52" class="mr-3">
                        <!-- <v-img :src="l.img" /> -->
                        <v-icon class="grey--text">mdi-diamond-stone</v-icon>
                      </v-list-item-avatar>

                      <v-list-item-content>
                        <div class="title-row">
                          <v-list-item-title class="font-weight-bold truncate">
                            {{ l.isim }}
                          </v-list-item-title>

                          <!-- sağda fiyat -->
                          <div class="sum-inline">
                            <div class="overline muted">TUTAR</div>
                            <div class="headline font-weight-bold" :style="{ color: accent }">
                              {{ tl(lineGross(l)) }}
                            </div>
                          </div>
                        </div>

                        <v-list-item-subtitle class="mt-1">
                          <span class="muted">#{{ l.sku || l.id }}</span>
                          <v-chip x-small class="ml-2" v-if="l.karat">{{ l.karat }}k</v-chip>
                          <v-chip x-small class="ml-1" v-if="l.ayar">{{ l.ayar }}</v-chip>
                          <v-chip x-small :color="l.stok > 0 ? 'green' : 'red'" text-color="white" class="ml-2">
                            Stok: {{ l.stok }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item-content>

                      <v-list-item-action class="d-flex align-center">
                        <!-- Sil butonu MENÜ DIŞINDA -->
                        <v-btn icon @click="removeLine(i)" :title="'Sil'">
                          <v-icon color="red">mdi-trash-can</v-icon>
                        </v-btn>

                        <!-- 3 nokta menü -->
                        <v-menu offset-y>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon v-bind="attrs" v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                          </template>
                          <v-list dense>
                            <v-list-item @click="openEdit(i)">
                              <v-list-item-icon><v-icon>mdi-cash-edit</v-icon></v-list-item-icon>
                              <v-list-item-title>Fiyat / İndirim Düzenle</v-list-item-title>
                            </v-list-item>

                            <v-subheader class="mt-1">Hızlı İndirim</v-subheader>
                            <v-list-item @click="setLineDiscount(i, 5)"><v-list-item-title>%5</v-list-item-title></v-list-item>
                            <v-list-item @click="setLineDiscount(i, 10)"><v-list-item-title>%10</v-list-item-title></v-list-item>
                            <v-list-item @click="setLineDiscount(i, 15)"><v-list-item-title>%15</v-list-item-title></v-list-item>
                            <v-list-item @click="setLineDiscount(i, 20)"><v-list-item-title>%20</v-list-item-title></v-list-item>
                            <v-list-item @click="clearLineDiscount(i)">
                              <v-list-item-icon><v-icon>mdi-restore</v-icon></v-list-item-icon>
                              <v-list-item-title>İndirimi Sıfırla</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </v-list-item-action>
                    </v-list-item>
                  </div>





                  <!-- STOK UYARISI -->
                  <v-alert v-if="aggregatedQty(l.id) > Number(l.stok || 0)" dense outlined type="error" class="mt-2">
                    Stok yetersiz! Sepette toplam {{ aggregatedQty(l.id) }}, stokta {{ l.stok }} var.
                  </v-alert>
                </v-card>
              </div>
            </v-card-text>

            <v-card-actions class="px-3 py-2 pb-4">
              <v-btn text class="glass-btn" @click="clearCart" :disabled="cart.length === 0">SEPETİ TEMİZLE</v-btn>
              <v-spacer />
              <v-btn color="success" dark :disabled="cart.length === 0" @click="approveSale">
                <v-icon left>mdi-check</v-icon>SEPETİ TAMAMLA
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- MÜŞTERİ (opsiyonel basit) -->
          <v-card outlined class="soft-card mt-4 mb-4">
            <v-card-title class="subtitle-1 font-weight-bold">
              <v-icon left>mdi-account-circle-outline</v-icon>Müşteri
            </v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field v-model="customer.name" dense outlined label="Müşteri Adı" @blur="fixName" :disabled="customer.locked" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="customer.phone" dense outlined label="Telefon" :disabled="customer.locked" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- SAĞ BLOK = FİŞ & TOPLAM (Tüm fiyat/indirim burada) -->
        <v-col cols="12" md="5" class="sticky-col">
          <v-card id="fisPrint" outlined class="soft-card">
            <v-card-title class="subtitle-1 font-weight-bold">
              <v-icon left class="mr-1">mdi-receipt-text</v-icon>Fiş & Toplam
              <v-spacer />
              <v-chip x-small v-if="receipt.approved" color="green" text-color="white">Onaylandı</v-chip>
            </v-card-title>

            <v-card-text class="pt-0">
              <v-divider class="my-3" />

              <div class="caption grey--text mb-1">
                Fiş No: {{ receipt.no || '-' }} • Tarih: {{ receipt.date || nowStr }}
              </div>

              <!-- GENEL İNDİRİM AYARLARI (sadece fişte) -->
              <v-row dense class="mb-1">
                <v-col cols="12" class="d-flex align-center">
                  <div class="overline muted mr-2">Genel İndirim</div>

                  <v-btn-toggle v-model="selectedDiscount" class="soft-card">
                    <v-btn x-small :value="5">%5</v-btn>
                    <v-btn x-small :value="10">%10</v-btn>
                    <v-btn x-small :value="15">%15</v-btn>
                    <v-btn x-small :value="20">%20</v-btn>
                  </v-btn-toggle>

                  <v-spacer />

                 <!-- İNDİRİM TÜRÜ indirim türü
                 <v-select
                      v-model="cartDiscount.type"
                      :items="discountTypes"
                      item-text="text"
                      item-value="value"
                      dense
                      hide-details
                      outlined
                      class="mr-2"
                      style="max-width: 130px"
                  />
                  <v-text-field
                      v-model.number="cartDiscount.value"
                      :disabled="!cartDiscount.type"
                      type="number"
                      dense
                      hide-details
                      outlined
                      label="Değer"
                      min="0"
                      :max="cartDiscount.type === 'pct' ? 100 : null"
                      step="0.01"
                      style="max-width: 120px"
                  /> -->
                </v-col>
              </v-row>

              <!-- LİSTELER -->
              <v-simple-table class="soft-card"dense>
                <thead>
                <tr>
                  <th class="text-left">Ürün</th>
                  <th class="text-right">Adet</th>
                  <th class="text-right">Tutar</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="l in receiptLines" :key="l.key">
                  <td class="caption">{{ l.isim }}</td>
                  <td class="text-right caption">{{ l.qty }}</td>
                  <td class="text-right caption">{{ tl(lineGross(l)) }}</td>
                </tr>
                <tr v-if="receiptLines.length === 0">
                  <td colspan="4" class="grey--text text-center caption">Sepet boş</td>
                </tr>
                </tbody>
              </v-simple-table>

              <v-divider class="my-2" />

              <!-- Toplamlar -->
              <v-list-item class="px-0" v-if="lineDiscountTotalGross > 0">
                <v-list-item-content>
                  <v-list-item-title class="muted">Satır İndirimleri</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-title class="font-weight-bold red--text">- {{ tl(lineDiscountTotalGross) }}</v-list-item-title>
                </v-list-item-action>
              </v-list-item>

              <v-list-item class="px-0" v-if="cartDiscountAmountGross > 0">
                <v-list-item-content>
                  <v-list-item-title class="muted">Genel İndirim</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-title class="font-weight-bold red--text">- {{ tl(cartDiscountAmountGross) }}</v-list-item-title>
                </v-list-item-action>
              </v-list-item>

              <v-list-item class="px-0">
                <v-list-item-content><v-list-item-title class="muted">Ara Toplam (Brüt)</v-list-item-title></v-list-item-content>
                <v-list-item-action><v-list-item-title class="font-weight-bold">{{ tl(subtotalGross) }}</v-list-item-title></v-list-item-action>
              </v-list-item>

              <v-divider class="my-2" />

              <v-list-item class="px-0">
                <v-list-item-content><v-list-item-title class="headline font-weight-bold">Genel Toplam</v-list-item-title></v-list-item-content>
                <v-list-item-action><v-list-item-title class="headline font-weight-bold" :style="{ color: accent }">{{ tl(totalGross) }}</v-list-item-title></v-list-item-action>
              </v-list-item>

              <v-list-item class="px-0">
                <v-list-item-content><v-list-item-title class="muted">Net Toplam</v-list-item-title></v-list-item-content>
                <v-list-item-action><v-list-item-title class="font-weight-bold">{{ tl(totalNet) }}</v-list-item-title></v-list-item-action>
              </v-list-item>

              <v-list-item class="px-0">
                <v-list-item-content><v-list-item-title class="muted">KDV</v-list-item-title></v-list-item-content>
                <v-list-item-action><v-list-item-title class="font-weight-bold">{{ tl(totalVAT) }}</v-list-item-title></v-list-item-action>
              </v-list-item>
            </v-card-text>

            <v-card-actions class="px-4 pb-4">
              <v-btn class="glass-btn" :disabled="!receipt.approved" @click="printFis"><v-icon left>mdi-printer</v-icon>Yazdır</v-btn>
              <v-spacer />
              <v-btn text class="glass-btn" @click="resetSale"><v-icon left>mdi-broom</v-icon>Yeni Satış</v-btn>
            </v-card-actions>
          </v-card>

          <v-snackbar v-model="snack.show" :color="snack.color" timeout="2000">{{ snack.text }}</v-snackbar>
        </v-col>
      </v-row>
    </v-container>

    <!-- SATIR FİYAT/İNDİRİM DİYALOĞU -->
    <v-dialog v-model="edit.open" max-width="520">
      <v-card>
        <v-card-title class="headline">Fiyat / İndirim</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-checkbox v-model="edit.temp.manual" hide-details label="Manuel Birim (₺, KDV dahil)" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                  v-model.number="edit.temp.manualUnit"
                  :disabled="!edit.temp.manual"
                  type="number"
                  dense
                  outlined
                  label="Manuel Birim"
                  min="0"
                  step="0.01"
              />
            </v-col>
          </v-row>

          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                  v-model="edit.temp.discountType"
                  :items="discountTypes"
                  item-text="text"
                  item-value="value"
                  dense
                  outlined
                  label="Satır İndirimi"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                  v-model.number="edit.temp.discountValue"
                  :disabled="!edit.temp.discountType"
                  type="number"
                  dense
                  outlined
                  label="Değer"
                  :min="0"
                  :max="edit.temp.discountType === 'pct' ? 100 : null"
                  step="0.01"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="edit.open = false">Vazgeç</v-btn>
          <v-btn color="primary" dark @click="saveEdit"><v-icon left small>mdi-content-save</v-icon>Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// QuaggaJS kütüphanesini dahil edin
import Quagga from '@ericblade/quagga2';

export default {
  name: 'SatisPage',
  data() {
    return {
      // Tema & nav
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
        { title:'Kargo',         icon:'mdi-truck-outline',          to:'kargo' },
      ],

      // DB
      settings: { currency: 'TRY', defaultVatPercent: 20 },
      platforms: [],
      products: [],

      // Arama / Barkod
      query: '',
      suggestOpen: false,
      barcodeScannerOpen: false,
      scanning: false,
      scanError: '',

      // Sepet
      cart: [],
      discountTypes: [
        { text: 'Yok', value: null },
        { text: '% Oran', value: 'pct' },
      ],
      cartDiscount: { type: null, value: 0 },

      // Genel indirim preset (artık fişte)
      selectedDiscount: null,

      // Müşteri
      customer: { name: '', phone: '', note: '', platform: null, locked: false },

      // Fiş
      receipt: { approved: false, no: '', date: '', lines: [] },

      // Satır düzenleme
      edit: { open: false, idx: null, temp: { manual: false, manualUnit: null, discountType: null, discountValue: 0 } },

      snack: { show: false, color: 'green', text: '' },
    };
  },

  computed: {
    themeLabel() { return this.$vuetify.theme.dark ? 'Koyu' : 'Açık'; },
    nowStr() { return new Date().toLocaleString('tr-TR'); },

    // öneriler
    searchResults() {
      const q = (this.query || '').toLowerCase().trim();
      if (!q) return [];
      const arr = (this.products || []).filter(p => {
        const t = [p.isim, p.name, p.sku, p.barcode, p.id, p.karat, p.ayar].join(' ').toString().toLowerCase();
        return t.includes(q);
      });
      return arr.slice(0, 12);
    },

    // fiş satırları
    receiptLines() { return this.receipt.approved ? this.receipt.lines || [] : this.cart; },

    // indirimsiz ara toplam (satır indirim öncesi)
    baseSubtotalGross() {
      return this.receiptLines.reduce((t, l) => t + this.preDiscountUnitGross(l) * (Number(l.qty) || 1), 0);
    },
    // satır indirimlerinden sonra ara toplam
    subtotalGross() { return this.receiptLines.reduce((t, l) => t + this.lineGross(l), 0); },
    lineDiscountTotalGross() { return Math.max(0, this.baseSubtotalGross - this.subtotalGross); },

    // net / kdv ara toplam (genel indirim hariç)
    subtotalNet() { return this.receiptLines.reduce((t, l) => t + this.lineNet(l), 0); },
    subtotalVAT() { return this.receiptLines.reduce((t, l) => t + this.lineVAT(l), 0); },

    // genel indirim
    cartDiscountAmountGross() {
      if (!this.cartDiscount.type) return 0;
      if (this.cartDiscount.type === 'pct') return this.subtotalGross * (Number(this.cartDiscount.value || 0) / 100);
      return Math.min(this.subtotalGross, Number(this.cartDiscount.value || 0));
    },

    // nihai toplamlar
    totalGross() { return Math.max(0, this.subtotalGross - this.cartDiscountAmountGross); },
    totalNet()  { if (this.subtotalGross <= 0) return 0; const r = this.totalGross / this.subtotalGross; return this.subtotalNet * r; },
    totalVAT()  { if (this.subtotalGross <= 0) return 0; const r = this.totalGross / this.subtotalGross; return this.subtotalVAT * r; },

    totalProfit() {
      if (this.subtotalGross <= 0) return 0;
      const ratio = this.totalGross / this.subtotalGross;
      const sum = this.receiptLines.reduce((t, l) => t + this.lineProfitRaw(l), 0);
      return Math.max(0, sum * ratio);
    },
  },

  created() {
    this.loadDb();

    const c = JSON.parse(localStorage.getItem('jp_customer') || 'null');
    if (c && typeof c === 'object') this.customer = { ...this.customer, ...c };

    const cachedCart = JSON.parse(localStorage.getItem('jp_cart') || 'null');
    if (Array.isArray(cachedCart)) this.cart = cachedCart;

    const cachedDisc = JSON.parse(localStorage.getItem('jp_cart_disc') || 'null');
    if (cachedDisc && typeof cachedDisc === 'object') this.cartDiscount = cachedDisc;

    this.selectedDiscount = (this.cartDiscount?.type === 'pct')
        ? Number(this.cartDiscount.value || 0)
        : null;
  },

  watch: {
    cart: {
      deep: true,
      handler() {
        this.receipt.approved = false;
        localStorage.setItem('jp_cart', JSON.stringify(this.cart));
      },
    },
    customer: {
      deep: true,
      handler() {
        localStorage.setItem('jp_customer', JSON.stringify(this.customer));
      },
    },
    cartDiscount: {
      deep: true,
      handler() {
        this.receipt.approved = false;
        localStorage.setItem('jp_cart_disc', JSON.stringify(this.cartDiscount));

        // preset senkronu: sadece %5/10/15/20 ise preset açık kalsın
        const v = (this.cartDiscount?.type === 'pct') ? Number(this.cartDiscount.value || 0) : null;
        const allowed = [5, 10, 15, 20];
        const preset = allowed.includes(v) ? v : null;
        if (this.selectedDiscount !== preset) this.selectedDiscount = preset;
      },
    },
    selectedDiscount(val) {
      if (val === null || val === undefined) {
        // preset kapandıysa cartDiscount'ı bozma; sadece presetten gelmişse sıfırla
        if (['pct', null].includes(this.cartDiscount.type)) this.cartDiscount = { type: null, value: 0 };
      } else {
        this.cartDiscount = { type: 'pct', value: Number(val) || 0 };
      }
    },
  },

  beforeDestroy() { this.stopBarcodeScanner(); },

  methods: {
    // ------- Tema -------
    setAccent(c) { this.accent = c; localStorage.setItem('jp_accent', c); },
    cycleTheme() { this.$vuetify.theme.dark = !this.$vuetify.theme.dark; },

    // ------- DB -------
    async loadDb() {
      try {
        const cached = JSON.parse(localStorage.getItem('db_runtime') || 'null');
        if (cached && cached.products) { this.hydrateFromDb(cached); return; }
        const res = await fetch('/database.txt', { cache: 'no-store' });
        const json = await res.json();
        this.hydrateFromDb(json);
        localStorage.setItem('db_runtime', JSON.stringify(json));
      } catch (e) {
        console.error('DB yüklenemedi:', e);
        this.toast('database.txt okunamadı', 'red');
        this.products = [];
        this.platforms = ['Mağaza', 'Web', 'Instagram'];
      }
    },
    hydrateFromDb(db) {
      this.settings = db.settings || this.settings;
      this.platforms = db.platforms || ['Mağaza'];
      this.products = (db.products || []).map(p => ({ ...p, stok: Number(p.stok ?? p.stock ?? 0) }));
    },
    async reloadDb() { localStorage.removeItem('db_runtime'); await this.loadDb(); this.toast('Veriler yenilendi'); },

    // ------- Barkod Okuyucu -------
    async openBarcodeScanner() {
      this.barcodeScannerOpen = true; this.scanning = true; this.scanError = '';
      const config = {
        inputStream: { name:'Live', type:'LiveStream', target: document.querySelector('#interactive'),
          constraints: { width:{min:640}, height:{min:480}, facingMode:'environment', aspectRatio:{min:1, max:2} } },
        decoder: { readers: ['ean_reader','code_128_reader','ean_8_reader','code_39_reader'] },
      };
      try { await Quagga.init(config); Quagga.start(); Quagga.onDetected(this.onBarcodeDetected); }
      catch (err) { this.scanning = false; this.scanError = `Barkod okuyucu başlatılamadı: ${err.message}`; this.toast('Kamera erişimi reddedildi veya bulunamadı.', 'red'); }
    },
    stopBarcodeScanner() { if (this.scanning) { Quagga.stop(); this.scanning = false; this.barcodeScannerOpen = false; } },
    onBarcodeDetected(data) { if (data && data.codeResult) { this.query = data.codeResult.code; this.handleEnter(); this.stopBarcodeScanner(); } },

    // ------- Arama & Barkod -------
    focusScan() { this.$nextTick(() => this.$refs.scanInput && this.$refs.scanInput.focus()); },
    chipColor(p) { const v = Number(p.stok ?? p.stock ?? 0); if (v <= 0) return 'red darken-1'; if (v <= 5) return 'orange darken-1'; return 'green darken-1'; },
    onQueryInput() { const t = (this.query || '').trim(); this.suggestOpen = !!t; },
    handleEnter() {
      const q = (this.query || '').trim();
      if (!q) { this.suggestOpen = false; return; }
      let p = this.products.find(x => String(x.barcode || '') === q)
          || this.products.find(x => String(x.sku || '').toLowerCase() === q.toLowerCase())
          || this.products.find(x => String(x.id) === q);
      if (!p) {
        const m = this.products.filter(x => (x.isim || x.name || '').toLowerCase().includes(q.toLowerCase()));
        if (m.length === 1) p = m[0];
      }
      if (p) { this.addByProduct(p); this.query = ''; this.suggestOpen = false; return; }
      this.toast('Ürün bulunamadı, listeden seç.', 'orange'); this.suggestOpen = true;
    },

    addById(id) {
      const p = this.products.find(x => String(x.id) === String(id));
      if (!p) return this.toast('Ürün yok', 'red');
      this.addByProduct(p); this.query = ''; this.suggestOpen = false; this.focusScan();
    },
    addByProduct(p) {
      const stok = Number(p.stok ?? p.stock ?? 0);
      if (stok <= 0) return this.toast('Stok yok!', 'red');
      const base = this.calcPrice(p);
      this.cart.push({
        key: this.newKey(),
        id: p.id,
        sku: p.sku,
        isim: p.isim || p.name,
        img: p.img || null,
        type: p.type,
        karat: p.karat,
        ayar: p.ayar,
        qty: 1,
        vatPercent: Number(p.vatPercent ?? this.settings.defaultVatPercent ?? 20),
        manual: false,
        manualUnit: null,
        discountType: null,
        discountValue: 0,
        note: '',
        stok,
        rnd: p.rounding || 'none',
        _priceGross: base.priceGross,
        _baseNet: base.baseNet,
      });
      this.receipt.approved = false;
    },

    // ------- Sepet hesapları -------
    calcPrice(p) {
      const baseNet = Number(p.cost || 0) + Number(p.extras || 0);
      const vatP = Number(p.vatPercent ?? this.settings.defaultVatPercent ?? 20);
      const mode = p.pricingMode || 'markup';
      let priceNet;
      if (mode === 'markup') priceNet = baseNet * (1 + (Number(p.markupPercent || 0) / 100));
      else if (mode === 'profit') priceNet = baseNet + Number(p.profitTL || 0);
      else if (mode === 'target') priceNet = Number(p.targetPrice || 0) / (1 + vatP / 100);
      else priceNet = baseNet;

      let priceGross = priceNet * (1 + vatP / 100);
      priceGross = this.applyRounding(priceGross, p.rounding || 'none');
      return { priceGross, baseNet };
    },
    applyRounding(v, mode) {
      const x = Number(v || 0);
      if (mode === 'none' || !mode) return x;
      if (mode === 'to10') return Math.round(x / 10) * 10;
      if (mode === 'to100') return Math.round(x / 100) * 100;
      if (mode === 'to1000') return Math.round(x / 1000) * 1000;
      if (mode === 'end_990') {
        const n = Math.round(x / 10) * 10;
        const th = Math.floor(n / 1000);
        let cand = th * 1000 + 990;
        if (cand < n) cand += 1000;
        return cand;
      }
      return x;
    },

    lineUnitGross(l) {
      const base = l.manual ? Number(l.manualUnit || 0) : Number(l._priceGross || 0);
      let u = base;
      if (l.discountType === 'pct') u = Math.max(0, u * (1 - Number(l.discountValue || 0) / 100));
      if (l.discountType === 'tl')  u = Math.max(0, u - Number(l.discountValue || 0));
      return this.applyRounding(u, l.rnd || 'none');
    },
    preDiscountUnitGross(l) { return Number(l.manual ? (l.manualUnit || 0) : (l._priceGross || 0)); },
    lineDiscountAmountGross(l) {
      const diff = Math.max(0, this.preDiscountUnitGross(l) - this.lineUnitGross(l));
      return diff * (Number(l.qty) || 1);
    },
    lineGross(l) { return this.lineUnitGross(l) * (Number(l.qty) || 1); },
    lineNet(l) {
      const vat = Number(l.vatPercent ?? this.settings.defaultVatPercent ?? 20);
      return this.lineGross(l) / (1 + vat / 100);
    },
    lineVAT(l) { return this.lineGross(l) - this.lineNet(l); },
    lineProfitRaw(l) {
      const unitNet = this.lineUnitGross(l) / (1 + Number(l.vatPercent || 0) / 100);
      return Math.max(0, (unitNet - Number(l._baseNet || 0))) * (Number(l.qty) || 1);
    },
    aggregatedQty(pid) { return this.cart.filter(x => String(x.id) === String(pid)).reduce((t, x) => t + Number(x.qty || 0), 0); },

    // ------- Sepet işlemleri -------
    duplicateLine(i) { const c = { ...JSON.parse(JSON.stringify(this.cart[i])), key: this.newKey() }; this.cart.splice(i + 1, 0, c); },
    removeLine(i) { this.cart.splice(i, 1); this.receipt.approved = false; },
    incQty(i) {
      const l = this.cart[i];
      const toplam = this.aggregatedQty(l.id);
      const kalan = (Number(l.stok || 0) - toplam);
      if (kalan <= 0) return this.toast('Stok yetersiz', 'red');
      l.qty = Number(l.qty || 0) + 1; this.receipt.approved = false;
    },
    decQty(i) { const l = this.cart[i]; l.qty = Math.max(1, Number(l.qty || 1) - 1); this.receipt.approved = false; },
    setQty(i, val) {
      const l = this.cart[i];
      let q = Math.max(1, Number(val) || 1);
      const others = this.cart.filter((x, idx) => idx !== i && String(x.id) === String(l.id)).reduce((t, x) => t + Number(x.qty || 0), 0);
      const maxAllowed = Math.max(1, Number(l.stok || 0) - others);
      if (q > maxAllowed) { q = maxAllowed; this.toast('Stok sınırı aşıldı, ayarlandı', 'orange'); }
      l.qty = q; this.receipt.approved = false;
    },
    clearCart() { this.cart = []; this.cartDiscount = { type: null, value: 0 }; this.selectedDiscount = null; this.receipt.approved = false; },

    // ------- 3 Nokta menü aksiyonları -------
    openEdit(i) {
      const l = this.cart[i];
      this.edit = { open: true, idx: i, temp: { manual: !!l.manual, manualUnit: l.manualUnit, discountType: l.discountType, discountValue: l.discountValue } };
    },
    saveEdit() {
      const i = this.edit.idx; if (i === null || i === undefined) return;
      Object.assign(this.cart[i], this.edit.temp);
      this.receipt.approved = false;
      this.edit.open = false;
    },
    setLineDiscount(i, pct) {
      const l = this.cart[i];
      l.discountType = 'pct'; l.discountValue = pct;
      this.receipt.approved = false;
    },
    clearLineDiscount(i) {
      const l = this.cart[i];
      l.discountType = null; l.discountValue = 0;
      this.receipt.approved = false;
    },

    // ------- Onay / Yazdır -------
    approveSale() {
      if (this.cart.length === 0) return;

      // agregeli stok kontrolü
      const need = {};
      this.cart.forEach(l => { need[l.id] = (need[l.id] || 0) + Number(l.qty || 0); });
      for (const pid in need) {
        const p = this.products.find(x => String(x.id) === String(pid));
        const stok = Number(p?.stok ?? p?.stock ?? 0);
        if (need[pid] > stok) return this.toast(`#${p?.sku || pid} için stok yetersiz (kalan: ${stok})`, 'red');
      }

      const d = new Date(), pad = x => String(x).padStart(2, '0');
      const no = `S-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
      this.receipt.no = no;
      this.receipt.date = d.toLocaleString('tr-TR');
      this.receipt.lines = this.cart.map(x => ({ ...x }));
      this.receipt.approved = true;
      this.toast('Sepet fişe yazıldı', 'green');

      // Not: Stok düşümü burada yapılmıyor (ERP entegrasyon noktası).
    },
    printFis() { this.$nextTick(() => window.print()); },
    resetSale() {
      this.cart = [];
      this.cartDiscount = { type: null, value: 0 };
      this.selectedDiscount = null;
      this.receipt = { approved: false, no: '', date: '', lines: [] };
      this.query = '';
      this.focusScan();
    },

    // ------- Müşteri -------
    fixName() {
      const t = (this.customer.name || '').trim().replace(/\s+/g, ' ');
      if (!t) return;
      this.customer.name = t.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    },

    // ------- Utils -------
    tl(n) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: this.settings.currency || 'TRY' }).format(Number(n) || 0); },
    toast(t, c = 'green') { this.snack = { show: true, color: c, text: t }; },
    newKey() { return `${Date.now()}_${Math.floor(Math.random() * 10000)}`; },
  },
};
</script>

<style scoped>
/* başlıkta isim + fiyat yan yana */
.title-row{
  display:grid;
  grid-template-columns: 1fr auto;
  align-items:center;
  gap:12px;
}
.sum-inline{ text-align:right; }
.truncate{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* GENEL KART */
.soft-card {
  border: 1px solid var(--card-border, rgba(0, 0, 0, 0.08));
  border-radius: 16px;
  background: var(--card-bg, rgba(255, 255, 255, 0.78));
  backdrop-filter: blur(8px) saturate(120%);
  transition: box-shadow 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
}
.soft-card:hover { box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12); transform: translateY(-1px); }
.theme--dark .soft-card { border-color: rgba(255, 255, 255, 0.12); background: rgb(28, 30, 37); }

/* Drawer */
.elevated-drawer {
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

/* Hero */
.hero { position: relative; height: 120px; overflow: hidden; border-bottom: 1px solid rgba(0, 0, 0, 0.04); }
.theme--light .hero { background: linear-gradient(180deg, #ffffff, #fafafa); }
.theme--dark .hero { background: linear-gradient(180deg, #0f1115, #0a0c10); }
.hero-glow {
  position: absolute; inset: -30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99, 102, 241, .55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation: float 16s ease-in-out infinite; filter: blur(42px); opacity: .55;
}
.theme--dark .hero-glow { opacity: .35; }
.hero-content { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 12px 24px; }
.hero-title { margin: 0; font-weight: 800; letter-spacing: .2px; }
.hero-sub { opacity: .8; }

/* Sticky */
.sticky-col { position: sticky; top: 84px; }

/* Sepet */
.cart-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.cart-item { padding: 16px; }
.item-header { display: flex; align-items: center; }
.item-body { margin-top: 8px; gap: 16px; }
.sum-section .headline { color: var(--v-primary-base, #1976d2); }
.price-section .subtitle-1 { color: var(--v-primary-base, #1976d2); }

.qty-section { width: 160px; justify-content: flex-start; }
.qty-input {
  width: 64px; text-align: center; border: 1px solid rgba(0,0,0,.12); border-radius: 10px;
  padding: 4px 6px; background: transparent; color: inherit; margin: 0 6px;
}
.theme--dark .qty-input { border-color: rgba(255,255,255,.16); }
.muted { opacity: .65; }

/* Kamera pop-up'ı */
.viewport { width: 100%; height: 300px; overflow: hidden; }
.viewport canvas, .viewport video { width: 100% !important; height: auto !important; transform: none !important; }

/* Segmented (fişte) */
.seg {
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 12px;
  padding: 2px;
  background: transparent;
}
.theme--dark .seg { border-color: rgba(255,255,255,.16); }
.seg .v-btn { min-width: 44px; border-radius: 10px !important; }

/* Anim */
@keyframes float { 0%{transform:translate3d(0,0,0) rotate(0)} 50%{transform:translate3d(2%,-2%,0) rotate(1deg)} 100%{transform:translate3d(0,0,0) rotate(0)} }

/* Sadece fişi yazdır */
@media print {
  @page { size: auto; margin: 8mm; }
  html, body { background: #fff !important; }
  body * { visibility: hidden !important; }
  #fisPrint, #fisPrint * { visibility: visible !important; }
  #fisPrint {
    position: absolute !important; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 0 !important;
    background: #fff !important; color: #000 !important; box-shadow: none !important; border: 0 !important;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  #fisPrint .v-card__actions { display: none !important; }
}

/* Tema değişkenleri */
.theme--light { --card-border: rgba(0,0,0,.08); --card-bg: rgb(254, 255, 255); --v-primary-base: #1976d2; }
.theme--dark  { --card-border: rgba(255,255,255,.12); --card-bg: rgba(26,26,26,.72); --v-primary-base: #5865f2; }
</style>
