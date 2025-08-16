<template>
  <v-container fluid class="px-0 py-0" :style="{ '--accent': accent }">

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
          <v-spacer/>
          <v-btn
              v-for="c in accents"
              :key="c"
              icon small
              :style="{ color: c }"
              @click="setAccent(c)"
          ><v-icon>mdi-circle</v-icon></v-btn>
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

    <div class="hero">
      <div class="hero-glow" :style="{ '--accent': accent }"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Kategoriler & Ürün Grupları</h2>
        <div class="hero-sub">Gruplama, fiyatlama ve stok — tek ekranda.</div>
      </div>
    </div>

    <v-container class="pt-4 pb-0">
      <v-slide-group show-arrows>
        <v-slide-item v-for="qa in quickActions" :key="qa.key">
          <v-card
              class="qa"
              :to="qa.to ? { name: qa.to } : undefined"
              :link="!!qa.to"
              :style="{ borderColor: accent }"
              @click="qa.click && qa.click()"
          >
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

    <v-container class="pt-4 pb-0">
      <v-sheet class="filters-sheet">
        <v-row dense align="center">
          <v-col cols="12" md="6">
            <v-text-field
                v-model="search"
                dense
                outlined
                clearable
                hide-details
                label="Kategori / Ürün Ara (ad, karat, ayar)"
                prepend-inner-icon="mdi-magnify"
            />
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end align-center">
            <v-btn class="mr-2 glass-btn" @click="refreshDb">
              <v-icon left small>mdi-reload</v-icon> Yenile (database.txt)
            </v-btn>
            <v-btn :color="accent" dark @click="openCategoryDialog()">
              <v-icon left small>mdi-folder-plus</v-icon> Yeni Kategori
            </v-btn>
          </v-col>
        </v-row>
      </v-sheet>
    </v-container>

    <v-container class="py-6">
      <v-row dense>
        <v-col
            v-for="cat in filteredCategories"
            :key="cat.id"
            cols="12" md="6" lg="4"
        >
          <v-card class="category-card" outlined>
            <div class="cat-header" :style="headerStyle(cat)">
              <div class="d-flex align-center w-100">
                <div>
                  <div class="subtitle-1 font-weight-bold">{{ cat.name }}</div>
                  <div class="caption">Varsayılan Kar %: {{ cat.defaultMarkup || 0 }}</div>
                </div>
                <v-spacer/>
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item @click="removeCategory(cat)">
                      <v-list-item-icon><v-icon>mdi-delete</v-icon></v-list-item-icon>
                      <v-list-item-title>Sil</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div class="mt-2">
                <v-chip small class="mr-2" :style="chipStyle(cat,'count')">
                  Ürün: {{ itemsOf(cat).length }}
                </v-chip>
                <v-chip small class="mr-2" :style="chipStyle(cat,'stock')">
                  Stok: {{ totalStock(cat) }}
                </v-chip>
                <v-chip small :style="chipStyle(cat,'value')">
                  Değer (Geliş+Ek): {{ tl(stockValue(cat)) }}
                </v-chip>
              </div>
            </div>

            <v-card-text class="pt-0">
              <v-data-table :headers="itemHeaders" :items="itemsOf(cat)" dense hide-default-footer>
                <template v-slot:item.name="{ item }">
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="caption grey--text">{{ item.karat ? item.karat + 'k' : '' }} {{ item.ayar }}</div>
                </template>

                <template v-slot:item.cost="{ item }">{{ tl(item.cost || 0) }}</template>
                <template v-slot:item.extras="{ item }">{{ tl(item.extras || 0) }}</template>
                <template v-slot:item.vatPercent="{ item }">{{ item.vatPercent || 0 }}%</template>
                <template v-slot:item.sell="{ item }">{{ tl(priceCalc(item).priceGross) }}</template>
                <template v-slot:item.profit="{ item }">{{ tl(priceCalc(item).profitTL) }}</template>
                <template v-slot:item.profitPct="{ item }">{{ priceCalc(item).profitPct.toFixed(1) }}%</template>

                <template v-slot:item.stock="{ item }">
                  <v-chip small :color="item.stock <= 0 ? 'red' : item.stock <= 5 ? 'orange' : 'green'" text-color="white">
                    {{ item.stock || 0 }}
                  </v-chip>
                </template>

                <template v-slot:item.ops="{ item }">
                  <v-btn icon small @click="decStock(item)"><v-icon>mdi-minus</v-icon></v-btn>
                  <v-btn icon small @click="incStock(item)"><v-icon>mdi-plus</v-icon></v-btn>
                  <v-btn icon small @click="openItemDialog(cat, item)"><v-icon>mdi-pencil</v-icon></v-btn>
                  <v-btn icon small @click="removeItem(cat, item)"><v-icon>mdi-delete</v-icon></v-btn>
                </template>
              </v-data-table>

              <v-divider class="my-3"/>
              <div class="d-flex justify-space-between">
                <div class="grey--text">Toplam Stok</div>
                <div class="font-weight-bold">{{ totalStock(cat) }}</div>
              </div>
              <div class="d-flex justify-space-between">
                <div class="grey--text">Stok Değeri (Geliş+Ek)</div>
                <div class="font-weight-bold">{{ tl(stockValue(cat)) }}</div>
              </div>
            </v-card-text>

            <v-card-actions class="px-4 pb-4">
              <v-btn small :color="accent" dark @click="openItemDialog(cat)">
                <v-icon left>mdi-plus</v-icon> Ürün Ekle
              </v-btn>
              <v-spacer/>
              <v-btn small outlined @click="openCategoryDialog(cat)">
                <v-icon left>mdi-pencil</v-icon> Kategoriyi Düzenle
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" v-if="filteredCategories.length===0">
          <v-alert type="info" outlined>Sonuç bulunamadı.</v-alert>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialogs.category" max-width="520px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ categoryForm.id ? 'Kategoriyi Düzenle' : 'Yeni Kategori' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="categoryFormRef">
            <v-text-field v-model="categoryForm.name" label="Kategori Adı" dense outlined required />
            <v-text-field v-model="categoryForm.description" label="Açıklama" dense outlined />
            <v-text-field v-model="categoryForm.color" label="Renk (hex veya css)" dense outlined placeholder="#EDE7F6" />
            <v-text-field v-model.number="categoryForm.defaultMarkup" type="number" dense outlined label="Varsayılan Kar %"/>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.category=false">Vazgeç</v-btn>
          <v-spacer/>
          <v-btn :color="accent" dark @click="saveCategory">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogs.item" max-width="820px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ itemForm.id ? 'Ürün Düzenle' : 'Ürün Ekle' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="itemFormRef">
            <v-row dense>
              <v-col cols="12" md="7"><v-text-field v-model="itemForm.name" label="Ürün Adı" dense outlined required /></v-col>
              <v-col cols="6" md="2"><v-text-field v-model="itemForm.karat" label="Karat" dense outlined /></v-col>
              <v-col cols="6" md="3"><v-text-field v-model="itemForm.ayar" label="Ayar" dense outlined /></v-col>
            </v-row>

            <v-row dense>
              <v-col cols="6" md="2"><v-text-field v-model.number="itemForm.stock" type="number" min="0" label="Stok" dense outlined /></v-col>
              <v-col cols="6" md="2"><v-text-field v-model.number="itemForm.cost" type="number" min="0" label="Geliş" dense outlined /></v-col>
              <v-col cols="6" md="2"><v-text-field v-model.number="itemForm.extras" type="number" min="0" label="Ek Masraf" dense outlined /></v-col>
              <v-col cols="6" md="2"><v-text-field v-model.number="itemForm.vatPercent" type="number" min="0" label="KDV %" dense outlined /></v-col>
              <v-col cols="12" md="4" class="d-flex align-center"><v-checkbox v-model="itemForm.vatIncluded" hide-details label="KDV Dahil"/></v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" md="4">
                <v-select v-model="itemForm.pricingMode" :items="pricingModes" item-text="text" item-value="value" dense outlined label="Fiyatlama Modu"/>
              </v-col>
              <v-col cols="6" md="4" v-if="itemForm.pricingMode==='markup'"><v-text-field v-model.number="itemForm.markupPercent" type="number" label="Kar %" dense outlined /></v-col>
              <v-col cols="6" md="4" v-if="itemForm.pricingMode==='profit'"><v-text-field v-model.number="itemForm.profitTL" type="number" label="Kar TL" dense outlined /></v-col>
              <v-col cols="6" md="4" v-if="itemForm.pricingMode==='target'"><v-text-field v-model.number="itemForm.targetPrice" type="number" label="Hedef Fiyat" dense outlined /></v-col>
              <v-col cols="6" md="4"><v-select v-model="itemForm.rounding" :items="roundingOptions" dense outlined label="Yuvarlama"/></v-col>
            </v-row>

            <v-divider class="my-3"/>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-simple-table dense>
                  <tbody>
                  <tr><td>Baz Maliyet</td><td class="text-right">{{ tl(pricePreview.base) }}</td></tr>
                  <tr><td>Net Fiyat</td><td class="text-right">{{ tl(pricePreview.priceNet) }}</td></tr>
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

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2400">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
import { priceCalc } from "@/utils/pricing";
import { get, subscribe, reload } from "@/utils/harddata";

