<template>
  <v-container >
    <!-- ÜST ARAÇ ÇUBUĞU -->
    <v-card class="mb-4" outlined>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
                v-model="search"
                dense outlined clearable
                label="Kategori / Ürün Ara (ad, karat, ayar)"
            />
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end align-center">
            <v-btn color="indigo" dark @click="openCategoryDialog()">
              <v-icon left>mdi-folder-plus</v-icon> Yeni Kategori
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- KATEGORİ KARTLARI -->
    <v-row dense>
      <v-col
          v-for="cat in filteredCategories"
          :key="cat.id"
          cols="12" md="6" lg="6"
      >
        <v-card class="category-card" outlined>
          <!-- başlık -->
          <div class="cat-header" :style="headerStyle(cat)">
            <div class="d-flex align-center w-100">
              <div>
                <div class="subtitle-1 font-weight-bold">{{ cat.name }}</div>
                <div class="caption">{{ cat.description || ' ' }}</div>
              </div>
              <v-spacer/>
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="openCategoryDialog(cat)">
                    <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
                    <v-list-item-title>Kategoriyi Düzenle</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="removeCategory(cat)">
                    <v-list-item-icon><v-icon>mdi-delete</v-icon></v-list-item-icon>
                    <v-list-item-title>Sil</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div class="mt-2">
              <v-chip small class="mr-2" color="indigo" text-color="white">
                Ürün: {{ itemsOf(cat).length }}
              </v-chip>
              <v-chip small class="mr-2" color="teal" text-color="white">
                Stok: {{ totalStock(cat) }}
              </v-chip>
              <v-chip small color="deep-purple" text-color="white">
                Değer: {{ tl(stockValue(cat)) }}
              </v-chip>
            </div>
          </div>

          <!-- ürün tablosu -->
          <v-card-text class="pt-0">
            <v-data-table
                :headers="itemHeaders"
                :items="itemsOf(cat)"
                dense
                hide-default-footer
            >
              <template v-slot:item.name="{ item }">
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="caption grey--text">
                  {{ item.karat ? item.karat + 'k' : '' }} {{ item.ayar }}
                </div>
              </template>

              <template v-slot:item.price="{ item }">{{ tl(item.price) }}</template>

              <template v-slot:item.stock="{ item }">
                <v-chip
                    small
                    :color="item.stock <= 0 ? 'red' : item.stock <= 5 ? 'orange' : 'green'"
                    text-color="white"
                >
                  {{ item.stock }}
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
              <div class="grey--text">Stok Değeri</div>
              <div class="font-weight-bold">{{ tl(stockValue(cat)) }}</div>
            </div>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn small color="indigo" dark @click="openItemDialog(cat)">
              <v-icon left>mdi-plus</v-icon> Ürün Ekle
            </v-btn>
            <v-btn icon small @click="removeItem(cat, item)"><v-icon>mdi-delete</v-icon></v-btn>

            <v-spacer/>
            <v-btn small outlined @click="openCategoryDialog(cat)">
              <v-icon left>mdi-pencil</v-icon> Kategoriyi Düzenle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- aramada hiç sonuç yoksa -->
      <v-col cols="12" v-if="filteredCategories.length===0">
        <v-alert type="info" outlined>Sonuç bulunamadı.</v-alert>
      </v-col>
    </v-row>

    <!-- KATEGORİ DİYALOĞU -->
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
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.category=false">Vazgeç</v-btn>
          <v-spacer/>
          <v-btn color="indigo" dark @click="saveCategory">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ÜRÜN DİYALOĞU (kategori seçimi var: taşıyabilirsin) -->
    <v-dialog v-model="dialogs.item" max-width="560px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ itemForm.id ? 'Ürün Düzenle' : 'Ürün Ekle' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="itemFormRef">
            <v-row dense>
              <v-col cols="12" md="7">
                <v-text-field v-model="itemForm.name" label="Ürün Adı" dense outlined required />
              </v-col>
              <v-col cols="12" md="5">
                <v-select
                    v-model="itemForm.categoryId"
                    :items="categories.map(c => ({ text: c.name, value: c.id }))"
                    label="Kategori"
                    dense outlined
                />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model="itemForm.karat" label="Karat" dense outlined />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="itemForm.ayar" label="Ayar" dense outlined />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model.number="itemForm.price" type="number" min="0" label="Fiyat" dense outlined />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="itemForm.stock" type="number" min="0" label="Stok" dense outlined />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.item=false">Vazgeç</v-btn>
          <v-spacer/>
          <v-btn color="indigo" dark @click="saveItem">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2400">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "KategorilerPage",
  data() {
    return {
      search: "",
      categories: [
        {
          id: 1, name: "Altın", description: "22/18/14 ayar",
          color: "#FFF6EC",
          items: [
            { id: 101, name: "Altın Bilezik", karat: 22, ayar: "22 Ayar", price: 18500, stock: 3 },
            { id: 102, name: "Altın Yüzük",   karat: 14, ayar: "14 Ayar", price:  6200, stock: 8 },
          ]
        },
        {
          id: 2, name: "Gümüş", description: "925 ayar",
          color: "#ECF9FA",
          items: [
            { id: 201, name: "Gümüş Kolye", karat: 0, ayar: "925", price: 950, stock: 12 },
            { id: 202, name: "Gümüş Bileklik", karat: 0, ayar: "925", price: 900, stock: 6 },
          ]
        },
        {
          id: 3, name: "Pırlanta", description: "18 ayar",
          color: "#F6F1FB",
          items: [
            { id: 301, name: "Pırlanta Küpe", karat: 18, ayar: "18 Ayar", price: 24500, stock: 5 },
          ]
        }
      ],

      itemHeaders: [
        { text: "Ürün", value: "name" },
        { text: "Fiyat", value: "price", align: "end", width: 110 },
        { text: "Stok", value: "stock", align: "end", width: 100 },
        { text: "", value: "ops", sortable: false, align: "end", width: 130 }
      ],

      dialogs: { category: false, item: false },
      categoryForm: { id: null, name: "", description: "", color: "" },
      itemForm: { id: null, categoryId: null, name: "", karat: "", ayar: "", price: 0, stock: 0 },

      snack: { show:false, color:"green", text:"" },
    };
  },
  computed: {
    filteredCategories() {
      const q = (this.search || "").toLowerCase().trim();
      if (!q) return this.categories;
      return this.categories.filter(cat => {
        const matchCat = (cat.name + " " + (cat.description||"")).toLowerCase().includes(q);
        const matchItem = cat.items.some(it => this.matchItem(it, q));
        return matchCat || matchItem;
      });
    }
  },
  methods: {
    // ---------- helpers ----------
    tl(n){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n||0); },
    newId(){ return Date.now() + Math.floor(Math.random()*1000); },
    toast(t,c="green"){ this.snack = { show:true, color:c, text:t }; },
    headerStyle(cat){
      const c = cat.color || "#EDE7F6";
      return `background: linear-gradient(180deg, ${c}, #ffffff); padding: 14px 16px;`;
    },
    matchItem(it, q){
      return [
        it.name, it.karat, it.ayar, it.price, it.stock
      ].join(" ").toString().toLowerCase().includes(q);
    },
    itemsOf(cat){
      const q = (this.search || "").toLowerCase().trim();
      if (!q) return cat.items;
      // kategori adı eşleşiyorsa tümünü göster; değilse ürün filtrele
      const catMatch = (cat.name + " " + (cat.description||"")).toLowerCase().includes(q);
      return catMatch ? cat.items : cat.items.filter(it => this.matchItem(it, q));
    },
    totalStock(cat){ return this.itemsOf(cat).reduce((t,i)=>t+(Number(i.stock)||0),0); },
    stockValue(cat){ return this.itemsOf(cat).reduce((t,i)=>t+(Number(i.stock||0)*Number(i.price||0)),0); },

    // ---------- kategori işlemleri ----------
    openCategoryDialog(cat=null){
      this.categoryForm = cat
          ? { id: cat.id, name: cat.name, description: cat.description, color: cat.color }
          : { id: null, name: "", description: "", color: "" };
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
        this.categories.push({ ...f, id: this.newId(), items: [] });
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

    // ---------- ürün işlemleri ----------
    openItemDialog(cat, item=null){
      this.itemForm = item
          ? { ...item, categoryId: cat.id }
          : { id:null, categoryId: cat.id, name:"", karat:"", ayar:"", price:0, stock:0 };
      this.dialogs.item = true;
    },
    saveItem(){
      const f = this.itemForm;
      if(!f.name){ this.toast("Ürün adı boş olamaz","red"); return; }
      const targetCat = this.categories.find(c=>c.id===f.categoryId);
      if(!targetCat){ this.toast("Kategori bulunamadı","red"); return; }

      if(f.id){
        // item mevcut: kategorisi değiştiyse taşı
        let oldCat = this.categories.find(c => c.items.some(i => i.id === f.id));
        if(oldCat && oldCat.id !== targetCat.id){
          // eski kategoriden çıkar, yeni kategoriye ekle
          const idx = oldCat.items.findIndex(i => i.id === f.id);
          const original = oldCat.items[idx];
          oldCat.items.splice(idx,1);
          targetCat.items.push({ ...original, ...f });
        }else{
          // aynı kategoride güncelle
          const idx = targetCat.items.findIndex(i => i.id === f.id);
          if(idx>-1) this.$set(targetCat.items, idx, { ...targetCat.items[idx], ...f });
        }
        this.toast("Ürün güncellendi");
      }else{
        targetCat.items.push({ ...f, id: this.newId() });
        this.toast("Ürün eklendi");
      }
      this.dialogs.item = false;
    },
    removeItem(cat, item){
      const i = cat.items.findIndex(x=>x.id===item.id);
      if(i>-1){ cat.items.splice(i,1); this.toast("Ürün silindi"); }
    },
    incStock(item){ item.stock = Number(item.stock||0) + 1; },
    decStock(item){
      item.stock = Math.max(0, Number(item.stock||0) - 1);
    },
  }
};
</script>

<style scoped>
.category-card { border-radius: 16px; overflow: hidden; }
.cat-header { /* gradient zaten inline */ }
</style>
