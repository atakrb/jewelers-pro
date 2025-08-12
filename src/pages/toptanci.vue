<template>
  <v-container fluid class="py-4">
    <!-- ÜST ARAÇ ÇUBUĞU -->
    <v-card class="mb-4" outlined>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="search" dense outlined clearable label="Toptancı Ara (ad, telefon, e-posta)"/>
          </v-col>
          <v-col cols="12" md="6" class="d-flex justify-end align-center">
            <v-btn color="indigo" dark @click="openSupplierDialog()">
              <v-icon left>mdi-account-plus</v-icon> Yeni Toptancı
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- KART LİSTESİ -->
    <v-row dense>
      <v-col
          v-for="(s, idx) in filteredSuppliers"
          :key="s.id"
          cols="12" md="6" lg="4"
      >
        <v-card class="supplier-card" outlined>
          <v-card-title class="py-3">
            <div class="d-flex align-center">
              <v-avatar size="36" class="mr-3" color="deep-purple" tile>
                <span class="white--text font-weight-bold">{{ initials(s.name) }}</span>
              </v-avatar>
              <div>
                <div class="subtitle-1 font-weight-bold">{{ s.name }}</div>
                <div class="caption grey--text">{{ s.phone }} · {{ s.email }}</div>
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
              <v-chip small class="mr-2" color="indigo" text-color="white">
                Ürün: {{ s.items.length }}
              </v-chip>
              <v-chip small class="mr-2" color="teal" text-color="white">
                Maliyet: {{ tl(totalCost(s)) }}
              </v-chip>
              <v-chip small color="deep-purple" text-color="white">
                Potansiyel Ciro: {{ tl(totalSales(s)) }}
              </v-chip>
            </div>

            <!-- ÜRÜN TABLOSU -->
            <v-data-table
                :headers="itemHeaders"
                :items="s.items"
                dense hide-default-footer
            >
              <template v-slot:item.name="{ item }">
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="caption grey--text">{{ item.karat ? item.karat + 'k' : '' }} {{ item.ayar }}</div>
              </template>

              <template v-slot:item.qty="{ item }">
                <div class="d-flex align-center justify-end">
                  <v-btn icon x-small @click="decQty(s, item)"><v-icon small>mdi-minus</v-icon></v-btn>
                  <v-text-field
                      v-model.number="item.qty" type="number" min="0"
                      dense hide-details class="mx-1 text-right" style="max-width:70px"
                  />
                  <v-btn icon x-small @click="incQty(item)"><v-icon small>mdi-plus</v-icon></v-btn>
                </div>
              </template>

              <template v-slot:item.cost="{ item }">{{ tl(item.cost) }}</template>
              <template v-slot:item.price="{ item }">{{ tl(item.price) }}</template>
              <template v-slot:item.subtotal="{ item }">{{ tl(item.qty * item.cost) }}</template>

              <template v-slot:item.ops="{ item }">
                <v-btn icon small @click="openItemDialog(s, item)"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn icon small @click="removeItem(s, item)"><v-icon>mdi-delete</v-icon></v-btn>
              </template>
            </v-data-table>

            <v-divider class="my-3"/>

            <div class="d-flex justify-space-between">
              <div class="grey--text">Toplam Maliyet</div>
              <div class="font-weight-bold">{{ tl(totalCost(s)) }}</div>
            </div>
            <div class="d-flex justify-space-between">
              <div class="grey--text">Toplam Satış</div>
              <div class="font-weight-bold">{{ tl(totalSales(s)) }}</div>
            </div>
            <div class="d-flex justify-space-between">
              <div class="grey--text">Tahmini Kar</div>
              <div class="font-weight-bold">{{ tl(totalSales(s) - totalCost(s)) }}</div>
            </div>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn small color="indigo" dark @click="openItemDialog(s)">
              <v-icon left>mdi-plus</v-icon> Ürün Ekle
            </v-btn>
            <v-spacer/>
            <v-btn small outlined @click="openSupplierDialog(s)">
              <v-icon left>mdi-account-edit</v-icon> Toptancıyı Düzenle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

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
          <v-btn color="indigo" dark @click="saveSupplier">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ÜRÜN DİYALOĞU -->
    <v-dialog v-model="dialogs.item" max-width="560px">
      <v-card>
        <v-card-title class="subtitle-1 font-weight-bold">
          {{ itemForm.id ? 'Ürün Düzenle' : 'Ürün Ekle' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="itemFormRef">
            <v-text-field v-model="itemForm.name" label="Ürün Adı" dense outlined required />
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model="itemForm.karat" label="Karat" dense outlined />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="itemForm.ayar" label="Ayar" dense outlined />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="4">
                <v-text-field v-model.number="itemForm.qty" type="number" min="0" label="Adet" dense outlined />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="itemForm.cost" type="number" min="0" label="Geliş Fiyatı" dense outlined />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="itemForm.price" type="number" min="0" label="Satış Fiyatı" dense outlined />
              </v-col>
            </v-row>
            <div class="grey--text caption">
              Ara Toplam: <strong>{{ tl((itemForm.qty||0) * (itemForm.cost||0)) }}</strong>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-btn text @click="dialogs.item=false">Vazgeç</v-btn>
          <v-spacer/>
          <v-btn color="indigo" dark @click="saveItem">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bildirim -->
    <v-snackbar v-model="snack.show" :color="snack.color" timeout="2500">{{ snack.text }}</v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: "ToptanciPage",
  data() {
    return {
      search: "",
      suppliers: [
        {
          id: 1,
          name: "Anadolu Kuyumculuk",
          phone: "0 (212) 555 11 22",
          email: "satis@anadolukuyum.com",
          address: "İstanbul",
          notes: "Aylık iskonto %3",
          items: [
            { id: 11, name: "Altın Bilezik", karat: 22, ayar: "22 Ayar", qty: 3, cost: 16500, price: 18500 },
            { id: 12, name: "Altın Yüzük",   karat: 14, ayar: "14 Ayar", qty: 8, cost:  5200, price:  6200 },
          ]
        },
        {
          id: 2,
          name: "Gümüş Dünyası",
          phone: "0 (312) 444 33 22",
          email: "info@gumusdunyasi.com",
          address: "Ankara",
          notes: "",
          items: [
            { id: 21, name: "Gümüş Kolye", karat: 0, ayar: "925", qty: 15, cost: 700, price: 950 },
            { id: 22, name: "Gümüş Bileklik", karat: 0, ayar: "925", qty: 10, cost: 650, price: 900 }
          ]
        }
      ],

      // tablolar
      itemHeaders: [
        { text: "Ürün", value: "name" },
        { text: "Adet", value: "qty", align: "end", width: 130 },
        { text: "Geliş", value: "cost", align: "end", width: 100 },
        { text: "Satış", value: "price", align: "end", width: 100 },
        { text: "Ara Toplam", value: "subtotal", align: "end", width: 120 },
        { text: "", value: "ops", sortable: false, align: "end", width: 80 }
      ],

      // dialoglar & formlar
      dialogs: { supplier: false, item: false },
      supplierForm: { id: null, name: "", phone: "", email: "", address: "", notes: "" },
      itemForm: { id: null, supplierId: null, name: "", karat: "", ayar: "", qty: 0, cost: 0, price: 0 },

      snack: { show:false, color:"green", text:"" },
    };
  },
  computed: {
    filteredSuppliers() {
      const q = (this.search || "").toLowerCase().trim();
      if (!q) return this.suppliers;
      return this.suppliers.filter(s =>
          [s.name, s.phone, s.email].join(" ").toLowerCase().includes(q)
      );
    }
  },
  methods: {
    // ---- helpers
    tl(n){ return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n||0); },
    initials(str){ return (str||'').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(); },
    totalCost(s){ return s.items.reduce((t,i)=>t + i.qty*i.cost, 0); },
    totalSales(s){ return s.items.reduce((t,i)=>t + i.qty*i.price, 0); },
    newId(){ return Date.now() + Math.floor(Math.random()*1000); },
    toast(text,color="green"){ this.snack = { show:true, color, text }; },

    // ---- supplier ops
    openSupplierDialog(s=null){
      this.supplierForm = s ? { ...s } : { id:null, name:"", phone:"", email:"", address:"", notes:"" };
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

    // ---- item ops
    openItemDialog(supplier, item=null){
      this.itemForm = item
          ? { ...item, supplierId: supplier.id }
          : { id:null, supplierId: supplier.id, name:"", karat:"", ayar:"", qty:1, cost:0, price:0 };
      this.dialogs.item = true;
    },
    saveItem(){
      const f = this.itemForm;
      if(!f.name){ this.toast("Ürün adı boş olamaz","red"); return; }
      const s = this.suppliers.find(x=>x.id===f.supplierId);
      if(!s){ this.toast("Toptancı bulunamadı","red"); return; }

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
      const i = supplier.items.findIndex(x=>x.id===item.id);
      if(i>-1){ supplier.items.splice(i,1); this.toast("Ürün silindi"); }
    },
    incQty(item){ item.qty = Number(item.qty||0) + 1; },
    decQty(supplier, item){
      if(item.qty>0) item.qty = Number(item.qty) - 1;
      if(item.qty===0 && confirm("Adet 0 oldu. Ürün karttan kaldırılsın mı?")){
        this.removeItem(supplier, item);
      }
    },
  }
};
</script>

<style scoped>
.supplier-card { border-radius: 16px; }
</style>
