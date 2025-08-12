<template>
  <v-container>
    <v-row dense>
      <!-- SOL: Arama + Ürünler + Sepet -->
      <v-col cols="12" md="8">
        <!-- Arama -->
        <v-card class="mb-4" outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Ürün Arama</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6" md="3">
                <v-text-field v-model="q.id" label="ID" dense outlined clearable />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field v-model="q.isim" label="İsim" dense outlined clearable />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field v-model="q.karat" label="Karat" dense outlined clearable />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field v-model="q.ayar" label="Ayar" dense outlined clearable />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Ürün Listesi -->
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Ürünler</v-card-title>
          <v-data-table
              :headers="headers"
              :items="filteredProducts"
              dense
              disable-pagination
              hide-default-footer
          >
            <template v-slot:item.fiyat="{ item }">
              {{ tl(item.fiyat) }}
            </template>

            <!-- Dinamik kalan stok göster -->
            <template v-slot:item.stok="{ item }">
              <v-chip
                  :color="remainingStock(item) > 0 ? (remainingStock(item) <= 5 ? 'orange' : 'green') : 'red'"
                  text-color="white"
                  small
              >
                {{ remainingStock(item) }}
              </v-chip>
            </template>

            <template v-slot:item.islem="{ item }">
              <div class="d-flex align-center">
                <v-text-field
                    v-model.number="tempQty[item.id]"
                    type="number"
                    min="1"
                    :placeholder="'Adet'"
                    dense
                    hide-details
                    class="mr-2"
                    style="max-width:90px"
                />
                <v-btn
                    small color="indigo" dark
                    :disabled="remainingStock(item) <= 0"
                    @click="sepeteEkle(item)"
                >
                  Ekle
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>

        <!-- Sepet -->
        <v-card class="mt-4" outlined>
          <v-card-title class="subtitle-1 font-weight-bold">Sepet</v-card-title>
          <v-card-text>
            <div v-if="sepet.length === 0" class="grey--text">Sepet boş.</div>

            <v-list two-line v-else>
              <v-list-item v-for="(s, i) in sepet" :key="s.id" class="px-0">
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">
                    {{ s.isim }} — {{ s.karat }}k ({{ s.ayar }})
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Adet:
                    <v-text-field
                        v-model.number="s.adet"
                        type="number" min="1"
                        dense hide-details
                        style="display:inline-block; max-width:80px"
                    />
                    × {{ tl(s.fiyat) }}
                    <span class="ml-2 caption grey--text">
                      (Kalan: {{ kalanStokSepeteGore(s.id) }})
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <div class="subtitle-2 font-weight-bold">{{ tl(s.adet * s.fiyat) }}</div>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn icon @click="sepettenCikar(i)"><v-icon>mdi-delete</v-icon></v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-divider class="my-3" />
            <div class="d-flex justify-space-between align-center">
              <div class="subtitle-1">Toplam:</div>
              <div class="headline font-weight-bold">{{ tl(sepetToplam) }}</div>
            </div>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn text @click="sepetiTemizle" :disabled="sepet.length===0">Sepeti Temizle</v-btn>
            <v-spacer/>
            <v-btn color="success" dark :disabled="sepet.length===0" @click="satisiOnayla">
              Satışı Onayla
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- SAĞ: Fiş Kutusu (YALNIZCA bu yazdırılır) -->
      <v-col cols="12" md="4">
        <v-card id="fisPrint" outlined class="sticky pa-2">
          <v-card-title class="subtitle-1 font-weight-bold">Fiş</v-card-title>
          <v-card-text>
            <div class="caption grey--text mb-2">
              {{ fis.onaylandi ? 'Satış Onaylandı' : 'Önizleme' }}
            </div>

            <div class="mb-2">
              <div><strong>Fiş No:</strong> {{ fis.no || '-' }}</div>
              <div><strong>Tarih:</strong> {{ fis.tarih || nowStr }}</div>
              <div><strong>Müşteri:</strong> {{ fis.musteri || 'Genel Müşteri' }}</div>
            </div>

            <v-divider class="my-2"/>

            <v-simple-table dense>
              <thead>
              <tr>
                <th class="text-left">Ürün</th>
                <th class="text-right">Adet</th>
                <th class="text-right">Tutar</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="s in fisKalemleri" :key="s.id">
                <td>{{ s.isim }} ({{ s.karat }}k)</td>
                <td class="text-right">{{ s.adet }}</td>
                <td class="text-right">{{ tl(s.adet * s.fiyat) }}</td>
              </tr>
              <tr v-if="fisKalemleri.length===0">
                <td colspan="3" class="grey--text text-center">Sepet boş</td>
              </tr>
              </tbody>
            </v-simple-table>

            <v-divider class="my-2"/>

            <div class="d-flex justify-space-between">
              <div>Ara Toplam</div>
              <div class="font-weight-bold">{{ tl(fisToplam) }}</div>
            </div>
            <div class="d-flex justify-space-between">
              <div>Vergi (%0)</div>
              <div class="font-weight-bold">{{ tl(0) }}</div>
            </div>
            <v-divider class="my-2"/>
            <div class="d-flex justify-space-between">
              <div class="subtitle-1 font-weight-bold">Genel Toplam</div>
              <div class="subtitle-1 font-weight-bold">{{ tl(fisToplam) }}</div>
            </div>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn block outlined :disabled="!fis.onaylandi" @click="yazdir">
              <v-icon left>mdi-printer</v-icon> Yazdır (Fiş)
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Uyarı -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "SatisPage",
  data() {
    return {
      // arama
      q: { id: "", isim: "", karat: "", ayar: "" },
      tempQty: {},
      // ürünler (stok alanı eklendi)
      products: [
        { id: 101, isim: "Altın Bilezik",  karat: 22, ayar: "22 Ayar", fiyat: 18500, stok: 3 },
        { id: 102, isim: "Altın Yüzük",    karat: 14, ayar: "14 Ayar", fiyat:  6200, stok: 0 },
        { id: 201, isim: "Gümüş Kolye",    karat:  0, ayar: "925",     fiyat:   950, stok: 12 },
        { id: 301, isim: "Pırlanta Küpe",  karat: 18, ayar: "18 Ayar", fiyat: 24500, stok: 6  },
      ],
      headers: [
        { text: "ID", value: "id", align: "start" },
        { text: "İsim", value: "isim" },
        { text: "Karat", value: "karat" },
        { text: "Ayar", value: "ayar" },
        { text: "Fiyat", value: "fiyat", align: "end" },
        { text: "Stok", value: "stok", align: "end" },
        { text: "", value: "islem", sortable: false, align: "end" },
      ],
      sepet: [],
      fis: { no: "", tarih: "", musteri: "Genel Müşteri", onaylandi: false, kalemler: [] },
      snackbar: { show: false, color: "red", text: "" },
    };
  },
  computed: {
    filteredProducts() {
      const { id, isim, karat, ayar } = this.q;
      return this.products.filter(p => {
        const idOk    = id    ? String(p.id).includes(String(id).trim()) : true;
        const isimOk  = isim  ? p.isim.toLowerCase().includes(isim.toLowerCase().trim()) : true;
        const karOk   = karat ? String(p.karat).includes(String(karat).trim()) : true;
        const ayarOk  = ayar  ? String(p.ayar).toLowerCase().includes(ayar.toLowerCase().trim()) : true;
        return idOk && isimOk && karOk && ayarOk;
      });
    },
    sepetToplam() {
      return this.sepet.reduce((t, s) => t + s.adet * s.fiyat, 0);
    },
    fisKalemleri() {
      return this.fis.onaylandi ? this.fis.kalemler : this.sepet;
    },
    fisToplam() {
      const list = this.fisKalemleri;
      return list.reduce((t, s) => t + s.adet * s.fiyat, 0);
    },
    nowStr() {
      return new Date().toLocaleString("tr-TR");
    }
  },
  methods: {
    tl(n) {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n || 0);
    },
    showError(msg) {
      this.snackbar.text = msg;
      this.snackbar.color = "red";
      this.snackbar.show = true;
    },
    // Ürünün sepettekiler düşüldükten sonra kalan stoğu
    remainingStock(item) {
      const sepette = this.sepet
          .filter(s => s.id === item.id)
          .reduce((t, s) => t + s.adet, 0);
      return Math.max(0, (item.stok || 0) - sepette);
    },
    kalanStokSepeteGore(productId) {
      const p = this.products.find(x => x.id === productId);
      return p ? this.remainingStock(p) : 0;
    },
    sepeteEkle(item) {
      const adet = Number(this.tempQty[item.id] || 1);
      if (adet < 1) return;

      const kalan = this.remainingStock(item);
      if (kalan <= 0) {
        this.showError("Stok yok!");
        return;
      }
      if (adet > kalan) {
        this.showError(`Yetersiz stok. Kalan: ${kalan}`);
        return;
      }

      const varMi = this.sepet.find(s => s.id === item.id);
      if (varMi) varMi.adet += adet;
      else this.sepet.push({ ...item, adet });

      this.$set(this.tempQty, item.id, 1);
      this.fis.onaylandi = false; // değiştiyse fiş önizleme
    },
    sepettenCikar(i) {
      this.sepet.splice(i, 1);
      this.fis.onaylandi = false;
    },
    sepetiTemizle() {
      this.sepet = [];
      this.fis.onaylandi = false;
    },
    satisiOnayla() {
      if (this.sepet.length === 0) return;

      // satış anında stok kontrolü (güvenlik)
      for (const s of this.sepet) {
        const p = this.products.find(x => x.id === s.id);
        if (!p) { this.showError(`Ürün bulunamadı: ${s.id}`); return; }
        if (s.adet > p.stok) {
          this.showError(`${p.isim} için yetersiz stok. Kalan: ${p.stok}`);
          return;
        }
      }

      // fiş oluştur
      const d = new Date();
      const pad = x => String(x).padStart(2, "0");
      this.fis.no = `S-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
      this.fis.tarih = d.toLocaleString("tr-TR");
      this.fis.kalemler = this.sepet.map(s => ({ ...s })); // fişi sabitle

      // stok düş
      this.sepet.forEach(s => {
        const p = this.products.find(x => x.id === s.id);
        if (p) p.stok = Math.max(0, (p.stok || 0) - s.adet);
      });

      this.fis.onaylandi = true;
      this.sepet = []; // sepeti boşalt
    },
    yazdir() {
      // CSS @media print ile yalnızca #fisPrint yazdırılacak
      window.print();
    }
  }
};
</script>

<style scoped>
.sticky { position: sticky; top: 16px; }

/* SADECE FİŞİ YAZDIR */
@media print {
  body * { visibility: hidden !important; }
  #fisPrint, #fisPrint * { visibility: visible !important; }
  #fisPrint { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>
