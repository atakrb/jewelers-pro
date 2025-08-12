<template>
  <v-container fluid class="py-4">
    <!-- FİLTRE / RAPOR TARİHİ -->
    <v-card class="mb-4" outlined>
      <v-card-text>
        <v-row dense align="center">
          <v-col cols="12" sm="6" md="3">
            <v-text-field
                v-model="reportDateStr"
                type="date"
                label="Rapor Tarihi"
                dense outlined clearable
            />
          </v-col>
          <v-col cols="12" sm="6" md="9" class="d-flex align-center">
            <v-chip class="mr-2" color="indigo" text-color="white" small>
              Gün: {{ dayOrders.length }} sipariş — {{ tl(sumTotal(dayOrders)) }}
            </v-chip>
            <v-chip class="mr-2" color="teal" text-color="white" small>
              Ay: {{ monthOrders.length }} — {{ tl(sumTotal(monthOrders)) }}
            </v-chip>
            <v-chip color="deep-purple" text-color="white" small>
              Yıl: {{ yearOrders.length }} — {{ tl(sumTotal(yearOrders)) }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 1. SATIR: GÜN / AY / YIL -->
    <v-row dense>
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Günlük Rapor</v-card-title>
          <v-data-table :headers="orderHeaders" :items="dayOrders" dense hide-default-footer>
            <template v-slot:item.birimFiyat="{ item }">{{ tl(item.birimFiyat) }}</template>
            <template v-slot:item.tutar="{ item }">{{ tl(item.tutar) }}</template>
          </v-data-table>
          <v-divider/>
          <div class="pa-3 d-flex justify-space-between">
            <span class="grey--text">Toplam</span>
            <strong>{{ tl(sumTotal(dayOrders)) }}</strong>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Aylık Rapor</v-card-title>
          <v-data-table :headers="orderHeaders" :items="monthOrders" dense hide-default-footer>
            <template v-slot:item.birimFiyat="{ item }">{{ tl(item.birimFiyat) }}</template>
            <template v-slot:item.tutar="{ item }">{{ tl(item.tutar) }}</template>
          </v-data-table>
          <v-divider/>
          <div class="pa-3 d-flex justify-space-between">
            <span class="grey--text">Toplam</span>
            <strong>{{ tl(sumTotal(monthOrders)) }}</strong>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Yıllık Rapor</v-card-title>
          <v-data-table :headers="orderHeaders" :items="yearOrders" dense hide-default-footer>
            <template v-slot:item.birimFiyat="{ item }">{{ tl(item.birimFiyat) }}</template>
            <template v-slot:item.tutar="{ item }">{{ tl(item.tutar) }}</template>
          </v-data-table>
          <v-divider/>
          <div class="pa-3 d-flex justify-space-between">
            <span class="grey--text">Toplam</span>
            <strong>{{ tl(sumTotal(yearOrders)) }}</strong>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 2. SATIR: EN ÇOK SATILANLAR / AZ KALAN STOK -->
    <v-row dense class="mt-4">
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">En Çok Satılanlar (Ay)</v-card-title>
          <v-data-table
              :headers="topsHeaders"
              :items="topSellersMonth"
              dense
              hide-default-footer
          >
            <template v-slot:item.ciro="{ item }">{{ tl(item.ciro) }}</template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Az Kalan Stok</v-card-title>
          <v-data-table
              :headers="lowHeaders"
              :items="lowStock"
              dense
              hide-default-footer
          >
            <template v-slot:item.stok="{ item }">
              <v-chip :color="item.stok <= 0 ? 'red' : item.stok <= 5 ? 'orange' : 'green'"
                      text-color="white" small>
                {{ item.stok }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 3. SATIR: KÜÇÜK LİSTE -->
    <v-row dense class="mt-4">
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Bugün Son 5 Satış</v-card-title>
          <v-list dense>
            <v-list-item v-for="o in last5Today" :key="o.id">
              <v-list-item-content>
                <v-list-item-title class="subtitle-2">
                  #{{ o.id }} — {{ o.urun }} ({{ o.adet }} adet)
                </v-list-item-title>
                <v-list-item-subtitle class="caption grey--text">
                  {{ fmtDateTime(o.tarih) }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="subtitle-2 font-weight-bold">
                {{ tl(o.tutar) }}
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="last5Today.length===0">
              <v-list-item-content class="grey--text">Kayıt yok.</v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Notlar</v-card-title>
          <v-card-text class="grey--text">
            Bu alanı uyarılar, hedefler veya kampanyalar için kullanabilirsin.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "RaporlarPage",
  data() {
    return {
      reportDateStr: this.toInputDate(new Date()),
      products: [
        { id: 101, isim: "Altın Bilezik",  karat: 22, ayar: "22 Ayar", fiyat: 18500, stok: 3 },
        { id: 102, isim: "Altın Yüzük",    karat: 14, ayar: "14 Ayar", fiyat:  6200, stok: 0 },
        { id: 201, isim: "Gümüş Kolye",    karat:  0, ayar: "925",     fiyat:   950, stok: 12 },
        { id: 301, isim: "Pırlanta Küpe",  karat: 18, ayar: "18 Ayar", fiyat: 24500, stok: 5  },
        { id: 401, isim: "Altın Kolye",    karat: 22, ayar: "22 Ayar", fiyat: 12900, stok: 2  },
      ],
      orders: [], // created() içinde örnek veri üretiyoruz
      orderHeaders: [
        { text: "No", value: "id", width: 70 },
        { text: "Tarih", value: "tarihKisa", width: 110 },
        { text: "Ürün", value: "urun" },
        { text: "Adet", value: "adet", align: "right", width: 70 },
        { text: "Birim", value: "birimFiyat", align: "right", width: 110 },
        { text: "Tutar", value: "tutar", align: "right", width: 120 },
      ],
      topsHeaders: [
        { text: "Ürün", value: "urun" },
        { text: "Adet", value: "adet", align: "right", width: 80 },
        { text: "Ciro", value: "ciro", align: "right", width: 120 },
      ],
      lowHeaders: [
        { text: "Ürün", value: "isim" },
        { text: "Stok", value: "stok", align: "right", width: 90 },
      ],
    };
  },
  created() {
    // örnek sipariş verisi (bugüne göre üret)
    this.orders = this.makeSampleOrders();
  },
  computed: {
    reportDate() { return this.parseInputDate(this.reportDateStr) || new Date(); },

    // Tüm siparişleri ürün bilgisi ile zenginleştir
    ordersEnriched() {
      return this.orders.map(o => {
        const p = this.products.find(x => x.id === o.productId) || {};
        const tarih = new Date(o.tarih);
        const tutar = o.adet * o.birimFiyat;
        return {
          ...o,
          urun: p.isim || o.urun || `Ürün ${o.productId}`,
          karat: p.karat, ayar: p.ayar,
          tarih,
          tarihKisa: this.fmtDate(tarih),
          tutar,
        };
      }).sort((a,b) => b.tarih - a.tarih);
    },

    dayOrders()   { return this.ordersEnriched.filter(o => this.isSameDay(o.tarih, this.reportDate)); },
    monthOrders() { return this.ordersEnriched.filter(o => this.isSameMonth(o.tarih, this.reportDate)); },
    yearOrders()  { return this.ordersEnriched.filter(o => this.isSameYear(o.tarih, this.reportDate)); },

    // En çok satılanlar (AY)
    topSellersMonth() {
      const map = {};
      this.monthOrders.forEach(o => {
        if (!map[o.productId]) map[o.productId] = { urun: o.urun, adet: 0, ciro: 0 };
        map[o.productId].adet += o.adet;
        map[o.productId].ciro += o.tutar;
      });
      return Object.values(map)
          .sort((a,b) => b.adet - a.adet)
          .slice(0, 8);
    },

    // Az kalan stok (küçükten büyüğe)
    lowStock() {
      return [...this.products]
          .sort((a,b) => (a.stok||0) - (b.stok||0))
          .slice(0, 8);
    },

    // Bugün son 5
    last5Today() {
      return this.dayOrders.slice(0, 5);
    },
  },
  methods: {
    // ---------- yardımcılar ----------
    tl(n) {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n || 0);
    },
    sumTotal(list) {
      return list.reduce((t, o) => t + (o.tutar || 0), 0);
    },
    fmtDate(d) {
      const p = v => String(v).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
    },
    fmtDateTime(d) {
      const p = v => String(v).padStart(2, "0");
      return `${this.fmtDate(d)} ${p(d.getHours())}:${p(d.getMinutes())}`;
    },
    toInputDate(d) {
      const p = v => String(v).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
    },
    parseInputDate(str) {
      if (!str) return null;
      const d = new Date(str + "T00:00:00");
      return isNaN(d) ? null : d;
    },
    isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); },
    isSameMonth(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth(); },
    isSameYear(a,b){ return a.getFullYear()===b.getFullYear(); },

    // ---------- örnek sipariş üretimi ----------
    makeSampleOrders() {
      const now = new Date();
      const shift = (d) => {
        const x = new Date(now);
        x.setDate(x.getDate() + d);
        x.setHours(10 + Math.floor(Math.random()*8), Math.floor(Math.random()*60));
        return x.toISOString();
      };
      const price = (pid) => (this.products.find(p => p.id===pid) || {}).fiyat || 1000;

      return [
        { id: 1,  tarih: shift(0),  productId: 101, adet: 1, birimFiyat: price(101) },
        { id: 2,  tarih: shift(0),  productId: 201, adet: 2, birimFiyat: price(201) },
        { id: 3,  tarih: shift(-1), productId: 301, adet: 1, birimFiyat: price(301) },
        { id: 4,  tarih: shift(-2), productId: 101, adet: 1, birimFiyat: price(101) },
        { id: 5,  tarih: shift(-6), productId: 401, adet: 3, birimFiyat: price(401) },
        { id: 6,  tarih: shift(-10),productId: 201, adet: 5, birimFiyat: price(201) },
        { id: 7,  tarih: shift(-15),productId: 101, adet: 1, birimFiyat: price(101) },
        { id: 8,  tarih: shift(-35),productId: 201, adet: 2, birimFiyat: price(201) },   // geçen ay
        { id: 9,  tarih: shift(-70),productId: 301, adet: 1, birimFiyat: price(301) },   // 2 ay önce
        { id: 10, tarih: shift(-200),productId: 101, adet: 1, birimFiyat: price(101) }, // bu yıl daha önce
        { id: 11, tarih: shift(-380),productId: 401, adet: 1, birimFiyat: price(401) }, // geçen yıl
        { id: 12, tarih: shift(-400),productId: 201, adet: 4, birimFiyat: price(201) }, // geçen yıl
      ];
    },
  }
};
</script>

<style scoped>
/* kartlar yuvarlak ve sade */
.v-card { border-radius: 16px; }
</style>
