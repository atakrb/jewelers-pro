<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
    <!-- SOL YAN MENÜ (aynı) -->
    <v-navigation-drawer
        v-model="drawer"
        :mini-variant.sync="mini"
        :permanent="$vuetify.breakpoint.lgAndUp"
        expand-on-hover app width="280" class="elevated-drawer"
    >
      <v-list dense>
        <v-list-item two-line class="mb-1">
          <v-list-item-avatar size="30"><v-icon color="white">mdi-diamond-stone</v-icon></v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">Jewelers Pro</v-list-item-title>
            <v-list-item-subtitle>Mağaza Paneli</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="mb-2" />

        <v-list-item v-for="it in drawerItems" :key="it.to" :to="{ name: it.to }" link exact class="rounded-lg">
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

        <v-list-item :to="{ name:'urunler' }" class="rounded-lg" link>
          <v-list-item-icon><v-icon>mdi-plus</v-icon></v-list-item-icon>
          <v-list-item-title>Yeni Sipariş Ekle</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- HERO -->
    <div class="hero">
      <div class="hero-glow"></div>
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

            <!-- Kategori filtre -->
            <v-col cols="6" md="3">
              <v-select
                  v-model="filters.categoryId"
                  :menu-props="{offsetY:true}"
                  :items="categories.map(c=>({text:c.name,value:c.id}))"
                  dense outlined clearable label="Kategori"
              />
            </v-col>

            <v-col cols="6" md="2">
              <v-select v-model="filters.supplierId" :items="suppliers.map(s=>({text:s.name,value:s.id}))" dense outlined clearable label="Toptancı"/>
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
          <!-- Kapak görseli -->
          <template v-slot:item.cover="{ item }">
            <div class="cover-thumb" v-if="item.images && item.images.length">
              <img :src="item.images[item.coverIndex || 0]" alt="cover">
            </div>
            <div class="cover-thumb cover-empty" v-else>
              <v-icon color="grey">mdi-image-off</v-icon>
            </div>
          </template>

          <template v-slot:item.category="{ item }">{{ categoryName(item.categoryId) }}</template>
          <template v-slot:item.supplier="{ item }">{{ supplierName(item.supplierId) }}</template>
          <template v-slot:item.stock="{ item }">
            <v-chip small :color="item.stock<=0 ? 'red' : item.stock<=5 ? 'orange' : 'green'" text-color="white">
              {{ item.stock }}
            </v-chip>
          </template>

          <!-- OPS -->
          <template v-slot:item.ops="{ item }">
            <v-btn icon small @click="decStock(item)"><v-icon small>mdi-minus</v-icon></v-btn>
            <v-btn icon small @click="incStock(item)"><v-icon small>mdi-plus</v-icon></v-btn>
            <v-btn icon small @click="openProductDialog(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon small @click="removeProduct(item)"><v-icon small>mdi-delete</v-icon></v-btn>
          </template>

          <template v-slot:footer.prepend>
            <div class="px-4 py-2">
              <v-chip small class="mr-2">Ürün: {{ filteredProducts.length }}</v-chip>
              <v-chip small class="mr-2" color="teal" text-color="white">Toplam Stok: {{ totalStock }}</v-chip>
              <v-chip small color="deep-purple" text-color="white">Stok Değeri (Geliş): {{ tl(stockValueCost) }}</v-chip>
            </div>
          </template>
        </v-data-table>
      </div>
    </v-container>

    <!-- ============== YENİ ÜRÜN DİYALOĞU ============== -->
    <v-dialog v-model="dialogs.product" max-width="1024px" persistent>
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ productForm.id ? 'Ürün Düzenle' : 'Yeni Ürün' }}
          <v-spacer/>
          <v-chip x-small v-if="!hasCover" color="red" text-color="white">Kapak görseli zorunlu</v-chip>
        </v-card-title>

        <v-card-text>
          <!-- Sekmeler: Medya | Temel Bilgi | Fiyat | Kurlar -->
          <v-tabs v-model="tabs" background-color="transparent" grow>
            <v-tab>Medya</v-tab>
            <v-tab>Temel Bilgi</v-tab>
            <v-tab>Fiyat</v-tab>
            <!--<v-tab>Kurlar</v-tab>-->
          </v-tabs>

          <v-tabs-items v-model="tabs">
            <!-- MEDYA -->
            <v-tab-item>
              <v-card flat class="mt-3">
                <v-row dense>
                  <v-col cols="12">
                    <div class="images-grid">
                      <div
                          v-for="(src, idx) in productForm.images"
                          :key="idx"
                          class="img-cell"
                          :class="{ cover: productForm.coverIndex === idx }"
                          @click="productForm.coverIndex = idx"
                          title="Kapak olarak ayarla"
                      >
                        <img :src="src" alt="img"/>
                        <div class="img-tools">
                          <v-btn x-small icon @click.stop="removeImage(idx)"><v-icon small color="red">mdi-close</v-icon></v-btn>
                          <v-chip x-small color="indigo" text-color="white" v-if="productForm.coverIndex === idx">KAPAK</v-chip>
                        </div>
                      </div>

                      <label class="img-upload">
                        <input type="file" multiple accept="image/*" @change="onImagesPicked($event)" />
                        <div class="up-inner">
                          <v-icon large>mdi-plus</v-icon>
                          <div class="caption">Görsel ekle</div>
                        </div>
                      </label>
                    </div>
                  </v-col>

                  <v-col cols="12" class="mt-1">
                    <div class="caption grey--text">
                      En az <b>1</b> görsel zorunlu. Tıklayınca <b>kapak</b> olur.
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-tab-item>

            <!-- TEMEL BİLGİ -->
            <v-tab-item>
              <v-card flat class="mt-3">
                <v-row dense>
                  <v-col cols="12" md="5">
                    <v-text-field v-model="productForm.name" dense outlined label="Ürün Adı" required/>
                  </v-col>

                  <v-col cols="6" md="3">
                    <v-select
                        v-model="productForm.categoryId"
                        :menu-props="{offsetY:true}"
                        :items="categories.map(c=>({text:c.name,value:c.id}))"
                        dense outlined label="Kategori" :rules="[v=>!!v || 'Zorunlu']" required
                        @change="refreshSizesByCategory"
                    />
                  </v-col>

                  <v-col cols="6" md="4">
                    <v-select
                        v-model="productForm.supplierId"
                        :items="suppliers.map(s=>({text:s.name,value:s.id}))"
                        dense outlined label="Toptancı" :rules="[v=>!!v || 'Zorunlu']" required
                    />
                  </v-col>
                </v-row>

                <v-row dense>
                  <v-col cols="12" md="8">
                    <!-- ================== RENK DROPDOWN (YENİ) ================== -->
                    <div class="subtitle-2 mb-1 font-weight-bold">Renk(ler)</div>

                    <v-row dense class="align-start">
                      <v-col cols="12" md="6">
                        <v-select
                            v-model="colorSelection"
                            :items="jewelryColors"
                            item-text="label"
                            item-value="value"
                            multiple
                            dense
                            outlined
                            clearable
                            label="Renk seç (çoklu)"
                            :menu-props="{ offsetY:true, maxHeight: 320 }"
                            class="no-chip-select"
                        >
                          <!-- liste satırı -->
                          <template v-slot:item="{ item, on, attrs }">
                            <v-list-item v-bind="attrs" v-on="on">
                              <div class="swatch-square mr-3" :style="{ background:item.code }"></div>
                              <v-list-item-content>
                                <v-list-item-title>{{ item.label }}</v-list-item-title>
                                <v-list-item-subtitle class="caption">{{ item.code }}</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-spacer />
                              <v-icon small v-if="colorSelection.includes(item.value)">mdi-check</v-icon>
                            </v-list-item>
                          </template>

                          <!-- sadece ilk seçimde özet göster -->
                          <template v-slot:selection="{ index }">
    <span v-if="index === 0" class="caption grey--text ml-2">
      {{ colorSelection.length }} renk seçildi
    </span>
                          </template>
                        </v-select>


                      </v-col>

                      <!-- Sağ önizleme -->
                      <v-col cols="12" md="6" class="d-flex flex-wrap align-center">
                        <div
                            v-for="sel in colorSelectionObjs"
                            :key="sel.value"
                            class="swatch-row mr-2 mb-2"
                        >
                          <div class="swatch-square mr-2" :style="{ background: sel.code }"></div>
                          <div class="swatch-label">{{ sel.label }}</div>
                        </div>
                      </v-col>
                    </v-row>
                    <!-- ================== /RENK DROPDOWN (YENİ) ================== -->
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field v-model="productForm.ayar" dense outlined label="Ayar (opsiyonel)"/>
                    <v-text-field v-model="productForm.sku" dense outlined label="SKU / Kod (boşsa üretilecek)"/>
                    <v-text-field v-model="productForm.barcode" dense outlined label="Barkod (boşsa üretilecek)"/>
                  </v-col>
                </v-row>

                <!-- Adet / Gram seçimi -->
                <v-row dense class="mt-1 mb-2">
                  <v-col cols="12" md="6">
                    <v-btn-toggle v-model="productForm.measureMode" mandatory class="seg">
                      <v-btn :value="'adet'">Adet</v-btn>
                      <v-btn :value="'gram'">Gram</v-btn>
                    </v-btn-toggle>
                  </v-col>

                  <!-- Bedenli (opsiyonel) -->
                  <v-col cols="12" md="6" class="d-flex align-center justify-end">
                    <v-switch v-model="productForm.hasSizes" inset label="Bedenli ürün?" class="mr-2"/>
                    <v-btn small :disabled="!productForm.hasSizes" @click="openSizePlanner">
                      <v-icon left small>mdi-ruler</v-icon> Beden Planlayıcı
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- Adet -->
                <v-expand-transition>
                  <div v-show="productForm.measureMode==='adet'">
                    <v-row dense>
                      <v-col cols="6" md="2">
                        <v-text-field v-model.number="adetForm.qty" type="number" min="0" dense outlined label="Adet"/>
                      </v-col>

                      <v-col cols="6" md="3">
                        <v-text-field
                            v-model.number="adetForm.unitCost" type="number" min="0" step="0.01"
                            dense outlined :label="`Geliş Birim (${adetForm.currency})`"
                            :hint="`≈ ${tl(toTRY(adetForm.unitCost, adetForm.currency))} / adet`" persistent-hint
                        />
                      </v-col>

                      <v-col cols="6" md="3">
                        <v-text-field
                            v-model.number="adetForm.extras" type="number" min="0" step="0.01"
                            dense outlined :label="`Ekstralar Birim (${adetForm.currency})`"
                            :hint="`≈ ${tl(toTRY(adetForm.extras, adetForm.currency))} / adet`" persistent-hint
                        />
                      </v-col>

                      <v-col cols="6" md="2">
                        <v-select v-model="adetForm.currency" :items="currencies" dense outlined label="Para Birimi"/>
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>

                <!-- Gram -->
                <v-expand-transition>
                  <div v-show="productForm.measureMode==='gram'">
                    <v-row dense>
                      <v-col cols="6" md="2">
                        <v-text-field v-model.number="gramForm.grams" type="number" min="0" step="0.01"
                                      dense outlined label="Kaç gr"
                                      :hint="gramForm.grams ? `${gramForm.grams} gr` : ''" persistent-hint
                        />
                      </v-col>

                      <v-col cols="6" md="3">
                        <v-text-field
                            v-model.number="gramForm.pricePerGram" type="number" min="0" step="0.01"
                            dense outlined :label="`Geliş gr fiyatı (${gramForm.currency})`"
                            :hint="`≈ ${tl(toTRY(gramForm.pricePerGram, gramForm.currency))} / gr`" persistent-hint
                        />
                      </v-col>

                      <v-col cols="6" md="3">
                        <v-text-field
                            v-model.number="gramForm.extras" type="number" min="0" step="0.01"
                            dense outlined :label="`Ekstralar (${gramForm.currency})`"
                            :hint="`≈ ${tl(toTRY(gramForm.extras, gramForm.currency))}`" persistent-hint
                        />
                      </v-col>

                      <v-col cols="6" md="2">
                        <v-select v-model="gramForm.currency" :items="currencies" dense outlined label="Para Birimi"/>
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-tab-item>

            <!-- FİYAT -->
            <v-tab-item>
              <v-card flat class="mt-3">
                <v-row dense>
                  <v-col cols="12" md="3">
                    <v-select
                        v-model="productForm.pricingMode"
                        :items="pricingModes"
                        dense outlined label="Fiyatlandırma Modu"
                    />
                  </v-col>

                  <v-col cols="6" md="3" v-if="productForm.pricingMode==='markup'">
                    <v-text-field v-model.number="productForm.markupPercent" type="number" min="0" step="0.1" dense outlined label="Kâr % (Markup)"/>
                  </v-col>

                  <v-col cols="6" md="2" v-if="productForm.pricingMode==='profit'">
                    <v-text-field v-model.number="productForm.profitTL" type="number" min="0" step="0.01" dense outlined label="Kâr (TL)"/>
                  </v-col>

                  <v-col cols="6" md="2" v-if="productForm.pricingMode==='target'">
                    <v-text-field v-model.number="productForm.targetPrice" type="number" min="0" step="0.01" dense outlined label="Hedef Fiyat (KDV Dahil)"/>
                  </v-col>

                  <v-col cols="6" md="2">
                    <v-text-field v-model.number="productForm.vatPercent" type="number" min="0" dense outlined label="KDV %"/>
                  </v-col>
                  <v-col cols="6" md="2" class="align-center">
                    <v-checkbox v-model="productForm.vatIncluded" hide-details label="Hesapta KDV dahil"/>
                  </v-col>

                  <v-col cols="12" md="2">
                    <v-select
                        v-model="productForm.rounding"
                        :items="roundingOptions"
                        dense outlined label="Yuvarlama"
                    />
                  </v-col>
                </v-row>

                <!-- ÖNİZLEME -->
                <v-card outlined flat class="soft-card">
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <v-simple-table dense>
                        <tbody>
                        <tr><td>Baz Maliyet (TRY)</td><td class="text-right">{{ tl(preview.base) }}</td></tr>
                        <tr><td>Net Fiyat</td><td class="text-right">{{ tl(preview.priceNet) }}</td></tr>
                        <tr><td>KDV Dahil</td><td class="text-right font-weight-bold">{{ tl(preview.priceGross) }}</td></tr>
                        </tbody>
                      </v-simple-table>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-simple-table dense>
                        <tbody>
                        <tr><td>Kâr (TL)</td><td class="text-right">{{ tl(preview.profitTL) }}</td></tr>
                        <tr><td>Kâr %</td><td class="text-right">{{ pct(preview.profitPct) }}</td></tr>
                        <tr><td>Yuvarlama</td><td class="text-right">{{ productForm.rounding }}</td></tr>
                        </tbody>
                      </v-simple-table>
                    </v-col>
                  </v-row>
                </v-card>

                <!-- KURLAR ÖZET KUTUSU -->
                <v-alert class="mt-5" border="left" colored-border outlined type="info" elevation="1">
                  <div class="d-flex align-center">
                    <div class="mr-4">Kullanılan kurlar (1 birim ≈ TRY):</div>
                    <div class="mr-3" v-for="c in currencies" :key="c">
                      <b>{{ c }}</b>: <span>{{ fxDisplay(c) }}</span>
                    </div>
                    <v-spacer />
                    <v-btn x-small text :loading="fxLoading" @click="fetchFxRates">
                      <v-icon left x-small>mdi-refresh</v-icon> Güncelle
                    </v-btn>
                  </div>
                  <div class="caption grey--text mt-1">
                    Son güncelleme: {{ fxUpdatedAt ? new Date(fxUpdatedAt).toLocaleString() : '—' }}
                    <span v-if="fxError" class="red--text ml-2">({{ fxError }})</span>
                  </div>
                </v-alert>
              </v-card>
            </v-tab-item>

            <!-- KURLAR (opsiyonel sekme devre dışı) -->
          </v-tabs-items>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="closeProductDialog">Vazgeç</v-btn>
          <v-spacer/>
          <v-btn :color="accent" dark :disabled="!canSaveProduct || !hasCover || !sizesOk" @click="saveProduct">
            <v-icon left>mdi-content-save</v-icon> Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- BEDEN PLANLAYICI -->
    <v-dialog v-model="dialogs.sizePlanner" max-width="620px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          Beden Planlayıcı — {{ categoryName(productForm.categoryId) || 'Kategori' }}
        </v-card-title>
        <v-card-text>
          <div class="caption grey--text mb-2">Toplam adet: <b>{{ Number(adetForm.qty||0) }}</b></div>
          <v-simple-table dense>
            <thead>
            <tr><th>Beden</th><th class="text-right" style="width:140px">Adet</th></tr>
            </thead>
            <tbody>
            <tr v-for="s in productForm.sizeOptions" :key="s">
              <td>{{ s }}</td>
              <td class="text-right">
                <v-text-field
                    v-model.number="sizeQty[s]"
                    type="number" min="0" dense hide-details style="max-width:120px" class="ml-auto"
                />
              </td>
            </tr>
            </tbody>
          </v-simple-table>
          <div class="mt-2 caption" :class="sizesOk ? 'green--text' : 'red--text'">
            Dağıtılan toplam: <b>{{ sizeSum }}</b> — {{ sizesOk ? 'Uygun' : 'Toplam adet ile eşleşmiyor' }}
          </div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer/>
          <v-btn color="primary" dark @click="dialogs.sizePlanner=false">Tamam</v-btn>
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
      /* Tema & Drawer */
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
        { key:'N', icon:'mdi-plus',           title:'Yeni Ürün',  subtitle:'Hızlı ekle',     click:()=>this.openProductDialog() },
        { key:'S', icon:'mdi-filter-check',   title:'Stokta',     subtitle:'Sadece stokta',  click:()=>this.filters.inStockOnly = !this.filters.inStockOnly },
        { key:'C', icon:'mdi-file-delimited', title:'CSV',        subtitle:'Dışa aktar',     click:()=>this.exportCSV() },
        { key:'P', icon:'mdi-printer',        title:'Yazdır',     subtitle:'Ürün tablosu',   click:()=>this.yazdir() },
      ],

      /* Referanslar & Ürünler */
      categories: [], suppliers: [], products: [],

      /* Döviz (fallback + canlı) */
      fxFallback: { TRY:1, USD:33, EUR:36, GBP:42, CHF:37 },
      fx: { TRY:1 },
      fxUpdatedAt: null,
      fxLoading: false,
      fxError: null,
      currencies: ['TRY','USD','EUR','GBP','CHF'],
      fxCalc: { amount: 100, currency: 'USD' },

      /* Tablo başlıkları */
      headers: [
        { text: "", value: "cover", width: 56, sortable:false },
        { text: "ID", value: "id", width: 100 },
        { text: "Ürün", value: "name", width: 220 },
        { text: "Kategori", value: "category", width: 160 },
        { text: "Toptancı", value: "supplier", width: 160 },
        { text: "Stok", value: "stock", width: 80, align: "end" },
        { text: "Barkod", value: "barcode", width: 140 },
        { text: "", value: "ops", sortable: false, width: 150, align: "end" },
      ],

      /* Filtreler */
      filters: { q:"", categoryId:null, supplierId:null, ayar:"", karat:null, minGram:null, maxGram:null, inStockOnly:false },

      /* Dialoglar */
      dialogs: { product:false, sizePlanner:false },

      /* Yeni ürün formu */
      productForm: null,
      tabs: 0,

      /* Takı renkleri (dropdown) */
      jewelryColors: [
        { label:'Sarı Altın',  value:'Sarı Altın',  code:'#FFD54F' },
        { label:'Beyaz Altın', value:'Beyaz Altın', code:'#ECEFF1' },
        { label:'Rose Altın',  value:'Rose Altın',  code:'#EFB5A2' },
        { label:'Gümüş',       value:'Gümüş',       code:'#C0C0C0' },
        { label:'Siyah',       value:'Siyah',       code:'#111111' },
        { label:'Platin',      value:'Platin',      code:'#E5E4E2' },
        { label:'Bronz',       value:'Bronz',       code:'#CD7F32' },
        { label:'Bakır',       value:'Bakır',       code:'#B87333' },
        { label:'Yeşil Altın', value:'Yeşil Altın', code:'#C1B24D' },
        { label:'Rodyum',      value:'Rodyum',      code:'#D6D6D6' }
      ],

      /* Adet/Gram alt formlar */
      adetForm: { qty:0, unitCost:0, extras:0, currency:'TRY' },
      gramForm: { grams:0, pricePerGram:0, extras:0, currency:'TRY' },

      /* Beden dağılımı */
      sizeQty: {},

      /* Fiyatlandırma */
      pricingModes: [
        { text: "Kâr % (Markup)", value: "markup" },
        { text: "Kâr TL", value: "profit" },
        { text: "Hedef Fiyat", value: "target" },
      ],
      roundingOptions: ["none","to10","to100","to1000","end_990"],

      /* Snackbar */
      snack: { show:false, color:"green", text:"" },

      /* İç timer */
      _fxTimer: null,
    }
  },

  created(){
    try{
      const cats = get('categories') || [];
      const sups = get('suppliers')  || [];
      const prods= get('products')   || [];

      this.categories = cats.map(c => ({ id:c.id, name:c.name, description:c.description || "" }));
      this.suppliers  = sups.map(s => ({ id:s.id, name:s.name }));
      this.products   = prods.map(this.normalizeDbProduct);

      const ro = get('settings.roundingOptions');
      if(Array.isArray(ro) && ro.length) this.roundingOptions = ro;
    }catch(e){
      console.error('ürünler yüklenemedi:', e);
      this.categories = []; this.suppliers = []; this.products = [];
    }

    this.productForm = this.emptyForm();
  },

  mounted(){
    this.fetchFxRates();
    this._fxTimer = setInterval(this.fetchFxRates, 10*60*1000);
  },
  beforeDestroy(){
    if(this._fxTimer) clearInterval(this._fxTimer);
  },

  computed:{
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },

    filteredProducts(){
      const f=this.filters; const q=(f.q||'').toLowerCase().trim();
      return (this.products||[]).filter(p=>{
        const txt=[p.name,p.barcode,p.sku,p.ayar,p.color,p.tags,p.size].join(' ').toLowerCase();
        const passQ=q?txt.includes(q):true;
        const passCat=f.categoryId? p.categoryId===f.categoryId : true;
        const passSup=f.supplierId? p.supplierId===f.supplierId : true;
        const passAyar=f.ayar? String(p.ayar).toLowerCase().includes(String(f.ayar).toLowerCase()):true;
        const passKarat=f.karat!=null && f.karat!=="" ? Number(p.karat)===Number(f.karat):true;
        const passMinG=f.minGram!=null && f.minGram!=="" ? Number(p.gram||0)>=Number(f.minGram):true;
        const passMaxG=f.maxGram!=null && f.maxGram!=="" ? Number(p.gram||0)<=Number(f.maxGram):true;
        const passStock=f.inStockOnly? Number(p.stock||0)>0 : true;
        return passQ && passCat && passSup && passAyar && passKarat && passMinG && passMaxG && passStock;
      });
    },

    totalStock(){ return this.filteredProducts.reduce((t,p)=>t+Number(p.stock||0),0); },
    stockValueCost(){ return this.filteredProducts.reduce((t,p)=>t + Number(p.stock||0)*(Number(p.cost||0)+Number(p.extras||0)),0); },

    hasCover(){ return Array.isArray(this.productForm?.images) && this.productForm.images.length>0; },

    preview(){
      const f=this.composeProductForPricing();
      return priceCalc(f);
    },

    sizeSum(){ return Object.values(this.sizeQty||{}).reduce((t,n)=> t+Number(n||0),0); },
    sizesOk(){
      if(!this.productForm.hasSizes) return true;
      if(this.productForm.measureMode!=='adet') return true;
      return this.sizeSum === Number(this.adetForm.qty || 0);
    },

    /* Renk dropdown binding */
    colorSelection: {
      get(){ return this.productForm?.colorOptions || []; },
      set(v){ this.productForm.colorOptions = Array.isArray(v) ? v : []; }
    },
    colorSelectionObjs(){
      const s = new Set(this.productForm?.colorOptions || []);
      return this.jewelryColors.filter(c => s.has(c.value));
    }
  },

  methods:{
    /* Tema */
    setAccent(c){ this.accent=c; localStorage.setItem('jp_accent',c); },
    cycleTheme(){ this.$vuetify.theme.dark=!this.$vuetify.theme.dark; },

    /* ---- DB Normalize ---- */
    normalizeDbProduct(p){
      const catId = Array.isArray(p.categoryIds)&&p.categoryIds.length ? p.categoryIds[0] : p.categoryId || null;
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
        size: (Array.isArray(p.sizeOptions)&&p.sizeOptions.length?p.sizeOptions[0]:(p.size||"")),
        color: (Array.isArray(p.colorOptions)&&p.colorOptions.length?p.colorOptions[0]:(p.color||"")),
        colorOptions: p.colorOptions || (p.color?[p.color]:[]),
        sizeOptions: p.sizeOptions || (p.size?[p.size]:[]),
        images: p.images || [],
        coverIndex: p.coverIndex || 0,
        tags: p.tags || "",
        description: p.description || ""
      }
    },

    /* Boş form */
    emptyForm(){
      return {
        id:null, name:"", categoryId:null, supplierId:null, type:"",
        karat:null, ayar:"", gram:null,
        measureMode:'adet', hasSizes:false,
        stock:0, minStock:0,
        cost:0, extras:0, vatPercent:20, vatIncluded:true,
        pricingMode:'markup', markupPercent:0, profitTL:0, targetPrice:null, rounding:'none',
        barcode:"", sku:"",
        color:"", size:"",
        colorOptions:[], sizeOptions:[],
        images:[], coverIndex:0,
        tags:"", description:""
      }
    },

    /* ---------- KURLAR ---------- */
    async fetchFxRates(){
      try{
        this.fxLoading = true; this.fxError = null;
        const url = 'https://api.exchangerate.host/latest?base=TRY';
        const res = await fetch(url);
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const out = { TRY:1 };
        this.currencies.forEach(c=>{
          if(c==='TRY'){ out.TRY=1; return; }
          const perTRY = data.rates?.[c];
          if(perTRY && perTRY>0){
            out[c] = 1 / perTRY;
          }
        });
        Object.keys(this.fxFallback).forEach(c=>{
          if(out[c]==null) out[c] = this.fxFallback[c];
        });
        this.fx = out;
        this.fxUpdatedAt = Date.now();
      }catch(e){
        this.fxError = 'Kur servisine ulaşılamadı';
        this.fx = { ...this.fxFallback };
      }finally{
        this.fxLoading = false;
      }
    },
    fxRate(c){ return Number(this.fx?.[c] ?? this.fxFallback[c] ?? 1); },
    fxDisplay(c){
      const r = this.fxRate(c);
      return isFinite(r) ? r.toFixed(4) : '—';
    },
    invFxDisplay(c, tlAmount=100){
      const r = this.fxRate(c);
      if(!isFinite(r) || r<=0) return '—';
      const val = tlAmount / r;
      return `${val.toFixed(4)} ${c}`;
    },

    /* ---------- Hesap & Döviz ---------- */
    toTRY(val,curr){
      const v=Number(val||0);
      if(!isFinite(v)) return 0;
      if((curr||'').toUpperCase()==='TRY') return v;
      const rate = this.fxRate((curr||'').toUpperCase());
      return v*rate;
    },

    composeProductForPricing(){
      const f={...this.productForm};
      if(f.measureMode==='adet'){
        const costTRY  = this.toTRY(this.adetForm.unitCost, this.adetForm.currency);
        const extraTRY = this.toTRY(this.adetForm.extras,    this.adetForm.currency);
        f.cost   = costTRY;
        f.extras = extraTRY;
        f.stock  = Number(this.adetForm.qty||0);
        f.gram   = null;
      }else{
        const baseTRY  = this.toTRY(this.gramForm.pricePerGram, this.gramForm.currency) * Number(this.gramForm.grams||0);
        const extraTRY = this.toTRY(this.gramForm.extras,       this.gramForm.currency);
        f.cost   = baseTRY;
        f.extras = extraTRY;
        f.stock  = 1;
        f.gram   = Number(this.gramForm.grams||0);
      }
      f.color = f.colorOptions && f.colorOptions.length ? f.colorOptions[0] : '';
      f.size  = f.sizeOptions && f.sizeOptions.length ? f.sizeOptions[0]  : '';
      return f;
    },

    /* Görseller */
    onImagesPicked(e){
      const files = Array.from(e.target.files||[]);
      if(!files.length) return;
      files.forEach(file=>{
        const reader=new FileReader();
        reader.onload = () => { this.productForm.images.push(reader.result); if(this.productForm.images.length===1) this.productForm.coverIndex=0; };
        reader.readAsDataURL(file);
      });
      e.target.value=null;
    },
    removeImage(idx){
      this.productForm.images.splice(idx,1);
      if(this.productForm.coverIndex>=this.productForm.images.length) this.productForm.coverIndex=0;
    },

    /* Renk yardımcıları */
    removeColorByValue(val){
      const arr = this.productForm?.colorOptions || [];
      this.productForm.colorOptions = arr.filter(v => v !== val);
    },
    readableText(bg){
      try{
        const c = bg.startsWith('#') ? bg : '#ffffff';
        const r=parseInt(c.substr(1,2),16), g=parseInt(c.substr(3,2),16), b=parseInt(c.substr(5,2),16);
        const yiq=(r*299+g*587+b*114)/1000; return yiq>=140?'#111':'#fff';
      }catch{ return '#fff' }
    },

    /* Bedenler (opsiyonel) */
    openSizePlanner(){
      if(!this.productForm.hasSizes){ this.toast('Önce "Bedenli ürün" seçin.','orange'); return; }
      if(!this.productForm.categoryId){ this.toast('Kategori seçmeden beden listelenmez.','orange'); return; }
      if(!Array.isArray(this.productForm.sizeOptions) || this.productForm.sizeOptions.length===0){
        this.refreshSizesByCategory();
      }
      this.dialogs.sizePlanner=true;
    },
    refreshSizesByCategory(){
      const id=this.productForm.categoryId;
      const sizes=this.sizesForCategory(id);
      this.productForm.sizeOptions=sizes;
      const next={}; sizes.forEach(s=>{ next[s]=Number(this.sizeQty[s]||0) });
      this.sizeQty=next;
    },
    sizesForCategory(catId){
      const name=(this.categories.find(c=>c.id===catId)||{}).name || '';
      const n=name.toLowerCase();
      if(/yüzük|ring/.test(n)) return ['10','11','12','13','14','15','16','17','18','19','20'];
      if(/kolye|neck/.test(n)) return ['40 cm','45 cm','50 cm','55 cm'];
      if(/bileklik|brace/.test(n)) return ['XS','S','M','L','XL'];
      if(/küpe|ear/.test(n)) return ['Tek','Çift'];
      if(/set/.test(n)) return ['Standart'];
      return ['XS','S','M','L','XL'];
    },

    /* Tablo yardımcıları */
    categoryName(id){ return (this.categories.find(c=>c.id===id)||{}).name || "-"; },
    supplierName(id){ return (this.suppliers.find(s=>s.id===id)||{}).name || "-"; },
    resetFilters(){ this.filters = { q:"", categoryId:null, supplierId:null, ayar:"", karat:null, minGram:null, maxGram:null, inStockOnly:false }; },

    /* stok */
    incStock(p){ p.stock=Number(p.stock||0)+1; },
    decStock(p){ p.stock=Math.max(0,Number(p.stock||0)-1); },

    /* Dialog aç/kapat */
    openProductDialog(p=null){
      if(p){
        this.productForm = JSON.parse(JSON.stringify(p));
        this.productForm.measureMode = this.productForm.gram ? 'gram' : 'adet';
        if(this.productForm.measureMode==='adet'){
          this.adetForm = { qty: Number(this.productForm.stock||0), unitCost: 0, extras: 0, currency:'TRY' };
        }else{
          this.gramForm = { grams: Number(this.productForm.gram||0), pricePerGram: 0, extras: 0, currency:'TRY' };
        }
        this.sizeQty = {};
        (this.productForm.sizeOptions||[]).forEach(s=> this.$set(this.sizeQty, s, 0));
      }else{
        this.productForm = this.emptyForm();
        this.adetForm = { qty:0, unitCost:0, extras:0, currency:'TRY' };
        this.gramForm = { grams:0, pricePerGram:0, extras:0, currency:'TRY' };
        this.sizeQty = {};
        this.tabs = 0;
      }
      this.dialogs.product=true;
    },
    closeProductDialog(){ this.dialogs.product=false; },

    /* Kaydet */
    canSaveProduct(){
      const f=this.productForm||{};
      return !!(f.name && f.categoryId && f.supplierId);
    },

    saveProduct(){
      if(!this.canSaveProduct()){ this.toast('Ad, kategori ve toptancı zorunlu.','red'); return; }
      if(!this.hasCover){ this.toast('En az 1 görsel (kapak) ekleyin.','red'); return; }
      if(!this.sizesOk){ this.toast('Beden adetleri toplamı genel adet ile eşleşmiyor.','red'); this.tabs=1; return; }

      const f=this.composeProductForPricing();

      if(!f.sku || !f.sku.trim()) f.sku = this.makeSku(f);
      if(!f.barcode || !String(f.barcode).trim()) f.barcode = this.newBarcode();

      const calc = priceCalc(f);
      const finalPrice = calc.priceGross;

      const payload = {
        ...f,
        images: [...(f.images||[])],
        coverIndex: Number(f.coverIndex||0),
        price: finalPrice
      };

      if(f.id){
        const i=this.products.findIndex(x=>x.id===f.id);
        if(i>-1) this.$set(this.products, i, { ...this.products[i], ...payload });
        this.toast('Ürün güncellendi');
      }else{
        payload.id = this.newId();
        this.products.push(payload);
        this.toast('Ürün eklendi');
      }
      this.dialogs.product=false;
    },

    /* Yardımcılar */
    tl(n){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n||0); },
    pct(n){ const v=Number(n||0); return isFinite(v)? v.toFixed(1)+'%' : '-%'; },
    toast(text,color="green"){ this.snack={show:true,color,text}; },
    newId(){ return Date.now()+Math.floor(Math.random()*1000); },
    newBarcode(){ const base='869'+String(Date.now()).slice(-10); return base.slice(0,13); },
    slug(s){ return String(s||'').toLowerCase()
        .replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u')
        .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); },
    makeSku(f){
      const name=(f.name||'urun'), color=(f.color||'').toString(), size=(f.size||'').toString();
      let parts=[this.slug(name).split('-').slice(0,3).join('-')];
      if(color) parts.push(this.slug(color));
      if(size) parts.push(this.slug(size));
      return parts.join('-').toUpperCase();
    },
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
.hero{ position:relative; height:120px; overflow:hidden; border-bottom:1px solid rgba(0,0,0,.04); }
.theme--light .hero{ background:linear-gradient(180deg,#ffffff,#fafafa); }
.theme--dark  .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10); }
.hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite; filter:blur(42px); opacity:.55;
}
.theme--dark .hero-glow{ opacity:.35; }
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
.v-data-table .v-data-table__wrapper{ font-size: .92rem }

