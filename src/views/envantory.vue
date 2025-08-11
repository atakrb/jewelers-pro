<template>
  <v-app>
    <!-- SABİT APP BAR -->
    <v-app-bar app color="deep-purple" dark>
      <v-app-bar-nav-icon @click="drawer = true"/>
      <v-toolbar-title>ENVANTER</v-toolbar-title>
    </v-app-bar>

    <!-- DRAWER -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list nav dense>
        <v-list-item-group v-model="group" active-class="deep-purple--text text--accent-4">
          <v-list-item>
            <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container >
        <v-card elevation="0" class="pa-3 rounded-lg"  outlined>
          <div class="d-flex align-center" >
            <v-icon class="mr-2">mdi-file-document-arrow-right-outline</v-icon>
            <div class="title font-weight-medium">Envanter</div>
            <v-spacer/>
            <v-btn small outlined class="ml-2" @click="addRandom">Ürün ekle</v-btn>
          </div>

          <!-- ARAMA -->
          <v-form v-model="valid" class="ma-3">
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field
                    v-model="idQuery"
                    :rules="idRules"
                    :counter="10"
                    label="Hızlı Ara..."
                />
              </v-col>
            </v-row>
          </v-form>

          <!-- TABLO -->
          <v-simple-table fixed-header height="500px" class="mt-3">
            <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Ürün Adı</th>
              <th class="text-left">Kategori</th>
              <th class="text-left">Karat</th>
              <th class="text-left">Ağırlık (gr)</th>
              <th class="text-left">Fiyat (₺)</th>
              <th class="text-left">Stok</th>
              <th class="text-left">Eklendi</th>
              <th class="text-left">Seçenekler</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="item in filtered" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.karat }}</td>
              <td>{{ item.weight }}</td>
              <td>{{ item.price }}</td>
              <td>{{ item.stock }}</td>
              <td>{{ item.added_at }}</td>
              <td class="text-no-wrap">
                <v-btn x-small icon color="error" class="ml-2" @click="deleteItem(item.id)">
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
            </tbody>
          </v-simple-table>

        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

type InventoryItem = {
  id: number
  name: string
  category: string
  karat: number  // 14, 22, 18.00 vb.
  weight: number // gram
  price: number  // ₺
  stock: number
  added_at: string // YYYY-MM-DD
}

type QtyMap = Record<number, number>

@Component
export default class EnvantoryPage extends Vue {
  drawer = false
  group = 0
  valid = true

  // mevcut filtre alanların kalsın
  idQuery = ''
  nameQuery = ''
  priceQuery = ''

  // === GÜNCEL: yeni şemaya göre veri ===
  envatory: InventoryItem[] = [
    { id: 1,  name: '14 Ayar Altın Bilezik', category: 'Altın',    karat: 14.00, weight: 12.50, price: 8500.00,  stock: 5,  added_at: '2025-08-01' },
    { id: 2,  name: '22 Ayar Altın Zincir',  category: 'Altın',    karat: 22.00, weight: 18.20, price: 12500.00, stock: 3,  added_at: '2025-08-02' },
    { id: 3,  name: 'Pırlanta Tektaş Yüzük', category: 'Pırlanta', karat: 18.00, weight: 5.20,  price: 18500.00, stock: 2,  added_at: '2025-08-03' },
    { id: 4,  name: 'Gümüş Küpe',           category: 'Gümüş',    karat: 0.00,  weight: 3.10,  price: 750.00,   stock: 15, added_at: '2025-08-04' },
    { id: 5,  name: 'Altın Kolye Ucu',      category: 'Altın',    karat: 14.00, weight: 2.80,  price: 3200.00,  stock: 12, added_at: '2025-08-05' },
    { id: 6,  name: 'Pırlanta Bileklik',    category: 'Pırlanta', karat: 18.00, weight: 7.40,  price: 21500.00, stock: 1,  added_at: '2025-08-05' },
    { id: 7,  name: 'Gümüş Yüzük',          category: 'Gümüş',    karat: 0.00,  weight: 4.00,  price: 900.00,   stock: 20, added_at: '2025-08-06' },
    { id: 8,  name: 'Altın Alyans',         category: 'Altın',    karat: 14.00, weight: 6.30,  price: 5600.00,  stock: 7,  added_at: '2025-08-06' },
    { id: 9,  name: 'Pırlanta Küpe',        category: 'Pırlanta', karat: 18.00, weight: 4.60,  price: 14500.00, stock: 3,  added_at: '2025-08-07' },
    { id: 10, name: '14 Ayar Zincir Blk.',  category: 'Altın',    karat: 14.00, weight: 8.10,  price: 7800.00,  stock: 6,  added_at: '2025-08-08' }
  ]

  quantities: QtyMap = {}

  idRules = [(v: string) => v.length <= 10 || 'Max 10 karakter']
  nameRules = [(v: string) => v.length <= 100 || 'Max 100 karakter']
  priceRules = [(v: string) => /^\d*(\.\d+)?$/.test(v) || 'Sayı girin']

  created() {
    this.envatory.forEach(p => this.$set(this.quantities, p.id, 0))
  }

  get filtered(): InventoryItem[] {
    const idQ = this.idQuery.trim()
    const nameQ = this.nameQuery.trim().toLowerCase()
    const priceQ = this.priceQuery.trim()

    return this.envatory.filter(i => {
      const byId = idQ ? String(i.id).includes(idQ) : true
      const byName = nameQ ? i.name.toLowerCase().includes(nameQ) : true
      const byPrice = priceQ ? String(i.price).includes(priceQ) : true
      return byId && byName && byPrice
    })
  }

  deleteItem(id: number) {
    this.envatory = this.envatory.filter(p => p.id !== id)
    this.$delete(this.quantities, id)
  }

  addRandom() {
    const nextId = (this.envatory[this.envatory.length - 1]?.id || 0) + 1
    const item: InventoryItem = {
      id: nextId,
      name: `Yeni Ürün ${nextId}`,
      category: 'Altın',
      karat: 14.00,
      weight: Number((Math.random()*10 + 1).toFixed(2)),
      price: Math.floor(Math.random()*5000)+1000,
      stock: Math.floor(Math.random()*10)+1,
      added_at: new Date().toISOString().slice(0,10)
    }
    this.envatory.push(item)
    this.$set(this.quantities, item.id, 0)
  }

}
</script>


<style scoped>
/* ufak animasyon ve düzen */
.price-tile { transition: transform .15s ease; }
.price-tile:hover { transform: translateY(-2px); }
</style>
