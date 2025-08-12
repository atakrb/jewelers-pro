<template>
  <v-app>
    <v-app-bar app color="indigo darken-2" dark flat>
      <!-- Sol: Hamburger -->
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="font-weight-bold">Ürün Alış Modülü</v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Saat -->
      <v-chip small color="deep-purple accent-2" text-color="white">{{ nowStr }}</v-chip>

      <!-- Tema -->
      <v-btn icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>

      <!-- Sağ: Profil menüsü -->
      <v-menu offset-y left bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" :title="user.name">
            <v-avatar size="32">
              <img :src="user.avatar" alt="avatar">
            </v-avatar>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item :to="routes.profile || undefined" :href="routes.profile ? undefined : '#'" >
            <v-list-item-icon><v-icon>mdi-account-circle</v-icon></v-list-item-icon>
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>

          <v-list-item :to="routes.iletisim || undefined" :href="routes.iletisimHref" target="_blank">
            <v-list-item-icon><v-icon>mdi-email</v-icon></v-list-item-icon>
            <v-list-item-title>İletişim</v-list-item-title>
          </v-list-item>

          <v-divider class="my-1" />

          <v-list-item @click="logout">
            <v-list-item-icon><v-icon color="red">mdi-logout</v-icon></v-list-item-icon>
            <v-list-item-title class="red--text text--darken-1">Çıkış Yap</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app temporary>
      <!-- Kullanıcı kartı -->
      <v-list two-line subheader>
        <v-subheader>Hesap</v-subheader>
        <v-list-item>
          <v-list-item-avatar>
            <img :src="user.avatar" alt="">
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{ user.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider class="mb-2"/>

      <!-- Navigasyon -->
      <v-list nav dense>
        <v-list-item :to="{ name: 'home' }" exact>
          <v-list-item-icon><v-icon>mdi-home</v-icon></v-list-item-icon>
          <v-list-item-title>Ana Sayfa</v-list-item-title>
        </v-list-item>

        <v-list-item :to="{ name: 'itemBuy' }">
          <v-list-item-icon><v-icon>mdi-cart-arrow-down</v-icon></v-list-item-icon>
          <v-list-item-title>Müşteriden Alım</v-list-item-title>
        </v-list-item>

        <v-list-item :to="{ name: 'sellAndInventory' }">
          <v-list-item-icon><v-icon>mdi-cash-register</v-icon></v-list-item-icon>
          <v-list-item-title>Satış & Envanter</v-list-item-title>
        </v-list-item>

        <!-- İsteğe bağlı: Profil -->
        <v-list-item :to="routes.profile || undefined" :href="routes.profile ? undefined : '#'" >
          <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
          <v-list-item-title>Profil</v-list-item-title>
        </v-list-item>

        <!-- İletişim -->
        <v-list-item :to="routes.iletisim || undefined" :href="routes.iletisimHref" target="_blank">
          <v-list-item-icon><v-icon>mdi-phone</v-icon></v-list-item-icon>
          <v-list-item-title>İletişim</v-list-item-title>
        </v-list-item>

        <!-- Çıkış -->
        <v-list-item @click="logout">
          <v-list-item-icon><v-icon color="red">mdi-logout</v-icon></v-list-item-icon>
          <v-list-item-title class="red--text text--darken-1">Çıkış Yap</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>


    <v-main>
      <v-container fluid class="py-6">
        <v-row>
          <!-- SOL: Satış -->
          <v-col cols="12" md="7">
            <v-card class="pa-4 soft-card" outlined>
              <div class="d-flex align-center mb-2">
                <h2 class="mb-0">Satış</h2>
                <v-spacer></v-spacer>
                <v-btn color="green" dark :disabled="cart.items.length===0" @click="completeSale">
                  <v-icon left>mdi-cash-register</v-icon>Satışı Tamamla
                </v-btn>
              </div>

              <!-- Ürün Arama -->
              <v-row class="mb-2">
                <v-col cols="12" md="8">
                  <v-autocomplete
                      v-model="selectedId"
                      :items="filteredInventory"
                      item-text="_label"
                      item-value="id"
                      label="Ürün ara (Ad/SKU/Barkod)"
                      prepend-inner-icon="mdi-magnify"
                      dense clearable :filter="invFilter" hide-no-data
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field v-model.number="addQty" type="number" min="1" label="Adet" dense />
                </v-col>
                <v-col cols="6" md="2" class="d-flex align-end">
                  <v-btn block color="indigo" dark :disabled="!selectedProduct || addQty<=0" @click="addToCart">
                    <v-icon left>mdi-cart-plus</v-icon>Ekle
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Sepet -->
              <v-data-table :headers="cartHeaders" :items="cart.items" item-key="rowId" class="soft-card" dense :items-per-page="5" outlined>
                <template v-slot:item.qty="{ item }">
                  <v-text-field class="dense" v-model.number="item.qty" type="number" min="1" @input="recalcRow(item)" />
                </template>
                <template v-slot:item.discountPct="{ item }">
                  <v-text-field class="dense" v-model.number="item.discountPct" type="number" min="0" max="100" suffix="%" @input="recalcRow(item)" />
                </template>
                <template v-slot:item.markupPct="{ item }">
                  <v-text-field class="dense" v-model.number="item.markupPct" type="number" min="0" max="300" suffix="%" @input="recalcRow(item)" />
                </template>
                <template v-slot:item.unitPriceEff="{ item }"><span class="nowrap">{{ money(item.unitPriceEff) }}</span></template>
                <template v-slot:item.subtotal="{ item }"><span class="nowrap">{{ money(item.subtotal) }}</span></template>
                <template v-slot:item.profit="{ item }"><span class="nowrap">{{ money(item.profit) }}</span></template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon @click="removeFromCart(item)"><v-icon color="red">mdi-delete</v-icon></v-btn>
                </template>
              </v-data-table>

              <!-- Özet -->
              <v-card class="mt-3 pa-4 soft-card" outlined>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="subtitle-2 text--secondary">Toplam Tutar</div>
                    <div class="display-1 font-weight-bold">{{ money(cart.total) }}</div>
                  </v-col>
                  <v-col cols="6" md="4">
                    <div class="subtitle-2 text--secondary">Toplam Maliyet (COGS)</div>
                    <div class="headline font-weight-bold">{{ money(cart.cogs) }}</div>
                  </v-col>
                  <v-col cols="6" md="4">
                    <div class="subtitle-2 text--secondary">Kâr</div>
                    <div class="headline font-weight-bold">{{ money(cart.profit) }}</div>
                  </v-col>
                </v-row>
              </v-card>
            </v-card>
          </v-col>

          <!-- SAĞ: Envanter & Gün Sonu -->
          <v-col cols="12" md="5">
            <v-card class="pa-4 soft-card" outlined>
              <div class="d-flex align-center mb-2">
                <h2 class="mb-0">Envanter</h2>
                <v-spacer></v-spacer>
                <v-btn color="indigo" outlined @click="dialogs.addItem=true"><v-icon left>mdi-plus</v-icon>Ürün Ekle</v-btn>
              </div>
              <v-text-field v-model="invSearch" dense clearable prepend-inner-icon="mdi-magnify" label="Envanterde Ara" class="mb-2" />
              <v-data-table :headers="invHeaders" :items="filteredInventory" :items-per-page="5" dense outlined class="soft-card">
                <template v-slot:item.unitPrice="{ item }"><span class="nowrap">{{ money(item.unitPrice) }}</span></template>
                <template v-slot:item.unitCost="{ item }"><span class="nowrap">{{ money(item.unitCost) }}</span></template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon @click="removeInventory(item)"><v-icon color="red">mdi-delete</v-icon></v-btn>
                </template>
              </v-data-table>
            </v-card>

            <v-card class="mt-4 pa-4 soft-card" outlined>
              <div class="d-flex align-center mb-2"><h2 class="mb-0">Gün Sonu</h2></div>
              <v-row>
                <v-col cols="12" md="4">
                  <div class="subtitle-2 text--secondary">Satış Toplam</div>
                  <div class="headline font-weight-bold">{{ money(day.total) }}</div>
                </v-col>
                <v-col cols="6" md="4">
                  <div class="subtitle-2 text--secondary">Maliyet</div>
                  <div class="subtitle-1 font-weight-bold">{{ money(day.cogs) }}</div>
                </v-col>
                <v-col cols="6" md="4">
                  <div class="subtitle-2 text--secondary">Net Kâr</div>
                  <div class="subtitle-1 font-weight-bold">{{ money(day.profit) }}</div>
                </v-col>
              </v-row>
              <v-data-table :headers="dayHeaders" :items="day.sales" :items-per-page="5" dense outlined class="soft-card mt-2">
                <template v-slot:item.total="{ item }"><span class="nowrap">{{ money(item.total) }}</span></template>
                <template v-slot:item.cogs="{ item }"><span class="nowrap">{{ money(item.cogs) }}</span></template>
                <template v-slot:item.profit="{ item }"><span class="nowrap">{{ money(item.profit) }}</span></template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <!-- Ürün Ekle Dialog -->
        <v-dialog v-model="dialogs.addItem" max-width="520">
          <v-card>
            <v-card-title class="headline">Yeni Ürün</v-card-title>
            <v-card-text>
              <v-form ref="addForm" v-model="valid.add">
                <v-text-field v-model="addForm.sku" label="SKU" :rules="[r.req]" dense />
                <v-text-field v-model="addForm.name" label="Ad" :rules="[r.req]" dense />
                <v-text-field v-model="addForm.barcode" label="Barkod" dense />
                <v-text-field v-model.number="addForm.qty" label="Stok" type="number" min="0" :rules="[r.nonneg]" dense />
                <v-text-field v-model.number="addForm.unitCost" label="Birim Maliyet" type="number" min="0" :rules="[r.nonneg]" dense />
                <v-text-field v-model.number="addForm.unitPrice" label="Birim Fiyat" type="number" min="0" :rules="[r.nonneg]" dense />
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="dialogs.addItem=false">İptal</v-btn>
              <v-btn color="indigo" dark :disabled="!valid.add" @click="addInventory">Ekle</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-snackbar v-model="snack.show" :color="snack.color" timeout="2000">{{ snack.text }}</v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>
<script>
export default {
  name: "SellAndInventory",
  data() {
    return {
      drawer: false,
      group: 0,

      user: {
        name: 'Misafir Kullanıcı',
        email: 'user@example.com',
        avatar: 'https://ui-avatars.com/api/?name=MK&background=4c51bf&color=fff'
      },
      routes: {
        profile: null,
        iletisim: null,
        iletisimHref: 'mailto:destek@firma.com?subject=İletişim'
      },
      computed: {
        nowStr(){ return this.now.toLocaleString('tr-TR') }
      },
      mounted(){
        this._timerId = setInterval(() => { this.now = new Date() }, 1000)
      },
      beforeDestroy(){
        if (this._timerId) clearInterval(this._timerId)
      },
      // UI
      now: new Date(),
      timerId: null,

      // arama & seçim
      invSearch: "",
      selectedId: null,
      addQty: 1,

      // sepet
      cart: { items: [], total: 0, cogs: 0, profit: 0 },

      // envanter (örnek veri)
      inventory: [
        { id: 1, sku: "SKU-1001", name: "Altın Yüzük",   barcode: "869000000001", qty: 10, unitCost: 1200, unitPrice: 1500 },
        { id: 2, sku: "SKU-1002", name: "Gümüş Kolye",   barcode: "869000000002", qty: 15, unitCost:  300, unitPrice:  500 },
        { id: 3, sku: "SKU-1003", name: "Pırlanta Küpe", barcode: "869000000003", qty:  5, unitCost: 5000, unitPrice: 6500 },
      ],

      // gün sonu
      day: { sales: [], total: 0, cogs: 0, profit: 0 },

      // dialog & form
      dialogs: { addItem: false },
      valid: { add: false },
      addForm: { sku: "", name: "", barcode: "", qty: 0, unitCost: 0, unitPrice: 0 },

      // basit kurallar
      r: {
        req: v => !!v || "Zorunlu",
        nonneg: v => (v === 0 || !!v) && Number(v) >= 0 || "0 veya daha büyük olmalı"
      },

      // snackbar
      snack: { show: false, text: "", color: "success" },

      // tablolar
      cartHeaders: [
        { text: "SKU",          value: "sku" },
        { text: "Ad",           value: "name" },
        { text: "Stok",         value: "stock" },
        { text: "Adet",         value: "qty" },
        { text: "İndirim",      value: "discountPct" },
        { text: "Zam",          value: "markupPct" },
        { text: "Eff. Fiyat",   value: "unitPriceEff" },
        { text: "Ara Toplam",   value: "subtotal" },
        { text: "Kâr",          value: "profit" },
        { text: "",             value: "actions", sortable: false },
      ],
      invHeaders: [
        { text: "SKU",         value: "sku" },
        { text: "Ad",          value: "name" },
        { text: "Barkod",      value: "barcode" },
        { text: "Stok",        value: "qty" },
        { text: "Birim Maliyet", value: "unitCost" },
        { text: "Birim Fiyat",   value: "unitPrice" },
        { text: "",            value: "actions", sortable: false },
      ],
      dayHeaders: [
        { text: "Saat",   value: "time" },
        { text: "Satır",  value: "lines" },
        { text: "Toplam", value: "total" },
        { text: "Maliyet", value: "cogs" },
        { text: "Kâr",    value: "profit" },
      ],
    };
  },

  computed: {
    nowStr() {
      // 12.08.2025 13:45:12 formatına yakın
      return this.now.toLocaleString("tr-TR", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false
      });
    },

    selectedProduct() {
      return this.inventory.find(x => x.id === this.selectedId) || null;
    },

    // arama + autocomplete için _label ekleyip filtrelenmiş liste döndürür
    filteredInventory() {
      const q = (this.invSearch || "").toString().toLowerCase().trim();
      const arr = this.inventory.map(it => ({
        ...it,
        _label: `${it.name} • ${it.sku}${it.barcode ? " • " + it.barcode : ""}`
      }));
      if (!q) return arr;
      return arr.filter(it =>
          it.name.toLowerCase().includes(q) ||
          it.sku.toLowerCase().includes(q) ||
          (it.barcode || "").toLowerCase().includes(q)
      );
    },
  },

  methods: {
    money(n) {
      return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(n || 0));
    },

    // v-autocomplete custom filter (case-insensitive)
    invFilter(item, queryText /*, itemText*/) {
      const q = (queryText || "").toLowerCase();
      return (item._label || "").toLowerCase().includes(q);
    },

    addToCart() {
      if (!this.selectedProduct || this.addQty <= 0) return;
      const p = this.selectedProduct;

      // sepet satırı
      const row = {
        rowId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        id: p.id,
        sku: p.sku,
        name: p.name,
        stock: p.qty,          // o anki stok görüntüsü
        qty: this.addQty,
        discountPct: 0,
        markupPct: 0,
        unitCost: p.unitCost,
        unitPrice: p.unitPrice,
        unitPriceEff: p.unitPrice,
        subtotal: 0,
        profit: 0,
      };

      this.recalcRow(row);
      this.cart.items.push(row);
      this.recalcCartTotals();

      // seçim sıfırla
      this.selectedId = null;
      this.addQty = 1;
    },

    recalcRow(item) {
      const cost = Number(item.unitCost) || 0;
      const base = Number(item.unitPrice) || 0;
      const qty  = Math.max(1, Number(item.qty) || 1);

      const d = Math.min(100, Math.max(0, Number(item.discountPct) || 0));
      const m = Math.max(0, Number(item.markupPct) || 0);

      // efektif fiyat = (fiyat - indirim) * (1 + zam)
      const priceAfterDiscount = base * (1 - d / 100);
      const unitEff = priceAfterDiscount * (1 + m / 100);

      item.unitPriceEff = unitEff;
      item.subtotal = unitEff * qty;
      item.profit = (unitEff - cost) * qty;

      this.recalcCartTotals();
    },

    recalcCartTotals() {
      const t = this.cart.items.reduce((acc, it) => {
        acc.total  += Number(it.subtotal) || 0;
        acc.cogs   += (Number(it.unitCost) || 0) * (Number(it.qty) || 0);
        acc.profit += Number(it.profit) || 0;
        return acc;
      }, { total: 0, cogs: 0, profit: 0 });

      this.cart.total = t.total;
      this.cart.cogs = t.cogs;
      this.cart.profit = t.profit;
    },

    removeFromCart(row) {
      const i = this.cart.items.findIndex(x => x.rowId === row.rowId);
      if (i >= 0) this.cart.items.splice(i, 1);
      this.recalcCartTotals();
    },

    completeSale() {
      if (this.cart.items.length === 0) return;

      // envanterden düş
      this.cart.items.forEach(ci => {
        const inv = this.inventory.find(x => x.id === ci.id);
        if (inv) inv.qty = Math.max(0, Number(inv.qty) - Number(ci.qty));
      });

      // satış kaydı
      const sale = {
        time: new Date().toLocaleTimeString("tr-TR", { hour12: false }),
        lines: this.cart.items.length,
        total: this.cart.total,
        cogs: this.cart.cogs,
        profit: this.cart.profit,
        items: this.cart.items.map(x => ({
          id: x.id, sku: x.sku, name: x.name, qty: x.qty, unitPriceEff: x.unitPriceEff
        })),
      };
      this.day.sales.unshift(sale);
      this.day.total  += sale.total;
      this.day.cogs   += sale.cogs;
      this.day.profit += sale.profit;

      // sepet temizle
      this.cart = { items: [], total: 0, cogs: 0, profit: 0 };

      this.snack = { show: true, text: "Satış tamamlandı", color: "success" };
    },

    addInventory() {
      // Vuetify 2 form doğrulama
      if (!this.$refs.addForm || !this.$refs.addForm.validate()) return;

      const nextId = (this.inventory.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
      const p = {
        id: nextId,
        sku: String(this.addForm.sku || "").trim(),
        name: String(this.addForm.name || "").trim(),
        barcode: String(this.addForm.barcode || "").trim(),
        qty: Number(this.addForm.qty) || 0,
        unitCost: Number(this.addForm.unitCost) || 0,
        unitPrice: Number(this.addForm.unitPrice) || 0,
      };

      this.inventory.unshift(p);
      this.dialogs.addItem = false;
      this.valid.add = false;
      this.addForm = { sku: "", name: "", barcode: "", qty: 0, unitCost: 0, unitPrice: 0 };

      this.snack = { show: true, text: "Ürün eklendi", color: "success" };
    },

    removeInventory(item) {
      const i = this.inventory.findIndex(x => x.id === item.id);
      if (i >= 0) this.inventory.splice(i, 1);
      this.snack = { show: true, text: "Ürün silindi", color: "info" };
    },
  },

  mounted() {
    this.timerId = setInterval(() => { this.now = new Date(); }, 1000);
  },
  beforeDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  },
};
</script>

<style scoped>
.soft-card { border-radius: 12px; }
.nowrap { white-space: nowrap; }
/* v-text-field 'dense' görünümü biraz sıkılaştırma (hafif dokunuş) */
.dense .v-input__control { min-height: 36px; }
</style>