/* Görsel grid */
.images-grid{
  display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap:10px;
}
.img-cell{
  position:relative; border:1px solid rgba(0,0,0,.08); border-radius:12px; overflow:hidden; cursor:pointer;
  background:#fff;
}
.img-cell img{ width:100%; height:120px; object-fit:cover; display:block; }
.img-cell.cover{ outline:2px solid var(--accent); }
.img-tools{ position:absolute; top:6px; right:6px; display:flex; align-items:center; gap:6px; }

.img-upload{
  display:flex; align-items:center; justify-content:center;
  border:1px dashed rgba(0,0,0,.2); border-radius:12px; height:120px; cursor:pointer; background:rgba(0,0,0,.02);
}
.img-upload input{ display:none; }
.up-inner{ text-align:center; }
.up-inner .v-icon{ opacity:.7 }

/* Renk dropdown swatch */
.swatch-square{
  width:18px; height:18px; border-radius:6px;
  border:1px solid rgba(0,0,0,.12);
}
.swatch-row{
  display:flex; align-items:center;
  border:1px solid rgba(0,0,0,.08);
  border-radius:10px; padding:6px 10px;
  background:rgba(0,0,0,.02);
}
.theme--dark .swatch-row{ background:rgba(255,255,255,.04); }
.swatch-label{ font-size:.85rem; }

