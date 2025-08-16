<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">
    <!-- SOL YAN MENÜ -->
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
      </v-list>
    </v-navigation-drawer>

    <!-- HERO -->
    <div class="hero">
      <div class="hero-glow" :style="{ '--accent': accent }"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Toptancılar & Tedarikçiler</h2>
        <div class="hero-sub">Kartlardan ürünleri, maliyetleri ve kârlarını yönet.</div>
      </div>
    </div>

    <!-- HIZLI AKSİYONLAR -->
    <v-container class="pt-4 pb-0 d-flex justify-start">
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

    <!-- FİLTRE ŞERİDİ -->
    <v-container class="pt-4">
      <v-sheet class="filters-sheet mb-3">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="search" dense outlined clearable hide-details
                          label="Toptancı Ara (ad, telefon, e-posta)"
                          prepend-inner-icon="mdi-magnify"/>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end align-center">
            <v-btn class="glass-btn" :color="accent" dark @click="openSupplierDialog()">
              <v-icon left small>mdi-account-plus</v-icon> Yeni Toptancı
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>

      <!-- KART LİSTESİ -->
      <div id="supplierPrint">
        <v-row dense>
          <v-col v-for="(s, idx) in filteredSuppliers" :key="s.id" cols="12" md="6" lg="12">
            <v-card class="supplier-card" outlined>
              <v-card-title class="py-3">
                <div class="d-flex align-center">
                  <v-avatar size="36" class="mr-3" color="deep-purple" tile>
                    <span class="white--text font-weight-bold">{{ initials(s.name) }}</span>
                  </v-avatar>
                  <div>
                    <div class="subtitle-1 font-weight-bold">{{ s.name }}</div>
                    <div class="caption grey--text">{{ s.phone }} · {{ s.email || '-' }}</div>
                  </div>
                </div>
                <v-spacer/>
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item @click="openSupplierDialog(s)">
                      <v-list-item-icon><v-icon>mdi-account-edit</v-icon></v-list-item-icon>
                      <v-list-item-title>Düzenle</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="removeSupplier(idx)">
                      <v-list-item-icon><v-icon>mdi-delete</v-icon></v-list-item-icon>
                      <v-list-item-title>Sil</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-card-title>

              <v-card-text class="pt-0">
                <div class="mb-3">
                  <v-chip small class="mr-2" :color="accent" text-color="white">
                    Ürün: {{ (s.items||[]).length }}
                  </v-chip>
                  <v-chip small class="mr-2" color="teal" text-color="white">
                    Maliyet: {{ tl(totalCost(s)) }}
                  </v-chip>
                  <v-chip small class="mr-2" color="deep-purple" text-color="white">
                    Ciro (Teorik): {{ tl(totalSales(s)) }}
                  </v-chip>
                  <v-chip small color="green" text-color="white">
                    Kâr: {{ tl(totalProfit(s)) }}
                  </v-chip>
                </div>

                <v-data-table :headers="itemHeaders" :items="s.items" dense hide-default-footer>
                  <template v-slot:item.name="{ item }">
                    <div class="font-weight-medium">{{ item.name }}</div>
                    <div class="caption grey--text">{{ item.karat ? item.karat + 'k' : '' }} {{ item.ayar }}</div>
                  </template>

                  <template v-slot:item.qty="{ item }">
                    <div class="d-flex align-center justify-end">
                      <v-btn icon x-small @click="decQty(s, item)"><v-icon small>mdi-minus</v-icon></v-btn>
                      <v-text-field v-model.number="item.qty" type="number" min="0" dense hide-details class="mx-1 text-right" style="max-width:70px"/>
                      <v-btn icon x-small @click="incQty(item)"><v-icon small>mdi-plus</v-icon></v-btn>
                    </div>
                  </template>

                  <template v-slot:item.cost="{ item }">{{ tl(item.cost) }}</template>
                  <template v-slot:item.extras="{ item }">{{ tl(item.extras || 0) }}</template>
                  <template v-slot:item.vatPercent="{ item }">{{ item.vatPercent || 0 }}%</template>
                  <template v-slot:item.sell="{ item }">{{ tl(priceCalc(item).priceGross) }}</template>
                  <template v-slot:item.profit="{ item }">{{ tl(priceCalc(item).profitTL) }}</template>
                  <template v-slot:item.profitPct="{ item }">{{ priceCalc(item).profitPct.toFixed(1) }}%</template>

                  <template v-slot:item.ops="{ item }">
                    <v-btn icon small @click="openItemDialog(s, item)"><v-icon>mdi-pencil</v-icon></v-btn>
                    <v-btn icon small @click="removeItem(s, item)"><v-icon>mdi-delete</v-icon></v-btn>
                  </template>
                </v-data-table>

                <v-divider class="my-3"/>
                <div class="d-flex justify-space-between">
                  <span class="grey--text">Toplam Maliyet</span>
                  <strong>{{ tl(totalCost(s)) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="grey--text">Toplam Ciro (teorik)</span>
                  <strong>{{ tl(totalSales(s)) }}</strong>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="grey--text">Toplam Kâr</span>
                  <strong>{{ tl(totalProfit(s)) }}</strong>
                </div>
              </v-card-text>

              <v-card-actions class="px-4 pb-4">
                <v-btn small :color="accent" dark @click="openItemDialog(s)">
                  <v-icon left>mdi-plus</v-icon> Ürün Ekle
                </v-btn>
                <v-spacer/>
                <v-btn small outlined @click="openSupplierDialog(s)">
                  <v-icon left>mdi-account-edit</v-icon> Toptancıyı Düzenle
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="12" v-if="filteredSuppliers.length===0">
            <v-alert type="info" outlined>Sonuç bulunamadı.</v-alert>
          </v-col>
        </v-row>
      </div>

      <!-- TOPTANCI DİYALOĞU -->
      <v-dialog v-model="dialogs.supplier" max-width="520px">
        <v-card>
          <v-card-title class="subtitle-1 font-weight-bold">
            {{ supplierForm.id ? 'Toptancı Düzenle' : 'Yeni Toptancı' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="supplierFormRef">
              <v-text-field v-model="supplierForm.name" label="Ad" dense outlined required />
              <v-text-field v-model="supplierForm.phone" label="Telefon" dense outlined />
              <v-text-field v-model="supplierForm.email" label="E-posta" dense outlined />
              <v-textarea v-model="supplierForm.address" label="Adres" dense outlined rows="2"/>
              <v-textarea v-model="supplierForm.notes" label="Notlar" dense outlined rows="2"/>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn text @click="dialogs.supplier=false">Vazgeç</v-btn>
            <v-spacer/>
            <v-btn :color="accent" dark @click="saveSupplier">Kaydet</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ÜRÜN DİYALOĞU -->
      <v-dialog v-model="dialogs.item" max-width="820px">
        <v-card>
          <v-card-title class="subtitle-1 font-weight-bold">
            {{ itemForm.id ? 'Ürün Düzenle' : 'Ürün Ekle' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="itemFormRef">
              <v-row dense>
                <v-col cols="12" md="6"><v-text-field v-model="itemForm.name" label="Ürün Adı" dense outlined required /></v-col>
                <v-col cols="6" md="3"><v-text-field v-model="itemForm.karat" label="Karat" dense outlined /></v-col>
                <v-col cols="6" md="3"><v-text-field v-model="itemForm.ayar" label="Ayar" dense outlined /></v-col>
              </v-row>

              <v-row dense>
                <v-col cols="4" md="3"><v-text-field v-model.number="itemForm.qty" type="number" min="0" label="Adet" dense outlined /></v-col>
                <v-col cols="4" md="3"><v-text-field v-model.number="itemForm.cost" type="number" min="0" label="Geliş (TL)" dense outlined /></v-col>
                <v-col cols="4" md="3"><v-text-field v-model.number="itemForm.extras" type="number" min="0" label="Ek Masraf" dense outlined /></v-col>
                <v-col cols="12" md="3"><v-text-field v-model.number="itemForm.vatPercent" type="number" min="0" label="KDV %" dense outlined /></v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12" md="4">
                  <v-select v-model="itemForm.pricingMode" :items="pricingModes" item-text="text" item-value="value" dense outlined label="Fiyatlama Modu"/>
                </v-col>
                <v-col cols="6" md="4" v-if="itemForm.pricingMode==='markup'"><v-text-field v-model.number="itemForm.markupPercent" type="number" min="0" label="Kar %" dense outlined /></v-col>
                <v-col cols="6" md="4" v-if="itemForm.pricingMode==='profit'"><v-text-field v-model.number="itemForm.profitTL" type="number" min="0" label="Kar TL" dense outlined /></v-col>
                <v-col cols="6" md="4" v-if="itemForm.pricingMode==='target'"><v-text-field v-model.number="itemForm.targetPrice" type="number" min="0" label="Hedef Fiyat" dense outlined /></v-col>
                <v-col cols="6" md="4"><v-select v-model="itemForm.rounding" :items="roundingOptions" dense outlined label="Yuvarlama"/></v-col>
                <v-col cols="12" md="4" class="d-flex align-center"><v-checkbox v-model="itemForm.vatIncluded" hide-details label="KDV Dahil"/></v-col>
              </v-row>

              <v-divider class="my-3"/>
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-simple-table dense>
                    <tbody>
                    <tr><td>Baz Maliyet</td><td class="text-right">{{ tl(pricePreview.base) }}</td></tr>
                    <tr><td>Net Fiyat (KDV Hariç)</td><td class="text-right">{{ tl(pricePreview.priceNet) }}</td></tr>
                    <tr><td>KDV Dahil</td><td class="text-right font-weight-bold">{{ tl(pricePreview.priceGross) }}</td></tr>
                    </tbody>
                  </v-simple-table>
                </v-col>
                <v-col cols="12" md="6">
                  <v-simple-table dense>
                    <tbody>
                    <tr><td>Kâr (TL)</td><td class="text-right">{{ tl(pricePreview.profitTL) }}</td></tr>
                    <tr><td>Kâr %</td><td class="text-right">{{ pricePreview.profitPct.toFixed(1) }}%</td></tr>
                    <tr><td>Yuvarlama</td><td class="text-right">{{ pricePreview.roundNote }}</td></tr>
                    </tbody>
                  </v-simple-table>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn text @click="dialogs.item=false">Vazgeç</v-btn>
            <v-spacer/>
            <v-btn :color="accent" dark @click="saveItem">Kaydet</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snack.show" :color="snack.color" timeout="2500">{{ snack.text }}</v-snackbar>
    </v-container>
  </v-container>
</template>

<script>
import { get } from "@/utils/harddata";
import { priceCalc } from "@/utils/pricing";

export default {
  name: "ToptanciPage",
  data() {
    return {
      /* Drawer & tema */
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini: this.$vuetify?.breakpoint?.lgAndUp || false,
      accent: localStorage.getItem('jp_accent') || '#5865F2',
      accents: ['#5865F2','#0EA5E9','#22C55E','#F59E0B','#EF4444','#8B5CF6'],
      drawerItems: [
        { title:"Ana Sayfa",    icon:"mdi-view-dashboard-outline", to:"home" },
        { title:"Satış",        icon:"mdi-cash-register",          to:"satis" },
        { title:"Raporlar",     icon:"mdi-file-chart",             to:"raporlar" },
        { title:"Toptancı",     icon:"mdi-storefront-outline",     to:"toptanci" },
        { title:"Kategoriler",  icon:"mdi-shape-outline",          to:"kategoriler" },
        { title:"Ürünler",      icon:"mdi-package-variant-closed", to:"urunler" },
        { title:"Müşteri Bilgi",icon:"mdi-account-group-outline",  to:"musteriBilgi" },
        { title:"Stok",         icon:"mdi-archive-outline",        to:"stok" },
        { title:"Kargo",        icon:"mdi-truck-outline",          to:"kargo" },
      ],
      quickActions: [
        { key:'N', icon:'mdi-account-plus',    title:'Yeni Toptancı', subtitle:'Kart ekle', click:()=>this.openSupplierDialog() },
        { key:'C', icon:'mdi-file-delimited',  title:'CSV',           subtitle:'Dışa aktar', click:()=>this.exportCSV() },
        { key:'P', icon:'mdi-printer',         title:'Yazdır',        subtitle:'Kartları yazdır', click:()=>this.yazdir() },
      ],

      /* Sayfa state */
      search: "",
      suppliers: [],

      itemHeaders: [
        { text: "Ürün", value: "name" },
        { text: "Adet", value: "qty", align: "end", width: 100 },
        { text: "Geliş", value: "cost", align: "end", width: 110 },
        { text: "Ekstra", value: "extras", align: "end", width: 110 },
        { text: "KDV %", value: "vatPercent", align: "end", width: 90 },
        { text: "Satış (KDV)", value: "sell", align: "end", width: 140 },
        { text: "Kâr TL", value: "profit", align: "end", width: 110 },
        { text: "Kâr %", value: "profitPct", align: "end", width: 90 },
        { text: "", value: "ops", sortable: false, align: "end", width: 90 }
      ],

      dialogs: { supplier: false, item: false },
      supplierForm: { id: null, name: "", phone: "", email: "", address: "", notes: "" },
      itemForm: { id: null, supplierId: null, name: "", karat: "", ayar: "",
        qty: 1, cost: 0, extras: 0,
        pricingMode: "markup", markupPercent: 0, profitTL: 0, targetPrice: null,
        vatPercent: 20, vatIncluded: true, rounding: "to10" },

      pricingModes: [
        { text: "Kar % (Markup)", value: "markup" },
        { text: "Kar TL", value: "profit" },
        { text: "Hedef Fiyat", value: "target" },
      ],
      roundingOptions: ["none","to10","to100","to1000","end_990"],

      snack: { show:false, color:"green", text:"" },
    };
  },

  created(){
    try{
      const fromDb = get("suppliers") || [];
      this.suppliers = (fromDb || []).map(s => ({ ...s, items: Array.isArray(s.items) ? s.items : [] }));
      const ro = get("settings.roundingOptions");
      if(Array.isArray(ro) && ro.length) this.roundingOptions = ro;
    }catch(e){
      console.error("suppliers okunamadı:", e);
      this.suppliers = [];
    }
  },

  computed: {
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },
    filteredSuppliers() {
      const q = (this.search || "").toLowerCase().trim();
      if (!q) return this.suppliers;
      return this.suppliers.filter(s =>
          [s.name, s.phone, s.email, s.address].join(" ").toLowerCase().includes(q)
      );
    },
    pricePreview(){ return priceCalc(this.itemForm); }
  },

  methods: {
    /* Tema */
    setAccent(c){ this.accent = c; localStorage.setItem('jp_accent', c); },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark; },

    /* Helpers */
    priceCalc,
    tl(n){ return new Intl.NumberFormat("tr-TR",{ style:"currency", currency:"TRY" }).format(n||0); },
    initials(str){ return (str||'').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(); },
    newId(){ return Date.now() + Math.floor(Math.random()*1000); },
    toast(t,c="green"){ this.snack = { show:true, color:c, text:t }; },

    totalCost(s){
      const items = Array.isArray(s.items) ? s.items : [];
      return items.reduce((t,i)=> t + (Number(i.qty||0) * (Number(i.cost||0)+Number(i.extras||0))), 0);
    },
    totalSales(s){
      const items = Array.isArray(s.items) ? s.items : [];
      return items.reduce((t,i)=> t + Number(i.qty||0) * priceCalc(i).priceGross, 0);
    },
    totalProfit(s){
      const items = Array.isArray(s.items) ? s.items : [];
      return items.reduce((t,i)=> t + Number(i.qty||0) * priceCalc(i).profitTL, 0);
    },

    /* CRUD */
    openSupplierDialog(s=null){
      this.supplierForm = s
          ? { id:s.id, name:s.name, phone:s.phone||"", email:s.email||"", address:s.address||"", notes:s.notes||"" }
          : { id:null, name:"", phone:"", email:"", address:"", notes:"" };
      this.dialogs.supplier = true;
    },
    saveSupplier(){
      const f = this.supplierForm;
      if(!f.name){ this.toast("Ad boş olamaz","red"); return; }
      if(f.id){
        const i = this.suppliers.findIndex(x=>x.id===f.id);
        if(i>-1) this.$set(this.suppliers, i, { ...this.suppliers[i], ...f });
        this.toast("Toptancı güncellendi");
      }else{
        this.suppliers.push({ ...f, id:this.newId(), items:[] });
        this.toast("Toptancı eklendi");
      }
      this.dialogs.supplier = false;
    },
    removeSupplier(idx){
      if(confirm("Toptancıyı silmek istiyor musun?")){
        this.suppliers.splice(idx,1);
        this.toast("Toptancı silindi");
      }
    },

    openItemDialog(supplier, item=null){
      this.itemForm = item
          ? { ...item, supplierId: supplier.id }
          : { id:null, supplierId: supplier.id, name:"", karat:"", ayar:"",
            qty:1, cost:0, extras:0, pricingMode:"markup", markupPercent:0, profitTL:0, targetPrice:null,
            vatPercent:20, vatIncluded:true, rounding:(this.roundingOptions[0]||"none") };
      this.dialogs.item = true;
    },
    saveItem(){
      const f = this.itemForm;
      if(!f.name){ this.toast("Ürün adı boş olamaz","red"); return; }
      const s = this.suppliers.find(x=>x.id===f.supplierId);
      if(!s){ this.toast("Toptancı bulunamadı","red"); return; }

      if(!Array.isArray(s.items)) this.$set(s, "items", []);
      if(f.id){
        const i = s.items.findIndex(x=>x.id===f.id);
        if(i>-1) this.$set(s.items, i, { ...s.items[i], ...f });
        this.toast("Ürün güncellendi");
      }else{
        s.items.push({ ...f, id:this.newId() });
        this.toast("Ürün eklendi");
      }
      this.dialogs.item = false;
    },
    removeItem(supplier, item){
      const i = (supplier.items||[]).findIndex(x=>x.id===item.id);
      if(i>-1){ supplier.items.splice(i,1); this.toast("Ürün silindi"); }
    },
    incQty(item){ item.qty = Number(item.qty||0) + 1; },
    decQty(supplier, item){
      if(item.qty>0) item.qty = Number(item.qty) - 1;
      if(item.qty===0 && confirm("Adet 0 oldu. Ürün karttan kaldırılsın mı?")){
        this.removeItem(supplier, item);
      }
    },

    /* Aksiyonlar */
    exportCSV(){
      const rows = [["supplierId","supplier","phone","email","itemId","itemName","qty","cost","extras","vatPercent","priceGross","profitTL"]];
      (this.filteredSuppliers || []).forEach(s=>{
        (s.items||[]).forEach(i=>{
          const c = priceCalc(i);
          rows.push([s.id, s.name, s.phone||"", s.email||"", i.id, i.name, i.qty||0, i.cost||0, i.extras||0, i.vatPercent||0, c.priceGross||0, c.profitTL||0]);
        });
      });
      const csv = rows.map(r=>r.join(",")).join("\n");
      const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href=url; a.download="toptancilar.csv"; a.click(); URL.revokeObjectURL(url);
    },
    yazdir(){ window.print(); },
  }
};
</script>

<style scoped>
/* Drawer */
.elevated-drawer{
  border-top-right-radius:16px;
  border-bottom-right-radius:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
}

/* Hero */
.hero{
  position:relative; height:120px; overflow:hidden;
  border-bottom:1px solid rgba(0,0,0,.04);
}
.theme--light .hero{ background:linear-gradient(180deg,#ffffff,#fafafa); }
.theme--dark  .hero{ background:linear-gradient(180deg,#0f1115,#0a0c10); }
.hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation:float 16s ease-in-out infinite;
  filter:blur(42px); opacity:.55;
}
.theme--dark .hero-glow{ opacity:.35; }
.hero-content{ position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding:12px 24px; }
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px; }
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
.theme--dark .qa{ background:rgba(30,30,30,.7); }
.qa:hover{ transform:translateY(-3px); box-shadow:0 10px 20px rgba(0,0,0,.08); }

/* Filters */
.filters-sheet{
  border-radius:16px;
  padding:14px 16px;
  border:1px solid rgba(0,0,0,.06);
  background:rgba(255,255,255,.75);
  backdrop-filter:blur(8px) saturate(120%);
}
.theme--dark .filters-sheet{
  border-color:rgba(255,255,255,.06);
  background:rgba(24,24,24,.7);
}
.glass-btn{
  background:rgba(255,255,255,.6);
  border:1px solid rgba(0,0,0,.06);
}
.theme--dark .glass-btn{
  background:rgba(24,24,24,.6);
  border-color:rgba(255,255,255,.08);
}

/* Cards */
.supplier-card { border-radius: 16px; }

/* Print: sadece kart alanı */
@media print {
  body * { visibility: hidden !important; }
  #supplierPrint, #supplierPrint * { visibility: visible !important; }
  #supplierPrint { position: absolute; left: 0; top: 0; width: 100%; }
}

/* Anim */
@keyframes float{
  0%{ transform: translate3d(0,0,0) }
  50%{ transform: translate3d(2%,-2%,0) }
  100%{ transform: translate3d(0,0,0) }
}
</style>

<style>
.v-main__wrap{ padding-top:0 !important; }
</style>
