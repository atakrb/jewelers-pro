<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
    <!-- SOL MENÜ -->
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
        <h2 class="hero-title">
          {{
            view==='pick'      ? 'Atölyeler • Toptancılar'
                : view==='suppliers' ? entityPlural
                    : view==='cats'      ? (activeSupplier?.name + ' • Kategoriler')
                        : view==='list'      ? (activeSupplier?.name + ' • ' + (activeCat?.name||'Ürünler'))
                            : pName(activeProduct)
          }}
        </h2>
        <div class="hero-sub">
          {{
            view==='pick'
                ? 'Önce kaynak türünü seç: Atölye ya da Toptancı.'
                : view==='suppliers'
                    ? (entityPlural + ' kartları: iletişim, son alış, toplam stok. İçine gir kategorileri gör.')
                    : view==='cats'
                        ? 'Bu ' + entitySingularLower + 'dan aldığın kategoriler — stok & ürün sayıları.'
                        : view==='list'
                            ? 'Seçilen kategorideki ürünler — ürün ekle/düzenle/sil ve detaya gir.'
                            : 'Tedarikçi/atölye, stok, varyant ve parasal detaylar.'
          }}
        </div>
      </div>
    </div>

    <!-- ARAMA + AKSİYON -->
    <v-container class="pt-4 pb-0">
      <v-row dense align="center">
        <v-col cols="12" md="6">
          <v-text-field v-model="search" dense outlined clearable hide-details
                        :label="searchLabel" prepend-inner-icon="mdi-magnify"/>
        </v-col>
        <v-col cols="12" md="6" class="d-flex justify-end">
          <v-btn v-if="view!=='pick'" class="glass-btn mr-2" @click="goUp">
            <v-icon left small>mdi-arrow-left</v-icon> Geri
          </v-btn>
          <v-btn class="glass-btn mr-2" @click="refreshDb">
            <v-icon left small>mdi-reload</v-icon> Yenile
          </v-btn>

          <!-- Üst sağ aksiyonlar (CRUD) -->
          <v-btn v-if="view==='suppliers'" :color="accent" dark @click="openSupplierDialog()">
            <v-icon left small>mdi-account-plus</v-icon> Yeni {{ entitySingular }}
          </v-btn>
          <v-btn v-if="view==='cats' && activeSupplier" :color="accent" dark @click="openCategoryDialog()">
            <v-icon left small>mdi-shape-outline</v-icon> Yeni Kategori
          </v-btn>
          <v-btn v-if="view==='list' && activeSupplier && activeCat" :color="accent" dark @click="openProductDialog()">
            <v-icon left small>mdi-plus-box</v-icon> Yeni Ürün
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- İÇERİK -->
    <v-container class="py-4">
      <!-- 0) TÜRLÜ SEÇİM EKRANI -->
      <v-row v-if="view==='pick'" dense>
        <v-col cols="12" sm="6">
          <v-card class="soft-card heroish select-card" outlined @click="chooseParty('atelier')">
            <div class="card-hero-glow"></div>
            <v-card-title class="py-4">
              <v-icon class="mr-3" size="60">mdi-hammer-wrench</v-icon>
              <div>
                <div class="title-1 font-weight-bold">Atölyeler</div>
                <div class="caption muted">İmalat / işçilik yapan partnerler</div>
              </div>
            </v-card-title>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card class="soft-card heroish select-card" outlined @click="chooseParty('supplier')">
            <div class="card-hero-glow"></div>
            <v-card-title class="py-4">
              <v-icon class="mr-3" size="60">mdi-storefront-outline</v-icon>
              <div>
                <div class="title-1 font-weight-bold">Toptancılar</div>
                <div class="caption muted">Alım yaptığın tedarikçiler</div>
              </div>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>

      <!-- 1) LİSTE: PARTİ (ATÖLYE / TOPTANCI) KARTLARI -->
      <v-row v-else-if="view==='suppliers'" dense>
        <v-col v-for="s in suppliersFiltered" :key="s.id" cols="12" sm="6" md="4" lg="4">
          <v-card class="soft-card heroish supplier-card" outlined @click="openSupplier(s)">
            <div class="card-hero-glow"></div>

            <v-card-title class="py-3 w-100">
              <div class="d-flex align-center w-100">
                <div class="mr-3">
                  <v-avatar v-if="s.logo" size="44" tile><img :src="s.logo" alt="logo"/></v-avatar>
                  <v-avatar v-else size="44" tile color="deep-purple">
                    <span class="white--text font-weight-bold">{{ initials(s.name) }}</span>
                  </v-avatar>
                </div>
                <div class="flex-grow-1" style="min-width:0">
                  <div class="subtitle-1 font-weight-bold truncate">{{ s.name }}</div>
                  <div class="caption muted truncate">{{ s.phone || '-' }} • {{ s.email || '-' }}</div>
                  <div class="caption muted truncate">{{ s.address || 'Adres yok' }}</div>
                </div>

                <!-- Menü -->
                <v-menu bottom left offset-y @click.stop.prevent>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on" @click.stop.prevent>
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item @click.stop.prevent="openSupplierDialog(s)">
                      <v-list-item-icon><v-icon>mdi-account-edit</v-icon></v-list-item-icon>
                      <v-list-item-title>Düzenle</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click.stop.prevent="removeSupplier(s)">
                      <v-list-item-icon><v-icon>mdi-delete</v-icon></v-list-item-icon>
                      <v-list-item-title>Sil</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-card-title>

            <v-card-text class="pt-0">
              <div class="kpis">
                <div class="d-flex justify-space-between">
                  <span class="grey--text">Son Alış</span>
                  <strong>{{ lastPurchaseText(s) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="grey--text">Toplam Alış (tahmini)</span>
                  <strong>{{ tl(totalPurchaseAmount(s)) }}</strong>
                </div>
              </div>
              <div class="mt-2 d-flex">
                <v-btn small class="glass-btn mr-2" @click.stop="openWhatsApp(s)">
                  <v-icon left small>mdi-whatsapp</v-icon> WhatsApp
                </v-btn>
                <v-btn small outlined @click.stop="openCall(s)">
                  <v-icon left small>mdi-phone</v-icon> Ara
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" v-if="!suppliersFiltered.length">
          <v-alert type="info" outlined>Sonuç bulunamadı.</v-alert>
        </v-col>
      </v-row>

      <!-- 2) KATEGORİLER -->
      <v-row v-else-if="view==='cats'" dense>
        <v-col v-for="cat in supplierCatsFiltered" :key="cat.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="soft-card category-card heroish" outlined @click="openCat(cat)">
            <div class="card-hero-glow"></div>

            <div class="cat-header" :style="catHeaderStyle(cat)">
              <div class="left"><v-icon size="38">{{ catIcon(cat.id) }}</v-icon></div>
              <div class="mid">
                <div class="subtitle-1 font-weight-bold truncate">{{ cat.name }}</div>
                <div class="caption truncate">{{ cat.description || '—' }}</div>
              </div>
              <v-spacer/>
              <v-menu bottom right offset-y @click.stop.prevent>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon small class="ml-2" v-bind="attrs" v-on="on" @click.stop.prevent>
                    <v-icon small>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click.stop.prevent="openCategoryDialog(cat)">
                    <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
                    <v-list-item-title>Düzenle (Global)</v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="isCatLinkedToSupplier(cat)" @click.stop.prevent="unlinkCategoryFromSupplier(cat)">
                    <v-list-item-icon><v-icon>mdi-link-off</v-icon></v-list-item-icon>
                    <v-list-item-title>{{ entitySingular }}’dan Kaldır</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click.stop.prevent="removeCategoryGlobal(cat)">
                    <v-list-item-icon><v-icon>mdi-delete</v-icon></v-list-item-icon>
                    <v-list-item-title>Kategoriyi Sil (Global)</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <v-card-text class="pt-2">
              <div class="d-flex justify-space-between">
                <span class="grey--text">Stok Değeri (Geliş+Ek)</span>
                <strong>{{ tl(catStockValueForSupplier(cat)) }}</strong>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" v-if="!supplierCatsFiltered.length">
          <v-alert type="info" outlined>Bu {{ entitySingularLower }}ya ait kategori yok. Üstten <strong>Yeni Kategori</strong> ekleyebilirsin.</v-alert>
        </v-col>
      </v-row>

      <!-- 3) ÜRÜNLER -->
      <v-row v-else-if="view==='list'" dense>
        <v-col cols="12">
          <v-card class="soft-card" outlined>
            <v-card-title class="subtitle-1 font-weight-bold">
              {{ activeSupplier?.name }} • {{ activeCat?.name }} — Ürünler
              <v-spacer/><v-chip small>{{ productsFiltered.length }} ürün</v-chip>
            </v-card-title>

            <v-card-text class="pt-0">
              <v-row dense>
                <v-col v-for="p in productsFiltered" :key="p.id" cols="12" sm="6" md="4" lg="3">
                  <v-card class="soft-card product-card heroish" outlined @click="openDetail(p)">
                    <div class="card-hero-glow"></div>
                    <div class="prod-top">
                      <div class="leftbox"><v-icon class="muted">mdi-diamond-stone</v-icon></div>
                      <div class="title-area">
                        <div class="name truncate">{{ pName(p) }}</div>
                        <div class="meta muted truncate">
                          #{{ p.sku || p.id }} • {{ p.karat ? p.karat + 'k' : '' }} {{ p.ayar || '' }}
                        </div>
                      </div>
                      <v-spacer/>

                      <v-menu bottom left offset-y @click.stop.prevent>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn icon small v-bind="attrs" v-on="on" @click.stop.prevent>
                            <v-icon small>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                        <v-list dense>
                          <v-list-item @click.stop.prevent="openProductDialog(p)">
                            <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
                            <v-list-item-title>Düzenle</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click.stop.prevent="removeProduct(p)">
                            <v-list-item-icon><v-icon>mdi-delete</v-icon></v-list-item-icon>
                            <v-list-item-title>Sil</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>

                    <div class="prod-bottom">
                      <div class="caption muted">{{ entitySingular }}</div>
                      <div class="supplier-name truncate">{{ supplierName(p.supplierId) }}</div>
                      <div class="caption muted mt-1">Son alış: <strong>{{ lastBuySummary(p.id) || '-' }}</strong></div>
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" v-if="!productsFiltered.length">
                  <v-alert type="info" outlined>Bu kategoride ürün yok. Üstten <strong>Yeni Ürün</strong> ekle.</v-alert>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 4) ÜRÜN DETAY -->
      <v-row v-else-if="view==='detail'" dense>
        <v-col cols="12" md="8">
          <v-card class="soft-card heroish" outlined>
            <div class="card-hero-glow"></div>

            <v-card-title class="subtitle-1 font-weight-bold">
              <v-icon class="mr-2">mdi-diamond-stone</v-icon>
              {{ pName(activeProduct) }}
              <v-spacer/>
              <v-btn small class="glass-btn mr-2" @click.stop="openProductDialog(activeProduct)">
                <v-icon left small>mdi-pencil</v-icon> Düzenle
              </v-btn>
              <v-btn small outlined color="red" class="mr-2" @click.stop="removeProduct(activeProduct)">
                <v-icon left small>mdi-delete</v-icon> Sil
              </v-btn>
              <v-chip small :color="stockChipColor(pStock(activeProduct))" text-color="white">
                Stok: {{ pStock(activeProduct) }}
              </v-chip>
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
                    <tr><td>Model</td><td class="text-right">{{ activeProduct.type || '-' }}</td></tr>
                    <tr v-if="ringLike(activeProduct)"><td>Beden</td><td class="text-right">9–20 (opsiyonel)</td></tr>
                    </tbody>
                  </v-simple-table>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-simple-table dense>
                    <tbody>
                    <tr>
                      <td>{{ entitySingular }}</td>
                      <td class="text-right">
                        <span class="font-weight-bold">{{ supplierName(activeProduct.supplierId) }}</span>
                        <div class="caption">{{ supplierPhoneFromProduct(activeProduct) || '' }}</div>
                      </td>
                    </tr>
                    <tr><td>Son Alış</td><td class="text-right">{{ lastBuySummary(activeProduct.id) || '-' }}</td></tr>
                    <tr><td>Son Satış</td><td class="text-right">{{ lastSellSummary(activeProduct.id) || '-' }}</td></tr>
                    </tbody>
                  </v-simple-table>

                  <div class="mt-2 d-flex justify-end">
                    <v-btn v-if="supplierPhoneFromProduct(activeProduct)" small class="glass-btn mr-2" :href="waLink(activeProduct)" target="_blank">
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
                  <div v-if="movementTimeline(activeProduct.id).length===0" class="grey--text caption">Hareket bulunamadı.</div>
                </v-timeline>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="soft-card" outlined>
            <v-card-title class="subtitle-1 font-weight-bold">Detay (Parasal)</v-card-title>
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

    <!-- DİYALOGLAR -->
    <!-- Parti (Toptancı/Atölye) -->
    <v-dialog v-model="dialogs.supplier" max-width="560px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">{{ supplierForm.id ? (entitySingular + ' Düzenle') : ('Yeni ' + entitySingular) }}</v-card-title>
        <v-card-text>
          <v-form ref="supplierFormRef">
            <v-text-field v-model="supplierForm.name" label="Ad" dense outlined required />
            <v-text-field v-model="supplierForm.logo" label="Logo URL (ops.)" dense outlined />
            <v-text-field v-model="supplierForm.phone" label="Telefon" dense outlined />
            <v-text-field v-model="supplierForm.email" label="E-posta" dense outlined />
            <v-textarea v-model="supplierForm.address" label="Adres" dense outlined rows="2"/>
            <v-textarea v-model="supplierForm.notes" label="Notlar" dense outlined rows="2"/>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.supplier=false">Vazgeç</v-btn>
          <v-spacer/><v-btn :color="accent" dark @click="saveSupplier">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Kategori -->
    <v-dialog v-model="dialogs.category" max-width="560px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">{{ categoryForm.id ? 'Kategori Düzenle' : 'Yeni Kategori' }}</v-card-title>
        <v-card-text>
          <v-form ref="categoryFormRef">
            <v-text-field v-model="categoryForm.name" label="Ad" dense outlined required />
            <v-text-field v-model="categoryForm.description" label="Açıklama" dense outlined />
            <v-select v-model="categoryForm.iconId" :items="iconOptions" item-text="label" item-value="value" dense outlined label="İkon"/>
            <v-text-field v-model="categoryForm.color" type="color" label="Renk" hide-details dense outlined />
            <v-checkbox v-if="activeSupplier"
                        v-model="categoryForm.linkToSupplier"
                        :label="'Bu kategoriyi aktif ' + entitySingularLower + 'ya bağla'"
                        hide-details />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.category=false">Vazgeç</v-btn>
          <v-spacer/><v-btn :color="accent" dark @click="saveCategory">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Ürün -->
    <v-dialog v-model="dialogs.product" max-width="760px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">{{ productForm.id ? 'Ürün Düzenle' : 'Yeni Ürün' }}</v-card-title>
        <v-card-text>
          <v-form ref="productFormRef">
            <v-row dense>
              <v-col cols="12" md="6"><v-text-field v-model="productForm.name" label="Ürün Adı" dense outlined required/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.sku" label="SKU" dense outlined/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.barcode" label="Barkod" dense outlined/></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                    v-model="productForm.supplierId"
                    :items="suppliersSelect"
                    item-text="name" item-value="id"
                    dense outlined :label="entitySingular"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                    v-model="productForm.categoryId"
                    :items="categoriesSelect"
                    item-text="name" item-value="id"
                    dense outlined label="Kategori"
                />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.karat" label="Karat" dense outlined/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.ayar" label="Ayar" dense outlined/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model.number="productForm.stock" type="number" min="0" label="Stok" dense outlined/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.type" label="Model" dense outlined/></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12" md="6"><v-text-field v-model="productForm.colors" label="Renkler (virgülle)" dense outlined/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model.number="productForm.cost" type="number" min="0" label="Geliş (TL)" dense outlined/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model.number="productForm.extras" type="number" min="0" label="Ek Masraf" dense outlined/></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" md="3"><v-text-field v-model.number="productForm.vatPercent" type="number" min="0" label="KDV %" dense outlined/></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="productForm.priceManual" type="number" min="0" label="Satış (ops.)" dense outlined/></v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.product=false">Vazgeç</v-btn>
          <v-spacer/><v-btn :color="accent" dark @click="saveProduct">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2200">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
