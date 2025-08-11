<template>
  <v-app>
    <v-app-bar app color="deep-purple" dark>
      <v-app-bar-nav-icon @click="drawer = true"/>
      <v-toolbar-title>MÜŞTERİLER</v-toolbar-title>
    </v-app-bar>

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
      <v-container>
        <v-card elevation="0" class="pa-3 rounded-lg" outlined>
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            <div class="title font-weight-medium">Müşteriler</div>
            <v-spacer/>
            <v-text-field
                v-model="idQuery"
                dense
                outlined
                hide-details
                placeholder="Hızlı ara (ad/telefon/e-posta)..."
                prepend-inner-icon="mdi-magnify"
                class="ml-2"
                style="max-width: 360px"
            />
            <v-btn small outlined class="ml-2" @click="addCustomer">Müşteri ekle</v-btn>
          </div>

          <v-simple-table fixed-header height="500px" class="mt-3">
            <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Ad Soyad</th>
              <th class="text-left">Telefon</th>
              <th class="text-left">E-posta</th>
              <th class="text-left">Puan</th>
              <th class="text-left">Son Satış</th>
              <th class="text-left">İşlemler</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="c in filteredCustomers" :key="c.id">
              <td>{{ c.id }}</td>
              <td>{{ c.fullName }}</td>
              <td>{{ c.phone || '-' }}</td>
              <td>{{ c.email || '-' }}</td>
              <td>{{ c.points }}</td>
              <td>{{ c.lastSale || '—' }}</td>
              <td class="text-no-wrap">
                <v-btn x-small text @click="startSale(c.id)">
                  <v-icon small left>mdi-cart-plus</v-icon>Satış
                </v-btn>
                <v-btn x-small text @click="viewOrders(c.id)">
                  <v-icon small left>mdi-receipt-text</v-icon>Siparişler
                </v-btn>
                <v-btn x-small icon color="error" @click="deleteCustomer(c.id)">
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

type Customer = {
  id: number
  fullName: string
  phone?: string
  email?: string
  points: number
  lastSale?: string
}

@Component
export default class CustomersPage extends Vue {
  // UI
  drawer = false
  group = 0

  // arama
  idQuery = ''

  // veri (örnek)
  customers: Customer[] = [
    { id: 1, fullName: 'Ata KARABULUT', phone: '532-000-0000', email: 'ata@example.com', points: 260, lastSale: '2025-08-10' },
    { id: 2, fullName: 'Ali Demir',     phone: '533-111-2233', email: 'ali@example.com', points: 120, lastSale: '2025-08-09' },
    { id: 3, fullName: 'Mehmet Yılmaz', phone: '534-555-7788', email: 'mehmet@example.com', points: 0 },
    { id: 4, fullName: 'Ayşe Kaya',     phone: '535-444-9988', email: 'ayse@example.com', points: 40,  lastSale: '2025-08-05' },
    { id: 5, fullName: 'Elif Çetin',    phone: '536-123-4567', email: 'elif@example.com', points: 300, lastSale: '2025-08-03' },
    { id: 6, fullName: 'Ata KARABULUT', phone: '532-000-0000', email: 'ata@example.com', points: 260, lastSale: '2025-08-10' },
    { id: 7, fullName: 'Ali Demir',     phone: '533-111-2233', email: 'ali@example.com', points: 120, lastSale: '2025-08-09' },
    { id: 8, fullName: 'Mehmet Yılmaz', phone: '534-555-7788', email: 'mehmet@example.com', points: 0 },
    { id: 9, fullName: 'Ayşe Kaya',     phone: '535-444-9988', email: 'ayse@example.com', points: 40,  lastSale: '2025-08-05' },
    { id: 10, fullName: 'Elif Çetin',    phone: '536-123-4567', email: 'elif@example.com', points: 300, lastSale: '2025-08-03' }
  ]

  // filtre
  get filteredCustomers(): Customer[] {
    const q = this.idQuery.trim().toLowerCase()
    if (!q) return this.customers
    return this.customers.filter(c =>
        String(c.id).includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    )
  }
  deleteItem(id: number) {
    this.envatory = this.envatory.filter(p => p.id !== id)
    this.$delete(this.quantities, id)
  }

  // butonlar pasif (sadece görünür)
  startSale(_: number) {}
  viewOrders(_: number) {}

  addCustomer() {}
}
</script>

<style scoped>
</style>
