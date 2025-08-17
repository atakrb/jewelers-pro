<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
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

    <div class="hero">
      <div class="hero-glow" :style="{ '--accent': accent }"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Kargo & Sipariş Takip</h2>
        <div class="hero-sub">Sipariş, kargo durumu sorgula.</div>
      </div>
    </div>

    <v-container class="pt-4 pb-0">
      <v-slide-group show-arrows>
        <v-slide-item v-for="qa in quickActions" :key="qa.to">
          <v-card class="qa" :to="{ name: qa.to }" link :style="{ borderColor: accent }">
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

    <div class="edge-rail" aria-hidden="true"></div>

    <v-container class="pt-4 pb-0">
      <v-sheet class="filters-sheet">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
                v-model="filters.q"
                dense
                outlined
                clearable
                hide-details
                label="Ara (sipariş, müşteri, tel, adres, takip no)"
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="onQuickEnter"
            />
          </v-col>
          <v-col cols="6" md="2"><v-text-field v-model="filters.startDate" type="date" dense outlined hide-details label="Başlangıç" /></v-col>
          <v-col cols="6" md="2"><v-text-field v-model="filters.endDate" type="date" dense outlined hide-details label="Bitiş" /></v-col>
          <v-col cols="6" md="2"><v-select v-model="filters.carrier" :items="carrierOptions" dense outlined hide-details clearable label="Kargo" /></v-col>
          <v-col cols="6" md="2"><v-select v-model="filters.status" :items="statusOptions" dense outlined hide-details clearable label="Durum" /></v-col>
        </v-row>

        <div class="d-flex flex-wrap mt-3">
          <v-chip small class="mr-2 mb-1" :color="quick==='today' ? 'indigo' : ''" :text-color="quick==='today' ? 'white' : ''" @click="setQuick('today')">Bugün</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='7d' ? 'indigo' : ''" :text-color="quick==='7d' ? 'white' : ''" @click="setQuick('7d')">7 Gün</v-chip>
          <v-chip small class="mr-2 mb-1" :color="quick==='month' ? 'indigo' : ''" :text-color="quick==='month' ? 'white' : ''" @click="setQuick('month')">Bu Ay</v-chip>
          <v-chip small class="mr-2 mb-1" :color="filters.onlyIssues ? 'orange' : ''" :text-color="filters.onlyIssues ? 'white' : ''" @click="filters.onlyIssues = !filters.onlyIssues">Sadece Sorunlu</v-chip>
          <v-chip small class="mr-2 mb-1" :color="filters.codOnly ? 'deep-purple' : ''" :text-color="filters.codOnly ? 'white' : ''" @click="filters.codOnly = !filters.codOnly">Sadece Kapıda Ödeme</v-chip>

          <v-spacer />
          <v-btn small class="mr-2 glass-btn" @click="refreshFromDb"><v-icon left small>mdi-sync</v-icon> Yenile</v-btn>
          <v-btn small :color="accent" dark class="mr-2" @click="openShipmentDialog()"><v-icon left small>mdi-truck-fast</v-icon> Yeni Kargo</v-btn>
          <v-btn small class="mr-2 glass-btn" :disabled="selected.length === 0" @click="openBulkStatusDialog"><v-icon left small>mdi-format-list-bulleted</v-icon> Toplu Durum</v-btn>
          <v-btn small class="mr-2 glass-btn" @click="exportCSV"><v-icon left small>mdi-file-delimited</v-icon> CSV</v-btn>
          <v-btn small class="glass-btn" @click="yazdirManifest"><v-icon left small>mdi-printer</v-icon> Manifest</v-btn>
        </div>
      </v-sheet>
    </v-container>

    <div id="manifestPrint" v-show="!label.item">
      <v-container class="pt-4">
        <v-row dense>
          <v-col cols="6" md="2" v-for="k in kpis" :key="k.key">
            <v-card outlined class="kpi">
              <div class="kpi-glow" />
              <v-card-text class="py-3">
                <div class="caption grey--text text--darken-1">{{ k.title }}</div>
                <div class="headline font-weight-bold">{{ k.value }}</div>
                <div v-if="k.sub" class="caption grey--text mt-1">{{ k.sub }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-3 table-card" outlined>
          <v-card-title class="subtitle-1 font-weight-bold">
            Kargo Listesi ({{ filtered.length }})
            <v-spacer />
            <div class="caption grey--text">Aralık: {{ fmtRange(rangeStart, rangeEnd) }}</div>
          </v-card-title>

          <v-data-table
              :headers="headers"
              :items="filtered"
              item-key="id"
              show-select
              :expanded.sync="expanded"
              show-expand
              dense
              fixed-header
              height="620"
              :items-per-page="12"
              v-model="selected"
              :class="['elevated-datatable']"
          >
            <template v-slot:item.shipment="{ item }">
              <div class="font-weight-medium">#{{ item.orderId }} — {{ item.customer }}</div>
              <div class="caption grey--text">{{ shortAddress(item) }}</div>
            </template>
            <template v-slot:item.platform="{ item }">
              <v-chip x-small :color="accent" text-color="white">{{ item.platform }}</v-chip>
            </template>
            <template v-slot:item.carrier="{ item }">
              <div>{{ item.carrier }}<span v-if="item.service" class="grey--text"> ({{ item.service }})</span></div>
            </template>
            <template v-slot:item.trackingNo="{ item }">
              <v-btn text small class="px-0 link" @click="openTracking(item)">{{ item.trackingNo }}</v-btn>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip small :color="statusColor(item.status)" text-color="white">{{ item.status }}</v-chip>
            </template>
            <template v-slot:item.lastEvent="{ item }">
              <div class="text-truncate" style="max-width:220px">
                <span v-if="item.events && item.events[0]">{{ fmtDateTime(item.events[0].time) }} — {{ item.events[0].desc }}</span>
                <span v-else class="grey--text">-</span>
              </div>
            </template>
            <template v-slot:item.eta="{ item }">{{ item.eta ? fmtDate(item.eta) : '-' }}</template>
            <template v-slot:item.cod="{ item }">
              <v-chip x-small :color="item.cod ? 'deep-purple' : 'grey'" text-color="white">
                {{ item.cod ? tl(item.codAmount || 0) : 'Yok' }}
              </v-chip>
            </template>
            <template v-slot:item.ops="{ item }">
              <v-btn icon small @click="openShipmentDialog(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
              <v-btn icon small @click="openDetailDrawer(item)"><v-icon small>mdi-eye</v-icon></v-btn>
              <v-btn icon small @click="printLabel(item)"><v-icon small>mdi-label</v-icon></v-btn>
              <v-btn icon small @click="removeShipment(item)"><v-icon small>mdi-delete</v-icon></v-btn>
            </template>

            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" class="pa-0">
                <v-divider />
                <v-card flat class="pa-3">
                  <div class="d-flex align-center">
                    <div class="subtitle-2 font-weight-bold">Hızlı Olay — #{{ item.orderId }}</div>
                    <v-spacer />
                    <v-btn x-small class="mr-2 glass-btn" @click="pushQuickEvent(item, 'Kargoya Verildi')">Kargoya Verildi</v-btn>
                    <v-btn x-small class="mr-2 glass-btn" @click="pushQuickEvent(item, 'Dağıtımda')">Dağıtımda</v-btn>
                    <v-btn x-small color="success" dark class="mr-2" @click="pushQuickEvent(item, 'Teslim Edildi')">Teslim</v-btn>
                    <v-btn x-small color="orange" dark class="mr-2" @click="pushQuickEvent(item, 'İade Sürecinde')">İade</v-btn>
                    <v-btn x-small outlined @click="openDetailDrawer(item)">Tüm Detay</v-btn>
                  </div>
                </v-card>
              </td>
            </template>

            <template v-slot:footer.prepend>
              <div class="px-4 py-2">
                <v-chip small class="mr-2">Seçili: {{ selected.length }}</v-chip>
                <v-chip small color="teal" text-color="white" class="mr-2">Kargoda: {{ countBy('Kargoya Verildi') }}</v-chip>
                <v-chip small color="blue" text-color="white" class="mr-2">Dağıtımda: {{ countBy('Dağıtımda') }}</v-chip>
                <v-chip small color="green" text-color="white" class="mr-2">Teslim: {{ countBy('Teslim Edildi') }}</v-chip>
                <v-chip small color="orange" text-color="white">İade: {{ countBy('İade Sürecinde') }}</v-chip>
              </div>
            </template>
          </v-data-table>
        </v-card>

        <v-card class="mt-4" outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Kargo Manifest (Filtre/Seçim)</v-card-title>
          <v-card-text>
            <div class="caption grey--text mb-2">Tarih: {{ fmtDate(new Date()) }}</div>
            <div v-for="s in manifestList" :key="'m' + s.id" class="mb-2">
              <div class="d-flex">
                <div class="font-weight-bold mr-2">#{{ s.orderId }}</div>
                <div class="mr-2">{{ s.customer }}</div>
                <div class="grey--text">{{ shortAddress(s) }}</div>
                <v-spacer /><div>{{ s.carrier }} — {{ s.trackingNo }}</div>
              </div>
            </div>
            <div v-if="manifestList.length === 0" class="grey--text">Seçim/filtre ile manifest oluştur.</div>
          </v-card-text>
        </v-card>
      </v-container>
    </div>

    <v-navigation-drawer v-model="drawer.open" right temporary app width="480" class="elevation-12">
      <v-toolbar flat>
        <v-toolbar-title class="subtitle-1 font-weight-bold">Kargo Detayı</v-toolbar-title>
        <v-spacer /><v-btn icon @click="drawer.open = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-divider />
      <v-container class="py-4" v-if="drawer.item">
        <div class="subtitle-1 font-weight-bold mb-2">#{{ drawer.item.orderId }} — {{ drawer.item.customer }}</div>
        <div class="mb-1"><v-chip x-small :color="statusColor(drawer.item.status)" text-color="white">{{ drawer.item.status }}</v-chip></div>
        <div class="mb-2">
          <div class="caption grey--text">Adres</div>
          <div>{{ drawer.item.address }}, {{ drawer.item.city }} {{ drawer.item.district }}</div>
          <div class="caption grey--text mt-1">Telefon / E-posta</div>
          <div>{{ drawer.item.phone }} — {{ drawer.item.email || '-' }}</div>
        </div>

        <v-simple-table dense class="mb-2">
          <tbody>
          <tr><td>Kargo</td><td class="text-right">{{ drawer.item.carrier }} <span v-if="drawer.item.service">({{ drawer.item.service }})</span></td></tr>
          <tr><td>Takip No</td><td class="text-right">{{ drawer.item.trackingNo }}</td></tr>
          <tr><td>Oluşturma</td><td class="text-right">{{ fmtDateTime(drawer.item.createdAt) }}</td></tr>
          <tr><td>Eta</td><td class="text-right">{{ drawer.item.eta ? fmtDate(drawer.item.eta) : '-' }}</td></tr>
          <tr><td>Kapıda Ödeme</td><td class="text-right">{{ drawer.item.cod ? tl(drawer.item.codAmount || 0) : 'Yok' }}</td></tr>
          <tr><td>Kargo Ücreti</td><td class="text-right">{{ tl(drawer.item.shippingFee || 0) }}</td></tr>
          <tr><td>Ağırlık</td><td class="text-right">{{ (drawer.item.weight || 0).toFixed(2) }} kg</td></tr>
          <tr><td>Platform</td><td class="text-right">{{ drawer.item.platform }}</td></tr>
          </tbody>
        </v-simple-table>

        <div class="subtitle-2 font-weight-bold mb-1">Zaman Çizelgesi</div>
        <v-timeline dense>
          <v-timeline-item v-for="(e, i) in drawer.item.events" :key="i" :color="eventColor(e.code)" small>
            <div class="font-weight-medium">{{ e.desc }}</div>
            <div class="caption grey--text">{{ fmtDateTime(e.time) }} • {{ e.location || '-' }}</div>
          </v-timeline-item>
          <div v-if="!drawer.item.events || drawer.item.events.length === 0" class="grey--text caption">Olay yok.</div>
        </v-timeline>

        <v-card outlined class="mt-2">
          <v-card-title class="subtitle-2 font-weight-bold">Olay Ekle</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6"><v-select v-model="eventForm.code" :items="eventCodeOptions" dense outlined label="Kod" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="eventForm.desc" dense outlined label="Açıklama" /></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" md="6"><v-text-field v-model="eventForm.location" dense outlined label="Lokasyon" /></v-col>
              <v-col cols="6" md="6"><v-text-field v-model="eventForm.time" type="datetime-local" dense outlined label="Zaman" /></v-col>
            </v-row>
            <div class="caption grey--text">* Olay eklemek durumu otomatik günceller.</div>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn text @click="clearEventForm">Temizle</v-btn>
            <v-spacer /><v-btn :color="accent" dark @click="addEvent">Ekle</v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-navigation-drawer>

    <div id="labelPrint" v-if="label.item" class="pa-4">
      <div class="label-box">
        <div class="d-flex justify-space-between">
          <div class="subtitle-1 font-weight-bold">{{ label.item.carrier }}</div>
          <div>#{{ label.item.orderId }}</div>
        </div>
        <div class="mt-2"><strong>{{ label.item.customer }}</strong></div>
        <div>{{ label.item.address }}</div>
        <div>{{ label.item.city }} / {{ label.item.district }}</div>
        <div class="mt-2">Tel: {{ label.item.phone }}</div>
        <div class="mt-1">Takip: {{ label.item.trackingNo }}</div>
        <div class="mt-1">Ağırlık: {{ (label.item.weight || 0).toFixed(2) }} kg</div>
        <div class="mt-1">COD: {{ label.item.cod ? tl(label.item.codAmount || 0) : 'YOK' }}</div>
      </div>
    </div>

    <v-dialog v-model="dialogs.shipment" max-width="720px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">{{ form.id ? 'Kargo Düzenle' : 'Yeni Kargo' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <v-row dense>
              <v-col cols="6" md="3"><v-text-field v-model="form.orderId" dense outlined label="Sipariş No" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="form.platform" dense outlined label="Platform" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="form.customer" dense outlined label="Müşteri" /></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" md="6"><v-text-field v-model="form.phone" dense outlined label="Telefon" /></v-col>
              <v-col cols="6" md="6"><v-text-field v-model="form.email" dense outlined label="E-posta" /></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12" md="8"><v-text-field v-model="form.address" dense outlined label="Adres" /></v-col>
              <v-col cols="6" md="2"><v-text-field v-model="form.city" dense outlined label="Şehir" /></v-col>
              <v-col cols="6" md="2"><v-text-field v-model="form.district" dense outlined label="İlçe" /></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" md="3"><v-select v-model="form.carrier" :items="carrierOptions" dense outlined label="Kargo" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="form.service" dense outlined label="Servis (Std/Ekspres)" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="form.trackingNo" dense outlined label="Takip No" :append-outer-icon="'mdi-autorenew'" @click:append-outer="autofillTracking" /></v-col>
              <v-col cols="6" md="3"><v-select v-model="form.status" :items="statusOptions" dense outlined label="Durum" /></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" md="3"><v-text-field v-model.number="form.items" type="number" min="1" dense outlined label="Adet" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model.number="form.weight" type="number" min="0" step="0.01" dense outlined label="Ağırlık (kg)" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model.number="form.shippingFee" type="number" min="0" dense outlined label="Kargo Ücreti" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="form.createdAt" type="datetime-local" dense outlined label="Oluşturma" /></v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" md="3"><v-text-field v-model="form.shippedAt" type="datetime-local" dense outlined label="Kargoya Veriliş" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="form.eta" type="date" dense outlined label="ETA" /></v-col>
              <v-col cols="6" md="3"><v-switch v-model="form.cod" inset hide-details label="Kapıda Ödeme" /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model.number="form.codAmount" :disabled="!form.cod" type="number" dense outlined label="COD Tutar" /></v-col>
            </v-row>
            <v-textarea v-model="form.note" dense outlined label="Not" rows="2" />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.shipment = false">Vazgeç</v-btn>
          <v-spacer /><v-btn :color="accent" dark @click="saveShipment">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogs.bulk" max-width="480px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">Toplu Durum Güncelle</v-card-title>
        <v-card-text>
          <v-select v-model="bulkStatus" :items="statusOptions" label="Durum Seç" dense outlined />
          <div class="caption grey--text">Seçili {{ selected.length }} gönderi güncellenecek.</div>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.bulk = false">Vazgeç</v-btn>
          <v-spacer /><v-btn :color="accent" dark :disabled="!bulkStatus" @click="applyBulkStatus">Uygula</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2200">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
import { get, reloadDb, ready } from '@/utils/harddata'

export default {
  name: 'KargoPage',
  data() {
    return {
      mainDrawer: true,
      mini: false,
      accent: localStorage.getItem('jp_accent') || '#5865F2',
      accents: ['#5865F2', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4', '#8B5CF6'],
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
      quick: 'today',
      filters: { q: '', startDate: '', endDate: '', carrier: null, status: null, onlyIssues: false, codOnly: false },
      carrierOptions: ['Yurtiçi', 'Aras', 'MNG', 'Sürat', 'PTT', 'UPS', 'Diğer'],
      statusOptions: ['Hazırlanıyor', 'Kargoya Verildi', 'Dağıtımda', 'Teslim Edildi', 'İade Sürecinde', 'İade Alındı', 'Adres Yetersiz', 'Hasarlı'],
      eventCodeOptions: ['INFO', 'SHIPPED', 'OUT', 'DELIVER', 'HOLD', 'HUB_IN', 'CUSTOM'],
      shipments: [],
      headers: [
        { text: 'Kargo', value: 'carrier', width: 140 },
        { text: 'Gönderi', value: 'shipment', width: 320 },
        { text: 'Platform', value: 'platform', width: 110 },
        { text: 'Adet', value: 'items', align: 'end', width: 80 },
        { text: 'Ağırlık', value: 'weight', align: 'end', width: 90 },
        { text: 'Takip No', value: 'trackingNo', width: 160 },
        { text: 'Durum', value: 'status', width: 140 },
        { text: 'Son Olay', value: 'lastEvent', width: 260 },
        { text: 'ETA', value: 'eta', width: 110 },
        { text: 'K.Odeme', value: 'cod', width: 120 },
        { text: '', value: 'ops', sortable: false, align: 'end', width: 150 }
      ],
      selected: [],
      expanded: [],
      drawer: { open: false, item: null },
      eventForm: { code: 'INFO', desc: '', location: '', time: '' },
      dialogs: { shipment: false, bulk: false },
      form: { id: null, orderId: '', platform: '', customer: '', phone: '', email: '', address: '', city: '', district: '', carrier: 'Yurtiçi', service: 'Standart', trackingNo: '', status: 'Hazırlanıyor', items: 1, weight: 0, shippingFee: 0, cod: false, codAmount: 0, createdAt: '', shippedAt: '', eta: '', note: '' },
      bulkStatus: null,
      label: { item: null },
      snack: { show: false, color: 'green', text: '' },
      quickActions: [
        { to: 'satis', icon: 'mdi-cash-register', title: 'Hızlı Satış', subtitle: 'Yeni satış fişi', key: 'S' },
        { to: 'kargo', icon: 'mdi-truck-fast', title: 'Yeni Kargo', subtitle: 'Gönderi oluştur', key: 'K' },
        { to: 'stok', icon: 'mdi-archive-plus', title: 'Stok Girişi', subtitle: 'Depo güncelle', key: 'G' },
        { to: 'raporlar', icon: 'mdi-chart-line', title: 'Raporlar', subtitle: 'Satış & Stok', key: 'R' }
      ]
    }
  },
  async created() {
    await ready()
    this.loadFromDb()
    this.setQuick('today')
  },
  computed: {
    rangeStart() { return this.parseDate(this.filters.startDate) },
    rangeEnd() { return this.parseDate(this.filters.endDate, true) },
    filtered() {
      const q = (this.filters.q || '').toLowerCase().trim()
      return this.shipments.filter(s => {
        const inRange = (!this.rangeStart || s.createdAt >= this.rangeStart) && (!this.rangeEnd || s.createdAt <= this.rangeEnd)
        const txt = [s.orderId, s.customer, s.phone, s.address, s.trackingNo].join(' ').toLowerCase()
        const qok = q ? txt.includes(q) : true
        const cok = this.filters.carrier ? s.carrier === this.filters.carrier : true
        const sok = this.filters.status ? s.status === this.filters.status : true
        const issueOk = this.filters.onlyIssues ? this.isIssue(s.status) : true
        const codOk = this.filters.codOnly ? !!s.cod : true
        return inRange && qok && cok && sok && issueOk && codOk
      }).sort((a, b) => b.createdAt - a.createdAt)
    },
    kpis() {
      const now = new Date()
      const days = (a, b) => Math.max(0, Math.round((a - b) / (1000 * 60 * 60 * 24)))
      const delivered = this.filtered.filter(s => s.status === 'Teslim Edildi')
      let avgDays = 0
      if (delivered.length) {
        const sum = delivered.reduce((t, s) => {
          const evs = Array.isArray(s.events) ? s.events : []
          const del = evs.find(e => e.code === 'DELIVER')
          const end = del && del.time ? new Date(del.time) : s.createdAt
          return t + days(end, s.createdAt)
        }, 0)
        avgDays = Math.round(sum / delivered.length)
      }
      const delayed = this.filtered.filter(s => (s.status === 'Kargoya Verildi' || s.status === 'Dağıtımda') && ((now - (s.shippedAt || s.createdAt)) > 5 * 24 * 60 * 60 * 1000))
      return [
        { key: 'prep', title: 'Hazırlanıyor', value: String(this.countBy('Hazırlanıyor')) },
        { key: 'ship', title: 'Kargoda', value: String(this.countBy('Kargoya Verildi')) },
        { key: 'out', title: 'Dağıtımda', value: String(this.countBy('Dağıtımda')) },
        { key: 'done', title: 'Teslim', value: String(this.countBy('Teslim Edildi')) },
        { key: 'late', title: 'Geciken', value: String(delayed.length), sub: '>5 gün' },
        { key: 'avg', title: 'Ort. Teslim', value: delivered.length ? (avgDays + ' gün') : '-' }
      ]
    },
    manifestList() { return (this.selected.length > 0 ? this.selected : this.filtered).slice(0, 50) },
    themeLabel() { return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' }
  },
  methods: {
    setAccent(c) { this.accent = c; localStorage.setItem('jp_accent', c) },
    cycleTheme() { this.$vuetify.theme.dark = !this.$vuetify.theme.dark },
    loadFromDb() {
      const raw = get('shipments') || []
      this.shipments = this.normalizeShipments(raw)
    },
    async refreshFromDb() {
      try { await reloadDb(); this.loadFromDb(); this.toast('Veri yenilendi') }
      catch (e) { console.error(e); this.toast('Yenileme başarısız', 'red') }
    },
    setQuick(mode) {
      this.quick = mode
      const d = new Date()
      const p = v => String(v).padStart(2, '0')
      const today = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
      if (mode === 'today') {
        this.filters.startDate = today
        this.filters.endDate = today
      } else if (mode === '7d') {
        const d2 = new Date(d); d2.setDate(d2.getDate() - 6)
        this.filters.startDate = `${d2.getFullYear()}-${p(d2.getMonth() + 1)}-${p(d2.getDate())}`
        this.filters.endDate = today
      } else if (mode === 'month') {
        const d2 = new Date(d.getFullYear(), d.getMonth(), 1)
        this.filters.startDate = `${d2.getFullYear()}-${p(d2.getMonth() + 1)}-${p(d2.getDate())}`
        this.filters.endDate = today
      }
    },
    tl(n) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n || 0) },
    toast(t, c = 'green') { this.snack = { show: true, color: c, text: t } },
    fmtDate(d) { const p = v => String(v).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` },
    fmtDateTime(d) { const dt = (d instanceof Date) ? d : new Date(d); const p = v => String(v).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}` },
    fmtRange(s, e) { if (!s || !e) return '-'; return `${this.fmtDate(s)} → ${this.fmtDate(e)}` },
    parseDate(s, end = false) { if (!s) return null; const d = new Date(s + 'T00:00:00'); if (end) d.setHours(23, 59, 59, 999); return isNaN(d) ? null : d },
    shortAddress(s) { return `${s.address}, ${s.city}/${s.district}` },
    statusColor(st) { return st === 'Teslim Edildi' ? 'green' : st === 'Dağıtımda' ? 'blue' : st === 'Kargoya Verildi' ? 'teal' : st === 'Hazırlanıyor' ? 'grey' : st === 'İade Sürecinde' ? 'orange' : st === 'İade Alındı' ? 'indigo' : st === 'Adres Yetersiz' ? 'red' : st === 'Hasarlı' ? 'red darken-2' : 'grey' },
    isIssue(st) { return ['İade Sürecinde', 'İade Alındı', 'Adres Yetersiz', 'Hasarlı'].includes(st) },
    eventColor(code) { return code === 'DELIVER' ? 'green' : code === 'OUT' ? 'blue' : code === 'SHIPPED' ? 'teal' : code === 'HOLD' ? 'orange' : code === 'HUB_IN' ? 'indigo' : 'grey' },
    countBy(st) { return this.filtered.filter(x => x.status === st).length },
    onQuickEnter() { const q = (this.filters.q || '').trim(); if (!q) return; const s = this.shipments.find(x => String(x.trackingNo).toLowerCase() === q.toLowerCase() || String(x.orderId) === q); if (s) { this.openDetailDrawer(s) } },
    openTracking(item) { const url = `https://www.google.com/search?q=${encodeURIComponent(item.carrier + ' kargo takip ' + item.trackingNo)}`; window.open(url, '_blank') },
    openDetailDrawer(item) { this.drawer.item = item; this.drawer.open = true; this.clearEventForm() },
    clearEventForm() { const d = new Date(); const p = v => String(v).padStart(2, '0'); this.eventForm = { code: 'INFO', desc: '', location: '', time: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}` } },
    addEvent() {
      const it = this.drawer.item; if (!it) return;
      const { code, desc, location, time } = this.eventForm;
      if (!desc) { this.toast('Açıklama gir', 'red'); return }
      const ev = { code, desc, location, time: new Date(time) };
      it.events = it.events || []; it.events.unshift(ev);
      if (code === 'DELIVER') it.status = 'Teslim Edildi';
      else if (code === 'OUT') it.status = 'Dağıtımda';
      else if (code === 'SHIPPED') it.status = 'Kargoya Verildi';
      else if (code === 'HOLD') it.status = 'Adres Yetersiz';
      this.toast('Olay eklendi'); this.clearEventForm()
    },
    pushQuickEvent(item, status) {
      const map = {
        'Kargoya Verildi': { code: 'SHIPPED', desc: 'Kargoya verildi' },
        'Dağıtımda': { code: 'OUT', desc: 'Dağıtıma çıktı' },
        'Teslim Edildi': { code: 'DELIVER', desc: 'Teslim edildi' },
        'İade Sürecinde': { code: 'HOLD', desc: 'İade/İşlem bekliyor' }
      };
      const e = map[status]; if (!e) return;
      item.status = status;
      item.events = item.events || [];
      item.events.unshift({ time: new Date(), code: e.code, desc: e.desc, location: item.city });
      this.toast('Durum güncellendi')
    },
    openShipmentDialog(s = null) {
      this.dialogs.shipment = true;
      this.form = s
          ? { ...s, createdAt: this.toLocalInput(s.createdAt), shippedAt: this.toLocalInput(s.shippedAt), eta: this.toInputDate(s.eta) }
          : { id: null, orderId: '', platform: '', customer: '', phone: '', email: '', address: '', city: '', district: '', carrier: 'Yurtiçi', service: 'Standart', trackingNo: '', status: 'Hazırlanıyor', items: 1, weight: 0, shippingFee: 0, cod: false, codAmount: 0, createdAt: this.toLocalInput(new Date()), shippedAt: '', eta: '', note: '' }
    },
    autofillTracking() { const prefix = (this.form.carrier || 'KG').slice(0, 2).toUpperCase(); this.form.trackingNo = `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}TR` },
    saveShipment() { this.dialogs.shipment = false; this.toast('Kaydedildi') },
    removeShipment(s) { if (confirm(`#${s.orderId} kargoyu silmek istiyor musun?`)) { const i = this.shipments.findIndex(x => x.id === s.id); if (i > -1) this.shipments.splice(i, 1); this.toast('Kargo silindi') } },
    openBulkStatusDialog() { this.dialogs.bulk = true; this.bulkStatus = null },
    applyBulkStatus() { if (!this.bulkStatus) return; this.selected.forEach(s => this.pushQuickEvent(s, this.bulkStatus)); this.dialogs.bulk = false; this.toast('Toplu durum güncellendi') },
    yazdirManifest() { window.print() },
    printLabel(item) { this.label.item = item; this.$nextTick(() => window.print()); setTimeout(() => this.label.item = null, 800) },
    exportCSV() { this.toast('CSV hazırlandı') },
    toLocalInput(d) { const dt = (d instanceof Date) ? d : new Date(d); if (isNaN(dt)) return ''; const p = v => String(v).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}T${p(dt.getHours())}:${p(dt.getMinutes())}` },
    toInputDate(d) { const dt = (d instanceof Date) ? d : new Date(d); if (isNaN(dt)) return ''; const p = v => String(v).padStart(2, '0'); return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}` },
    fromLocalInput(s) { if (!s) return null; const d = new Date(s); return isNaN(d) ? null : d },
    normalizeShipments(arr) {
      return (arr || []).map(s => {
        const c = { ...s }
        if (c.createdAt && !(c.createdAt instanceof Date)) c.createdAt = new Date(c.createdAt)
        if (c.shippedAt && !(c.shippedAt instanceof Date)) c.shippedAt = new Date(c.shippedAt)
        if (c.eta && !(c.eta instanceof Date)) c.eta = new Date(c.eta)
        c.events = Array.isArray(c.events) ? c.events.map(e => ({ ...e, time: (e.time instanceof Date) ? e.time : new Date(e.time) })) : []
        return c
      })
    }
  }
}
</script>

<style scoped>
.theme--dark .edge-rail::after{ opacity:.35 }
.theme--light .edge-rail::after{ opacity:.55 }
.hero{ position:relative; height:120px; overflow:hidden; border-bottom:1px solid rgba(0,0,0,.04); background:linear-gradient(180deg, #fff, #fafafa) }
.theme--dark .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10) }
.hero-glow{ position:absolute; inset:-30%; background:radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%), radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%), linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%); animation:float 16s ease-in-out infinite; filter:blur(42px); opacity:.55 }
.theme--dark .hero-glow{ opacity:.35 }
.hero-content{ position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding:12px 24px }
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px }
.hero-sub{ opacity:.8 }
.filters-sheet{ border-radius:16px; padding:14px 16px; border:1px solid rgba(0,0,0,.06); background:rgba(255,255,255,.75); backdrop-filter:blur(8px) saturate(120%) }
.theme--dark .filters-sheet{ border-color:rgba(255,255,255,.06); background:rgba(24,24,24,.7) }
.glass-btn{ background:rgba(255,255,255,.6); border:1px solid rgba(0,0,0,.06) }
.theme--dark .glass-btn{ background:rgba(24,24,24,.6); border-color:rgba(255,255,255,.08) }
.qa{ display:flex; align-items:center; padding:10px 14px; margin-right:12px; border-radius:14px; border:1px solid transparent; background:rgba(255,255,255,.7); backdrop-filter:blur(6px); transition:transform .2s ease, box-shadow .2s ease }
.theme--dark .qa{ background:rgba(30,30,30,.7) }
.qa:hover{ transform:translateY(-3px); box-shadow:0 10px 20px rgba(0,0,0,.08) }
.kpi{ border-radius:14px; position:relative; overflow:hidden }
.kpi-glow{ content:''; position:absolute; inset:0 0 auto 0; height:6px; background:linear-gradient(90deg, var(--accent), transparent); opacity:.9 }
.table-card{ border-radius:16px; overflow:hidden }
.link{ color:var(--accent) !important }
.elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#fafafa,#f4f6f8) }
.theme--dark .elevated-datatable ::v-deep thead th{ background:linear-gradient(180deg,#1d1d1d,#181818) }
.elevated-datatable ::v-deep tbody tr:hover{ background:rgba(0,0,0,.02) }
.theme--dark .elevated-datatable ::v-deep tbody tr:hover{ background:rgba(255,255,255,.04) }
.label-box{ border:2px dashed #333; border-radius:8px; padding:12px; width:360px; background:#fff }
@media print{ .edge-rail{ display:none !important } body *{ visibility:hidden !important } #manifestPrint, #manifestPrint *{ visibility:visible !important } #labelPrint, #labelPrint *{ visibility:visible !important } #manifestPrint, #labelPrint{ position:absolute; left:0; top:0; width:100% } }
@keyframes float{ 0%{ transform:translate3d(0,0,0) rotate(0deg) } 50%{ transform:translate3d(2%,-2%,0) rotate(1deg) } 100%{ transform:translate3d(0,0,0) rotate(0deg) } }
</style>

<style>
.v-main__wrap{ padding-top:0 !important }
</style>