import { get, subscribe } from '@/utils/harddata'
import { priceCalc } from '@/utils/pricing'

export default {
  name: 'AtolyeToptanciSayfa',
  data(){
    return {
      // Tema & nav
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini:   this.$vuetify?.breakpoint?.lgAndUp || false,
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

      // Veri
      categories: [], products: [], suppliers: [], stockMoves: [],
      ateliers: [],   // YENİ: atölyeler

      // UI state
      partyType: null,  // 'supplier' | 'atelier'
      view: 'pick',     // pick -> suppliers -> cats -> list -> detail
      search: '',
      activeSupplier: null, // seçilmiş parti (hem toptancı hem atölye için kullanıyoruz)
      activeCat: null,
      activeProduct: null,

      // Dialog state
      dialogs: { supplier: false, category: false, product: false },

      supplierForm: { id:null, name:'', logo:'', phone:'', email:'', address:'', notes:'', categoryIds:[] },
      categoryForm: { id:null, name:'', description:'', iconId:'', color:'#5865F2', linkToSupplier:true },
      productForm:  { id:null, name:'', sku:'', barcode:'', supplierId:null, categoryId:null,
        karat:'', ayar:'', stock:0, type:'', colors:'', cost:0, extras:0, vatPercent:20, priceManual:'' },

      snack: { show:false, color:'green', text:'' },
    }
  },

  created(){
    this.hydrate()
    subscribe && subscribe('categories', this.hydrate)
    subscribe && subscribe('products',   this.hydrate)
    subscribe && subscribe('suppliers',  this.hydrate)
    subscribe && subscribe('stockMovements', this.hydrate)
    subscribe && subscribe('ateliers',   this.hydrate) // varsa dinle
  },

  computed:{
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },

    // Dinamik metinler
    entitySingular(){ return this.partyType==='atelier' ? 'Atölye' : 'Toptancı' },
    entitySingularLower(){ return this.partyType==='atelier' ? 'atölye' : 'toptancı' },
    entityPlural(){ return this.partyType==='atelier' ? 'Atölyeler' : 'Toptancılar' },

    currentPartyList(){ return this.partyType==='atelier' ? (this.ateliers||[]) : (this.suppliers||[]) },

    searchLabel(){
      if(this.view==='pick')       return 'Atölye veya Toptancı seç'
      if(this.view==='suppliers')  return `${this.entitySingular} Ara (ad, tel, e-posta, adres)`
      if(this.view==='cats')       return 'Kategori Ara (ad/açıklama)'
      return 'Ürün Ara (ad, sku, barkod, ayar)'
    },

    // Parti listesi (filtreli) – şablon ismi bozulmasın diye aynısını döndürüyorum
    suppliersFiltered(){
      const q=(this.search||'').toLowerCase().trim()
      const arr = this.currentPartyList
      if(!q) return arr
      return arr.filter(s => [s.name,s.phone,s.email,s.address].join(' ').toLowerCase().includes(q))
    },

    // Aktif partinin kategorileri
    supplierCats(){
      if(!this.activeSupplier) return []
      const sId = String(this.activeSupplier.id)
      const prods = (this.products||[]).filter(p => String(p.supplierId)===sId)
      const catSet = new Set(this.activeSupplier?.categoryIds?.map(String) || [])
      prods.forEach(p=>{
        if(Array.isArray(p.categoryIds) && p.categoryIds.length) p.categoryIds.forEach(id=>catSet.add(String(id)))
        else if(p.categoryId!=null) catSet.add(String(p.categoryId))
      })
      return (this.categories||[]).filter(c => catSet.has(String(c.id)))
    },
    supplierCatsFiltered(){
      const q=(this.search||'').toLowerCase().trim()
      if(!q) return this.supplierCats
      return this.supplierCats.filter(c => (c.name + ' ' + (c.description||'')).toLowerCase().includes(q))
    },

    // Aktif parti + kategori altındaki ürünler
    productsOfSelected(){
      if(!this.activeSupplier || !this.activeCat) return []
      const sId = String(this.activeSupplier.id)
      const cId = String(this.activeCat.id)
      return (this.products||[]).filter(p=>{
        const okSupplier = String(p.supplierId)===sId  // supplierId burada "partiId"
        const ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String)
            : (p.categoryId!=null ? [String(p.categoryId)] : [])
        const okCat = ids.includes(cId)
        return okSupplier && okCat
      })
    },
    productsFiltered(){
      const q=(this.search||'').toLowerCase().trim()
      if(!q) return this.productsOfSelected
      return this.productsOfSelected.filter(p=>{
        const txt=[p.name,p.isim,p.sku,p.barcode,p.karat,p.ayar].join(' ').toLowerCase()
        return txt.includes(q)
      })
    },

    suppliersSelect(){ return this.currentPartyList.map(s=>({ id:s.id, name:s.name })) },
    categoriesSelect(){ return (this.categories||[]).map(c=>({ id:c.id, name:c.name })) },

    iconOptions(){
      return [
        { label:'Elmas', value:'diamond' }, { label:'Altın', value:'gold' }, { label:'Gümüş', value:'silver' },
        { label:'Yüzük', value:'ring' }, { label:'Kolye', value:'necklace' }, { label:'Küpe', value:'earring' },
        { label:'Bileklik', value:'bracelet' }, { label:'Set', value:'set' }
      ]
    },
  },

  methods:{
    /* Tema */
    setAccent(c){ this.accent=c; localStorage.setItem('jp_accent', c) },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark },

    /* Başlangıç seçimi */
    chooseParty(type){ this.partyType = type; this.view='suppliers'; this.search='' },

    /* Veri çek / kaydet */
    hydrate(){
      const loc = (k, d=[]) => { try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d }catch{ return d } }
      this.categories = get?.('categories') || loc('categories', [])
      this.products   = get?.('products')   || loc('products',   [])
      this.suppliers  = get?.('suppliers')  || loc('suppliers',  [])
      this.ateliers   = get?.('ateliers')   || loc('ateliers',   [])   // YENİ
      this.stockMoves = get?.('stockMovements') || loc('stockMovements', [])
    },
    persistAll(){
      try{
        localStorage.setItem('categories', JSON.stringify(this.categories))
        localStorage.setItem('products',   JSON.stringify(this.products))
        localStorage.setItem('suppliers',  JSON.stringify(this.suppliers))
        localStorage.setItem('ateliers',   JSON.stringify(this.ateliers))
      }catch(e){ console.warn('persist error', e) }
    },
    async refreshDb(){
      try{ await (reload?.(true)); this.hydrate(); this.toast('Veriler yenilendi') }
      catch(e){ console.warn(e); this.toast('Yenileme başarısız','red') }
    },

    /* NAV */
    goUp(){
      if(this.view==='suppliers'){ this.view='pick'; this.activeSupplier=null; this.search=''; return }
      if(this.view==='cats'){ this.view='suppliers'; this.activeSupplier=null; this.search=''; return }
      if(this.view==='list'){ this.view='cats'; this.activeCat=null; this.search=''; return }
      if(this.view==='detail'){ this.view='list'; this.activeProduct=null; return }
    },
    openSupplier(s){ this.activeSupplier=s; this.view='cats'; this.search='' },
    openCat(c){ this.activeCat=c; this.view='list'; this.search='' },
    openDetail(p){ this.activeProduct=p; this.view='detail' },
    backToList(){ this.view='list' },

    /* UI Helpers */
    toast(t,c='green'){ this.snack = { show:true, color:c, text:t } },
    tl(n){ return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(Number(n)||0) },
    formatDate(d){ try{ const dt = new Date(d); return isNaN(dt)?'-':dt.toLocaleDateString('tr-TR') }catch{ return '' } },
    calc: priceCalc,
    salePrice(p){ return (p?.priceManual ? Number(p.priceManual) : priceCalc(p).priceGross) },
    initials(str){ return (str||'').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase() },
    pName(p){ return p?.isim || p?.name || '' },
    pStock(p){ return Number(p?.stok ?? p?.stock ?? 0) },

    /* Özetler */
    lastPurchaseText(s){
      const items = Array.isArray(s.items) ? s.items.filter(i=>i.buyDate) : []
      if(!items.length) return '-'
      const maxTs = Math.max(...items.map(i=> new Date(i.buyDate).getTime()))
      const sameDay = items.filter(i=> new Date(i.buyDate).getTime()===maxTs)
      const total = sameDay.reduce((t,i)=> t + (Number(i.qty||0)*(Number(i.cost||0)+Number(i.extras||0))), 0)
      return `${this.formatDate(maxTs)} • ${this.tl(total)}`
    },
    totalPurchaseAmount(s){
      const items = Array.isArray(s.items) ? s.items : []
      return items.reduce((t,i)=> t + (Number(i.qty||0)*(Number(i.cost||0)+Number(i.extras||0))), 0)
    },
    openWhatsApp(s){
      const phone=(s?.phone||'').replace(/\D/g,''); if(!phone){ this.toast('Telefon yok','red'); return }
      const msg=`Merhaba ${s.name}, stok/sipariş hakkında bilgi almak istiyorum.`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank')
    },
    openCall(s){
      const phone=(s?.phone||'').replace(/\D/g,''); if(!phone){ this.toast('Telefon yok','red'); return }
      window.location.href=`tel:${phone}`
    },

    /* Kategori görünüm & stiller */
    catIcon(id){
      const map = {
        diamond: 'mdi-diamond-stone', gold:'mdi-crown', silver:'mdi-circle-multiple-outline',
        ring:'mdi-ring', necklace:'mdi-link-variant', earring:'mdi-ear-hearing',
        bracelet:'mdi-link', set:'mdi-cube-outline'
      }
      return map[String(id)] || 'mdi-shape-outline'
    },
    stockChipColor(n){
      const v = Number(n)||0
      if(v<=0) return 'red darken-1'
      if(v<=5) return 'orange darken-1'
      return 'green darken-1'
    },
    catHeaderStyle(cat){
      const base = cat?.color || this.accent
      return `
        background:
          linear-gradient(180deg, rgba(255,255,255,.6), transparent 60%),
          ${this.gradientFromHex(base)};
        padding:12px 14px;
        border-bottom:1px solid ${this.$vuetify.theme.dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'};
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

    /* Kategori özetleri (AKTİF PARTİ İÇİN) */
    catCountsForSupplier(cat){
      if(!this.activeSupplier) return { products: 0, stock: 0 }
      const sId = String(this.activeSupplier.id)
      const cId = String(cat.id)
      const items = (this.products||[]).filter(p=>{
        const okSupplier = String(p.supplierId)===sId
        const ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String)
            : (p.categoryId!=null ? [String(p.categoryId)] : [])
        const okCat = ids.includes(cId)
        return okSupplier && okCat
      })
      const stock = items.reduce((t,p)=> t + this.pStock(p), 0)
      return { products: items.length, stock }
    },
    catStockValueForSupplier(cat){
      if(!this.activeSupplier) return 0
      const sId = String(this.activeSupplier.id)
      const cId = String(cat.id)
      const items = (this.products||[]).filter(p=>{
        const okSupplier = String(p.supplierId)===sId
        const ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String)
            : (p.categoryId!=null ? [String(p.categoryId)] : [])
        const okCat = ids.includes(cId)
        return okSupplier && okCat
      })
      return items.reduce((t,p)=> t + (this.pStock(p) * (Number(p.cost||0) + Number(p.extras||0))), 0)
    },

    isCatLinkedToSupplier(cat){
      return (this.activeSupplier?.categoryIds||[]).map(String).includes(String(cat.id))
    },
    unlinkCategoryFromSupplier(cat){
      if(!this.activeSupplier) return
      this.activeSupplier.categoryIds = (this.activeSupplier.categoryIds||[]).filter(id => String(id)!==String(cat.id))
      this.persistAll()
      this.toast('Kategori kaldırıldı')
    },

    /* Parti yardımcıları */
    supplierName(id){
      const s = this.currentPartyList.find(x=>String(x.id)===String(id))
      return s?.name || '—'
    },
    supplierPhone(id){
      const s = this.currentPartyList.find(x=>String(x.id)===String(id))
      return (s?.phone||'').trim()
    },
    supplierPhoneFromProduct(p){ return this.supplierPhone(p?.supplierId) },

    waLink(p){
      const phone=(this.supplierPhoneFromProduct(p)||'').replace(/\D/g,'')
      const text=encodeURIComponent(`Merhaba, ${this.pName(p)} (#${p?.sku||p?.id}) hakkında bilgi rica ediyorum.`)
      return phone ? `https://wa.me/${phone}?text=${text}` : '#'
    },
    waOrderLink(p){
      const phone=(this.supplierPhoneFromProduct(p)||'').replace(/\D/g,'')
      const text=encodeURIComponent(`Merhaba, ${this.pName(p)} (#${p?.sku||p?.id}) için sipariş vermek istiyorum.`)
      return phone ? `https://wa.me/${phone}?text=${text}` : '#'
    },
    primaryCatName(p){
      const id = Array.isArray(p?.categoryIds) && p.categoryIds.length ? p.categoryIds[0] : p?.categoryId
      const c  = (this.categories||[]).find(x => String(x.id)===String(id))
      return c?.name || '—'
    },
    ringLike(p){
      const t=(p?.type||'').toLowerCase(), n=(p?.name||p?.isim||'').toLowerCase()
      return t.includes('yüzük') || n.includes('yüzük')
    },

    /* Hareketler */
    movementTimeline(productId){
      return (this.stockMoves||[]).filter(m => String(m.productId)===String(productId)).sort((a,b)=> new Date(b.date)-new Date(a.date))
    },
    lastBuySummary(productId){
      const ins=(this.stockMoves||[]).filter(m => String(m.productId)===String(productId) && m.type==='in')
      if(!ins.length) return ''
      const last=ins.sort((a,b)=> new Date(b.date)-new Date(a.date))[0]
      return `${this.formatDate(last.date)} • ${last.qty} adet`
    },
    lastSellSummary(productId){
      const outs=(this.stockMoves||[]).filter(m => String(m.productId)===String(productId) && m.type==='out')
      if(!outs.length) return ''
      const last=outs.sort((a,b)=> new Date(b.date)-new Date(a.date))[0]
      return `${this.formatDate(last.date)} • ${last.qty} adet`
    },

    /* ==== CRUD ==== */
    newId(){ return Date.now() + Math.floor(Math.random()*100000) },

    // Parti (toptancı/atölye)
    openSupplierDialog(s=null){
      this.supplierForm = s
          ? { id:s.id, name:s.name||'', logo:s.logo||'', phone:s.phone||'', email:s.email||'', address:s.address||'', notes:s.notes||'', categoryIds:[...(s.categoryIds||[])] }
          : { id:null, name:'', logo:'', phone:'', email:'', address:'', notes:'', categoryIds:[] }
      this.dialogs.supplier = true
    },
    saveSupplier(){
      const f = this.supplierForm
      if(!f.name){ this.toast(`${this.entitySingular} adı zorunlu`,'red'); return }
      const key = this.partyType==='atelier' ? 'ateliers' : 'suppliers'
      if(f.id){
        const i = this[key].findIndex(x=>x.id===f.id)
        if(i>-1) this.$set(this[key], i, { ...this[key][i], ...f })
        if(this.activeSupplier && this.activeSupplier.id===f.id) this.activeSupplier = this[key][i]
        this.toast(`${this.entitySingular} güncellendi`)
      }else{
        const obj = { ...f, id:this.newId(), items:[], invoices:[], categoryIds:[] }
        this[key].unshift(obj)
        this.toast(`${this.entitySingular} eklendi`)
      }
      this.persistAll()
      this.dialogs.supplier=false
    },
    removeSupplier(s){
      if(!confirm(`"${s.name}" silinsin mi?`)) return
      const key = this.partyType==='atelier' ? 'ateliers' : 'suppliers'
      const sid = String(s.id)
      this.products = (this.products||[]).filter(p => String(p.supplierId)!==sid)
      this[key] = this[key].filter(x => x.id!==s.id)
      if(this.activeSupplier && String(this.activeSupplier.id)===sid) { this.activeSupplier=null; this.view='suppliers' }
      this.persistAll()
      this.toast(`${this.entitySingular} silindi`,'red')
    },

    // Kategori
    openCategoryDialog(c=null){
      this.categoryForm = c
          ? { id:c.id, name:c.name||'', description:c.description||'', iconId:String(c.id)||'', color:c.color||this.accent, linkToSupplier:true }
          : { id:null, name:'', description:'', iconId:'ring', color:this.accent, linkToSupplier:true }
      this.dialogs.category=true
    },
    saveCategory(){
      const f=this.categoryForm
      if(!f.name){ this.toast('Kategori adı zorunlu','red'); return }
      if(f.id){
        const i=this.categories.findIndex(x=>String(x.id)===String(f.id))
        if(i>-1) this.$set(this.categories, i, { ...this.categories[i], name:f.name, description:f.description, color:f.color })
        this.toast('Kategori güncellendi')
      }else{
        const id = f.iconId || 'custom-'+this.newId()
        const obj = { id, name:f.name, description:f.description||'', color:f.color }
        this.categories.push(obj)
        if(this.activeSupplier && f.linkToSupplier){
          const arr = new Set(this.activeSupplier.categoryIds || [])
          arr.add(String(id))
          this.activeSupplier.categoryIds = Array.from(arr)
        }
        this.toast('Kategori eklendi')
      }
      this.persistAll()
      this.dialogs.category=false
    },
    removeCategoryGlobal(cat){
      if(!confirm(`"${cat.name}" KATEGORİSİ global olarak silinsin mi? (Ürünlerden kaldırılacak)`)) return
      const cid = String(cat.id)
      this.products = (this.products||[]).map(p=>{
        const ids = Array.isArray(p.categoryIds) ? p.categoryIds.map(String).filter(x=>x!==cid) : []
        const single = (p.categoryId!=null && String(p.categoryId)===cid) ? null : p.categoryId
        return { ...p, categoryIds: ids, categoryId: single }
      })
      ;['suppliers','ateliers'].forEach(k=>{
        this[k] = (this[k]||[]).map(s=> ({ ...s, categoryIds:(s.categoryIds||[]).filter(id=>String(id)!==cid) }))
      })
      this.categories = (this.categories||[]).filter(c=>String(c.id)!==cid)
      if(this.activeCat && String(this.activeCat.id)===cid){ this.activeCat=null; this.view='cats' }
      this.persistAll()
      this.toast('Kategori silindi','red')
    },

    // Ürün
    openProductDialog(p=null){
      const list = this.currentPartyList
      const preSup = this.activeSupplier?.id || (list[0]?.id ?? null)
      const preCat = this.activeCat?.id || (this.categories[0]?.id ?? null)
      this.productForm = p ? {
        id: p.id, name:p.name||p.isim||'', sku:p.sku||'', barcode:p.barcode||'',
        supplierId: p.supplierId ?? preSup, // partiId
        categoryId: (Array.isArray(p.categoryIds) && p.categoryIds.length) ? p.categoryIds[0] : (p.categoryId ?? preCat),
        karat:p.karat||'', ayar:p.ayar||'', stock: Number(p.stock ?? p.stok ?? 0),
        type:p.type||'', colors:(p.colorOptions||[]).join(', '),
        cost:Number(p.cost||0), extras:Number(p.extras||0), vatPercent:Number(p.vatPercent??20),
        priceManual: p.priceManual || ''
      } : {
        id:null, name:'', sku:'', barcode:'', supplierId: preSup, categoryId: preCat,
        karat:'', ayar:'', stock:0, type:'', colors:'', cost:0, extras:0, vatPercent:20, priceManual:''
      }
      this.dialogs.product=true
    },
    saveProduct(){
      const f=this.productForm
      if(!f.name){ this.toast('Ürün adı zorunlu','red'); return }
      if(!f.supplierId){ this.toast(`${this.entitySingular} seç`,'red'); return }
      if(!f.categoryId){ this.toast('Kategori seç','red'); return }

      const payload = {
        id: f.id || this.newId(),
        name: f.name, sku:f.sku||'', barcode:f.barcode||'',
        supplierId: f.supplierId,                 // partiId
        categoryId: f.categoryId, categoryIds: [f.categoryId],
        karat:f.karat||'', ayar:f.ayar||'', stock:Number(f.stock||0),
        type:f.type||'',
        colorOptions: (f.colors||'').split(',').map(x=>x.trim()).filter(Boolean),
        cost:Number(f.cost||0), extras:Number(f.extras||0), vatPercent:Number(f.vatPercent||0),
        priceManual: f.priceManual ? Number(f.priceManual) : ''
      }

      if(f.id){
        const i=this.products.findIndex(x=>x.id===f.id)
        if(i>-1) this.$set(this.products, i, { ...this.products[i], ...payload })
        this.toast('Ürün güncellendi')
      }else{
        this.products.unshift(payload)
        if(this.activeSupplier){
          const arr = new Set(this.activeSupplier.categoryIds || [])
          arr.add(String(f.categoryId))
          this.activeSupplier.categoryIds = Array.from(arr)
        }
        this.toast('Ürün eklendi')
      }
      this.persistAll()
      this.dialogs.product=false
    },
    removeProduct(p){
      if(!confirm(`"${this.pName(p)}" silinsin mi?`)) return
      const id = p.id
      this.products = this.products.filter(x=>x.id!==id)
      if(this.view==='detail' && this.activeProduct && this.activeProduct.id===id){ this.view='list'; this.activeProduct=null }
      this.persistAll()
      this.toast('Ürün silindi','red')
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
}
.soft-card:hover{ box-shadow: 0 12px 28px rgba(0,0,0,.12); transform: translateY(-2px); }
.theme--dark .soft-card{
  border-color: rgba(255,255,255,.12);
  background: rgba(24,24,24,.7);
}

/* seçim kartları */
.select-card{ cursor:pointer; min-height:110px }

/* heroish */
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
.theme--dark  .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10) }
.hero-glow{
  position:absolute; inset:-30%;
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

/* kart ölçüleri */
.supplier-card{ cursor:pointer; min-height: 200px; }
.category-card{ cursor:pointer; min-height: 100px; }
.product-card{ cursor:pointer; padding:12px; min-height: 170px; }

.cat-header{ display:flex; align-items:center; gap:12px; padding:12px 14px }
.cat-header .left{ display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:12px; background:rgba(255,255,255,.5) }
.theme--dark .cat-header .left{ background:rgba(0,0,0,.25) }
.truncate{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap }

/* Product card içi */
.prod-top{ display:flex; align-items:flex-start; gap:10px }
.title-area{ min-width:0 }
.title-area .name{ font-weight:700; line-height:1.2 }
.muted{ opacity:.65 }
.prod-bottom{ margin-top:8px }

/* Timeline spacing */
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