export default {
  name: "KategorilerPage",
  data() {
    return {
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini: this.$vuetify?.breakpoint?.lgAndUp || false,
      accent: localStorage.getItem('jp_accent') || '#5865F2',
      accents: ["#5865F2","#0EA5E9","#22C55E","#F59E0B","#EF4444","#8B5CF6"],
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
        { title:"Yeni Kategori", subtitle:"Grup ekle", icon:"mdi-folder-plus", key:"N", click:()=>this.openCategoryDialog() },
        { title:"Ürün Ekle",     subtitle:"Stoka ekle", icon:"mdi-plus-box",   key:"U", click:()=>this.openItemDialog({ id: (this.categories[0]||{}).id || null }) },
        { title:"Yenile",        subtitle:"database.txt", icon:"mdi-reload",  key:"Y", click:()=>this.refreshDb() },
        { title:"Ürünler",       subtitle:"Liste & düzenle", icon:"mdi-package-variant-closed", key:"G", to:"urunler" },
      ],

      search: "",
      categories: [],

      itemHeaders: [
        { text: "Ürün", value: "name" },
        { text: "Geliş", value: "cost", align: "end", width: 110 },
        { text: "Ekstra", value: "extras", align: "end", width: 110 },
        { text: "KDV %", value: "vatPercent", align: "end", width: 90 },
        { text: "Satış (KDV)", value: "sell", align: "end", width: 140 },
        { text: "Kâr TL", value: "profit", align: "end", width: 110 },
        { text: "Kâr %", value: "profitPct", align: "end", width: 90 },
        { text: "Stok", value: "stock", align: "end", width: 90 },
        { text: "", value: "ops", sortable: false, align: "end", width: 130 }
      ],

      dialogs: { category: false, item: false },
      categoryForm: { id: null, name: "", description: "", color: "", defaultMarkup: 0 },
      itemForm: { id: null, categoryId: null, name: "", karat: "", ayar: "", stock: 0,
        cost: 0, extras: 0, vatPercent: 20, vatIncluded: true,
        pricingMode: "markup", markupPercent: 0, profitTL: 0, targetPrice: null, rounding: "to10" },

      roundingOptions: ["none","to10","to100","to1000","end_990"],
      pricingModes: [
        { text: "Kar % (Markup)", value: "markup" },
        { text: "Kar TL", value: "profit" },
        { text: "Hedef Fiyat", value: "target" },
      ],

      snack: { show:false, color:"green", text:"" },
    };
  },

  created(){
    this.hydrateFromDb();
    subscribe('categories', () => this.hydrateFromDb());
    subscribe('products',   () => this.hydrateFromDb());
  },

  computed: {
    themeLabel(){ return this.$vuetify.theme.dark ? 'Koyu' : 'Açık' },
    filteredCategories() {
      const q = (this.search || "").toLowerCase().trim();
      if (!q) return this.categories;
      return this.categories.filter(cat => {
        const matchCat = (cat.name + " " + (cat.description||"")).toLowerCase().includes(q);
        const matchItem = (cat.items||[]).some(it => this.matchItem(it, q));
        return matchCat || matchItem;
      });
    },
    pricePreview(){
      return priceCalc(this.itemForm);
    }
  },

  methods: {
    setAccent(c){ this.accent = c; localStorage.setItem('jp_accent', c) },
    cycleTheme(){ this.$vuetify.theme.dark = !this.$vuetify.theme.dark },

    priceCalc,
    tl(n){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n||0); },
    newId(){ return Date.now() + Math.floor(Math.random()*1000); },
    toast(t,c="green"){ this.snack = { show:true, color:c, text:t }; },

    // ---------- renk & header ----------
    clamp(n,min,max){ return Math.min(max, Math.max(min, n)); },
    isHex(c){ return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(c||'')); },
    hexToHsl(hex){
      let c = String(hex).replace('#',''); if(c.length===3) c = c.split('').map(x=>x+x).join('');
      const r = parseInt(c.substr(0,2),16)/255;
      const g = parseInt(c.substr(2,2),16)/255;
      const b = parseInt(c.substr(4,2),16)/255;
      const max=Math.max(r,g,b), min=Math.min(r,g,b);
      let h,s,l=(max+min)/2;
      if(max===min){ h=0; s=0; }
      else{
        const d=max-min;
        s=l>0.5? d/(2-max-min): d/(max+min);
        switch(max){
          case r: h=(g-b)/d + (g<b?6:0); break;
          case g: h=(b-r)/d + 2; break;
          case b: h=(r-g)/d + 4; break;
        }
        h=Math.round(h*60);
      }
      return { h, s:Math.round(s*100), l:Math.round(l*100) };
    },
    hsl(h,s,l){ return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`; },
    baseHue(cat){
      const base = cat?.color || this.accent;
      const src  = this.isHex(base) ? base : this.accent;
      return this.hexToHsl(src);
    },
    headerStyle(cat){
      const dark  = this.$vuetify.theme.dark;
      const {h,s,l} = this.baseHue(cat);

      if(dark){
        const c1 = this.hsl(h, this.clamp(s+6, 30, 80), this.clamp(l-18, 16, 32));
        const c2 = this.hsl(h, this.clamp(s+8, 35, 85), this.clamp(l-26, 12, 24));
        return `
          background:
            radial-gradient(90% 60% at 20% 0%, rgba(255,255,255,.08), transparent 60%),
            linear-gradient(135deg, ${c1}, ${c2});
          padding:14px 16px;
          border-bottom:1px solid rgba(255,255,255,.06);
        `;
      }else{
        const c1 = this.hsl(h, this.clamp(s-20, 18, 55), this.clamp(l+30, 88, 96));
        const c2 = this.hsl(h, this.clamp(s-10, 20, 60), this.clamp(l+22, 84, 92));
        return `
          background:
            linear-gradient(180deg, rgba(255,255,255,.65), transparent 60%),
            linear-gradient(135deg, ${c1}, ${c2});
          padding:14px 16px;
          border-bottom:1px solid rgba(0,0,0,.06);
        `;
      }
    },
    chipColors(cat){
      const dark  = this.$vuetify.theme.dark;
      const {h,s} = this.baseHue(cat);
      const count = { h,                 s: this.clamp(s,   35, 75), l: dark ? 36 : 92 };
      const stock = { h:(h+18)%360,      s: this.clamp(s,   40, 80), l: dark ? 32 : 90 };
      const value = { h:(h-18+360)%360,  s: this.clamp(s+5, 45, 85), l: dark ? 28 : 88 };
      return {
        count: { bg: this.hsl(count.h,count.s,count.l), fg: dark ? '#fff' : '#111' },
        stock: { bg: this.hsl(stock.h,stock.s,stock.l), fg: dark ? '#fff' : '#111' },
        value: { bg: this.hsl(value.h,value.s,value.l), fg: dark ? '#fff' : '#111' },
      };
    },
    chipStyle(cat, key){
      const c = this.chipColors(cat)[key];
      return { backgroundColor: c.bg, color: c.fg };
    },

    // ---------- liste & db ----------
    headerStyleLegacy(){}, // placeholder (kullanılmıyor)

    matchItem(it, q){
      return [it.name, it.karat, it.ayar, it.stock]
          .join(" ")
          .toString()
          .toLowerCase()
          .includes(q);
    },
    normalizeId(cid){
      if (cid == null) return null;
      return String(cid).trim().replace(/^cat-/, '');
    },
    fromProduct(p){
      return {
        id: p.id,
        name: p.name || p.isim || '',
        karat: p.karat || '',
        ayar: p.ayar || '',
        stock: Number(p.stock ?? p.stok ?? 0),
        cost: Number(p.cost || 0),
        extras: Number(p.extras || 0),
        vatPercent: Number(p.vatPercent || 0),
        vatIncluded: !!p.vatIncluded,
        pricingMode: p.pricingMode || 'markup',
        markupPercent: Number(p.markupPercent || 0),
        profitTL: Number(p.profitTL || 0),
        targetPrice: p.targetPrice != null ? Number(p.targetPrice) : null,
        rounding: p.rounding || 'to10',
      };
    },
    hydrateFromDb(){
      const catsRaw = get('categories') || [];
      const prods   = get('products')   || [];

      const cats = (catsRaw || []).map(c => ({
        id: this.normalizeId(c.id),
        name: c.name,
        description: c.description || '',
        color: c.color || '#EDE7F6',
        defaultMarkup: Number(c.defaultMarkup || 0),
        items: []
      }));

      const byId = new Map(cats.map(c => [String(c.id), c]));

      prods.forEach(p => {
        let ids = [];
        if (Array.isArray(p.categoryIds) && p.categoryIds.length) {
          ids = p.categoryIds;
        } else if (p.categoryId != null) {
          ids = [p.categoryId];
        }
        ids.forEach(cid => {
          const key = this.normalizeId(cid);
          const target = byId.get(String(key));
          if (target) target.items.push(this.fromProduct(p));
        });
      });

      this.categories = cats;

      if (!prods.length && !catsRaw.length) this.seedDemo();
    },

    itemsOf(cat){
      const q = (this.search || "").toLowerCase().trim();
      if(!q) return cat.items || [];
      const catMatch=(cat.name+" "+(cat.description||"")).toLowerCase().includes(q);
      return catMatch ? (cat.items||[]) : (cat.items||[]).filter(it=>this.matchItem(it,q));
    },

    totalStock(cat){ return (this.itemsOf(cat)).reduce((t,i)=>t+(Number(i.stock)||0),0); },
    stockValue(cat){ return (this.itemsOf(cat)).reduce((t,i)=> t + (Number(i.stock||0) * (Number(i.cost||0)+Number(i.extras||0))), 0); },

    openCategoryDialog(cat=null){
      this.categoryForm = cat
          ? { id: cat.id, name: cat.name, description: cat.description, color: cat.color, defaultMarkup: cat.defaultMarkup || 0 }
          : { id:null, name:"", description:"", color:"", defaultMarkup: 0 };
      this.dialogs.category = true;
    },

    saveCategory(){
      const f = this.categoryForm;
      if(!f.name){ this.toast("Kategori adı boş olamaz","red"); return; }
      if(f.id){
        const i = this.categories.findIndex(c=>c.id===f.id);
        if(i>-1) this.$set(this.categories, i, { ...this.categories[i], ...f });
        this.toast("Kategori güncellendi");
      }else{
        this.categories.push({ ...f, id:this.newId(), items:[] });
        this.toast("Kategori eklendi");
      }
      this.dialogs.category = false;
    },

    removeCategory(cat){
      if(confirm(`"${cat.name}" kategorisini silmek istiyor musun?`)){
        const i = this.categories.findIndex(c=>c.id===cat.id);
        if(i>-1) this.categories.splice(i,1);
        this.toast("Kategori silindi");
      }
    },

    openItemDialog(cat, item=null){
      const markup = cat?.defaultMarkup || 0;
      this.itemForm = item
          ? { ...item, categoryId: cat.id }
          : { id:null, categoryId: cat?.id || null, name:"", karat:"", ayar:"", stock:0,
            cost:0, extras:0, vatPercent:20, vatIncluded:true,
            pricingMode:"markup", markupPercent: markup, profitTL:0, targetPrice:null, rounding:"to10" };
      this.dialogs.item = true;
    },

    saveItem(){
      const f = this.itemForm;
      if(!f.name){ this.toast("Ürün adı boş olamaz","red"); return; }
      const cat = this.categories.find(c=>c.id===f.categoryId);
      if(!cat){ this.toast("Kategori bulunamadı","red"); return; }

      if(f.id){
        let oldCat = this.categories.find(c => (c.items||[]).some(i => i.id === f.id));
        if(oldCat && oldCat.id !== cat.id){
          const idx = oldCat.items.findIndex(i => i.id === f.id);
          const original = oldCat.items[idx];
          oldCat.items.splice(idx,1);
          cat.items = cat.items || [];
          cat.items.push({ ...original, ...f });
        }else{
          const idx = (cat.items||[]).findIndex(i => i.id === f.id);
          if(idx>-1) this.$set(cat.items, idx, { ...cat.items[idx], ...f });
        }
        this.toast("Ürün güncellendi");
      }else{
        cat.items = cat.items || [];
        cat.items.push({ ...f, id: this.newId() });
        this.toast("Ürün eklendi");
      }
      this.dialogs.item = false;
    },

    removeItem(cat, item){
      const i = (cat.items||[]).findIndex(x=>x.id===item.id);
      if(i>-1){ cat.items.splice(i,1); this.toast("Ürün silindi"); }
    },

    incStock(item){ item.stock = Number(item.stock||0) + 1; },
    decStock(item){ item.stock = Math.max(0, Number(item.stock||0) - 1); },

    async refreshDb(){
      try{
        await reload(true);
        this.toast('Veriler yenilendi');
      }catch(e){
        console.warn(e); this.toast('Yenileme başarısız','red');
      }
    },

    normalizeCategories(arr){
      return (arr||[]).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        color: c.color || '#EDE7F6',
        defaultMarkup: Number(c.defaultMarkup || 0),
        items: (c.items||[]).map(i => ({
          id: i.id,
          name: i.name,
          karat: i.karat || '',
          ayar: i.ayar || '',
          stock: Number(i.stock || 0),
          cost: Number(i.cost || 0),
          extras: Number(i.extras || 0),
          vatPercent: Number(i.vatPercent || 0),
          vatIncluded: !!i.vatIncluded,
          pricingMode: i.pricingMode || 'markup',
          markupPercent: Number(i.markupPercent || 0),
          profitTL: Number(i.profitTL || 0),
          targetPrice: i.targetPrice != null ? Number(i.targetPrice) : null,
          rounding: i.rounding || 'to10',
        }))
      }))
    },

    seedDemo(){
      this.categories = this.normalizeCategories([
        {
          id: 1, name: "Altın", description: "22/18/14 ayar", color: "#FFF6EC", defaultMarkup: 20,
          items: [
            { id: 101, name: "Altın Yüzük", karat: 14, ayar: "14 Ayar", stock: 8,
              cost: 5200, extras: 100, vatPercent: 20, vatIncluded: true,
              pricingMode: "markup", markupPercent: 30, profitTL: 0, targetPrice: null, rounding: "to10" },
          ]
        },
        {
          id: 2, name: "Gümüş", description: "925 ayar", color: "#ECF9FA", defaultMarkup: 35,
          items: [
            { id: 201, name: "Gümüş Kolye", karat: 0, ayar: "925", stock: 12,
              cost: 700, extras: 50, vatPercent: 20, vatIncluded: true,
              pricingMode: "profit", markupPercent: 0, profitTL: 300, targetPrice: null, rounding: "to10" },
          ]
        },
        {
          id: 3, name: "Pırlanta", description: "18 ayar", color: "#F6F1FB", defaultMarkup: 25,
          items: [
            { id: 301, name: "Pırlanta Küpe", karat: 18, ayar: "18 Ayar", stock: 5,
              cost: 20000, extras: 600, vatPercent: 20, vatIncluded: true,
              pricingMode: "target", markupPercent: 0, profitTL: 0, targetPrice: 25990, rounding: "end_990" },
          ]
        }
      ])
    },
  }
};
</script>

<style scoped>
.elevated-drawer{
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
}

.hero{
  position: relative; height:120px; overflow:hidden;
  border-bottom: 1px solid rgba(0,0,0,.04);
}
.theme--light .hero{ background: linear-gradient(180deg,#ffffff, #fafafa); }
.theme--dark  .hero{ background: linear-gradient(180deg,#0f1115, #0a0c10); }
.hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation: float 16s ease-in-out infinite;
  filter: blur(42px); opacity:.55;
}
.theme--dark .hero-glow{ opacity:.35; }
.hero-content{ position:relative; height:100%; display:flex; flex-direction:column; justify-content:center; padding: 12px 24px; }
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px; }
.hero-sub{ opacity:.8 }

.filters-sheet{
  border-radius: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(8px) saturate(120%);
}
.theme--dark .filters-sheet{
  border-color: rgba(255,255,255,.06);
  background: rgba(24,24,24,.7);
}
.glass-btn{
  background: rgba(255,255,255,.6);
  border: 1px solid rgba(0,0,0,.06);
}
.theme--dark .glass-btn{
  background: rgba(24,24,24,.6);
  border-color: rgba(255,255,255,.08);
}

.qa{
  display:flex; align-items:center;
  padding: 10px 14px; margin-right:12px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: rgba(255,255,255,.7);
  backdrop-filter: blur(6px);
  transition: transform .2s ease, box-shadow .2s ease;
}
.theme--dark .qa{ background: rgba(30,30,30,.7); }
.qa:hover{ transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,.08); }

.category-card{
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
}
.theme--dark .category-card{
  box-shadow: 0 6px 24px rgba(0,0,0,.35);
}

.cat-header{
  position: relative;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  overflow: hidden;
}
.cat-header::after{
  content:"";
  position:absolute; inset:0;
  pointer-events:none;
  background: radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,.18), transparent 60%);
}

@keyframes float{
  0%{ transform: translate3d(0,0,0) rotate(0deg); }
  50%{ transform: translate3d(2%, -2%, 0) rotate(1deg); }
  100%{ transform: translate3d(0,0,0) rotate(0deg); }
}
</style>

<style>
.v-main__wrap{ padding-top:0 !important; }
</style>