/* Segmented */
.seg{ border:1px solid rgba(0,0,0,.12); border-radius:12px; background:transparent }
.theme--dark .seg{ border-color:rgba(255,255,255,.16) }

/* v-select içi tek satır; chip görünmüyor */
.no-chip-select .v-select__selections{
  flex-wrap: nowrap;
}
.cover-thumb{
  margin: 4px;
  width:56px; height:56px;
  border-radius:10px;
  overflow:hidden;
  border:1px solid rgba(0,0,0,.12);
  background:#fff;
}
.theme--dark .cover-thumb{
  background:#1f1f1f;
  border-color:rgba(255,255,255,.12);
}
.cover-thumb img{
  width:100%; height:100%;
  object-fit:cover;            /* düzgün kırpma */
  image-rendering:auto;        /* net görüntü */
}
.cover-empty{ display:flex; align-items:center; justify-content:center; }



/* Print */
@media print {
  body * { visibility:hidden !important; }
  #productPrint, #productPrint * { visibility:visible !important; }
  #productPrint { position:absolute; left:0; top:0; width:100%; }
}

/* Anim */
@keyframes float{ 0%{ transform:translate3d(0,0,0) } 50%{ transform:translate3d(2%,-2%,0) } 100%{ transform:translate3d(0,0,0) } }
</style>

<style>
.v-main__wrap{ padding-top:0 !important; }
</style>
A