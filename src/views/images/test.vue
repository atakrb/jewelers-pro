<template>
  <v-app>
    <v-main>
      <template>
        <v-card
            class="mx-auto overflow-hidden"
            height="1000"
        >
          <v-app-bar
              color="deep-purple"
              dark
          >
            <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

            <v-toolbar-title>Title</v-toolbar-title>
          </v-app-bar>

          <v-navigation-drawer
              v-model="drawer"
              absolute
              temporary
          >
            <v-list
                nav
                dense
            >
              <v-list-item-group
                  v-model="group"
                  active-class="deep-purple--text text--accent-4"
              >
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-home</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Home</v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-account</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Account</v-list-item-title>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-navigation-drawer>


          <v-container>
            <v-row>
              <v-col cols="6">
                <v-card elevation="0" class="pa-3 rounded-lg" outlined>
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi-gold</v-icon>
                      <div class="title font-weight-medium">Altın Piyasası</div>
                    </div>
                    <v-chip small class="text--secondary" outlined>
                      Güncellenme: 16:12
                    </v-chip>
                  </div>

                  <v-row class="mt-3" dense>
                    <v-col cols="6" sm="3" v-for="(p, i) in gold" :key="'p-'+i">
                      <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                        <div class="caption text--secondary">{{ p.name }}</div>
                        <div class="headline font-weight-bold">{{ p.buy }} <span class="subtitle-2">₺</span></div>
                        <div class="caption">
                          <v-icon x-small class="mr-1" :class="p.change>0?'success--text':'error--text'">
                            {{ p.change > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                          </v-icon>
                          {{ p.change }}%
                        </div>
                      </v-sheet>
                    </v-col>
                  </v-row>

                  <div class="d-flex align-center justify-space-between mt-2">
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">mdi-gold</v-icon>
                      <div class="title font-weight-medium">Gümüş Piyasası</div>
                    </div>
                  </div>

                  <v-row class="mt-3" dense>
                    <v-col cols="6" sm="3" v-for="(p, i) in silver" :key="'p-'+i">
                      <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                        <div class="caption text--secondary">{{ p.name }}</div>
                        <div class="headline font-weight-bold">{{ p.buy }} <span class="subtitle-2">₺</span></div>
                        <div class="caption">
                          <v-icon x-small class="mr-1" :class="p.change>0?'success--text':'error--text'">
                            {{ p.change > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                          </v-icon>
                          {{ p.change }}%
                        </div>
                      </v-sheet>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>


              <v-col cols="3">
                <v-card elevation="0" class="pa-3 rounded-lg" outlined>

                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                    <div class="title font-weight-medium">Hızlı İşlemler</div>
                    <v-chip small class="text--secondary" outlined>
                      Hızlı İşlem Ekle
                    </v-chip>
                  </div>

                  <v-row class="ma-3" dense>
                    <v-col cols="12" sm="12">
                      <v-btn class="ma-1" outlined>
                        SATIŞ
                      </v-btn>
                      <v-btn class="ma-1" outlined>
                        ALIŞ
                      </v-btn>
                      <v-btn class="ma-1" outlined>
                        KAR DÜZENLE
                      </v-btn>
                      <v-btn class="ma-1" outlined>
                        TOPTANCILAR
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>

                <v-row class="pt-3 " dense>
                  <v-col>
                    <v-card elevation="0" class="pa-3 rounded-lg" outlined>
                      <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                          <v-icon class="mr-2">mdi-gold</v-icon>
                          <div class="title font-weight-medium">TRY/USD</div>
                        </div>
                        <v-chip small class="text--secondary" outlined>
                          Güncellenme: 16:12
                        </v-chip>
                      </div>

                      <v-row class="mt-3" dense>
                        <v-col cols="6" sm="6" v-for="(p, i) in trusd" :key="'p-'+i">
                          <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                            <div class="caption text--secondary">{{ p.name }}</div>
                            <div class="headline font-weight-bold">{{ p.buy }} <span class="subtitle-2">₺</span></div>
                            <div class="caption">
                              <v-icon x-small class="mr-1" :class="p.change>0?'success--text':'error--text'">
                                {{ p.change > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                              </v-icon>
                              {{ p.change }}%
                            </div>
                          </v-sheet>
                        </v-col>
                      </v-row>

                      <div class="d-flex align-center justify-space-between mt-2">
                        <div class="d-flex align-center">
                          <v-icon class="mr-2">mdi-gold</v-icon>
                          <div class="title font-weight-medium">TRY/EURO</div>
                        </div>
                      </div>

                      <v-row class="mt-3" dense>
                        <v-col cols="6" sm="6" v-for="(p, i) in treuro" :key="'p-'+i">
                          <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                            <div class="caption text--secondary">{{ p.name }}</div>
                            <div class="headline font-weight-bold">{{ p.buy }} <span class="subtitle-2">₺</span></div>
                            <div class="caption">
                              <v-icon x-small class="mr-1" :class="p.change>0?'success--text':'error--text'">
                                {{ p.change > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                              </v-icon>
                              {{ p.change }}%
                            </div>
                          </v-sheet>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>


              </v-col>
              <v-col cols="3">
                <v-card elevation="0" class="pa-3 rounded-lg" outlined>

                  <div class="d-flex align-center">
                    <v-icon class="mr-2">mdi-file-document-arrow-right-outline</v-icon>
                    <div class="title font-weight-medium">Envanter</div>
                    <v-chip small class="text--secondary ms-16" outlined>
                      Görüntüle
                    </v-chip>
                  </div>

                  <template>
                    <v-simple-table
                        fixed-header
                        height="300px"
                    >
                      <template v-slot:default>
                        <thead>
                        <tr>
                          <th class="text-left">
                            ID
                          </th>
                          <th class="text-left">
                            Ürün Adı
                          </th>
                          <th class="text-left">
                            Fiyat
                          </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr
                            v-for="item in envatory"
                            :key="item.name"
                        >
                          <td>{{ item.id }}</td>
                          <td>{{ item.name }}</td>
                          <td>{{ item.price }}</td>
                        </tr>
                        </tbody>
                      </template>
                    </v-simple-table>
                  </template>


                </v-card>
              </v-col>

            </v-row>

          </v-container>
        </v-card>
      </template>


    </v-main>
  </v-app>
</template>


<script>
export default {
  name: "JewelryDashboard",
  data: () => ({
    drawer: false,
    // Görsel amaçlı sahte fiyatlar
    gold: [
      {name: "Gram Altın", buy: "2.585", change: 0.8},
      {name: "Çeyrek", buy: "4.250", change: -0.4},
      {name: "Yarım", buy: "8.450", change: 0.2},
      {name: "Cumhuriyet", buy: "16.900", change: -0.1},
    ],
    silver: [
      {name: "Gram Gümüş", buy: "585", change: 0.8},
      {name: "Çeyrek", buy: "1.250", change: -0.4},
      {name: "Yarım", buy: "2.450", change: 0.2},
      {name: "Kilo", buy: "5.023", change: -0.1},
    ],
    envatory: [
      {
        id: 1,
        name: 'Frozen Yogurt',
        price: 159,
      },
      {
        id: 2,
        name: 'Ice cream sandwich',
        price: 237,
      },
      {
        id: 3,
        name: 'Eclair',
        price: 262,
      },
      {
        id: 4,
        name: 'Cupcake',
        price: 305,
      },
      {
        id: 5,
        name: 'Gingerbread',
        price: 356,
      },
      {
        id: 6,
        name: 'Jelly bean',
        price: 375,
      },
      {
        id: 7,
        name: 'Lollipop',
        price: 392,
      },
      {
        id: 8,
        name: 'Honeycomb',
        price: 408,
      },
      {
        id: 9,
        name: 'Donut',
        price: 452,
      },
      {
        id: 10,
        name: 'KitKat',
        price: 518,
      },
    ],
    trusd: [
      {name: "Alış", buy: "42", change: 0.8},
      {name: "Satış", buy: "43", change: -0.49},
    ],

    treuro: [
      {name: "Alış", buy: "46", change: 0.12},
      {name: "Satış", buy: "47", change: -0.21},
    ],

  }),
};
</script>


<style scoped>
.text-decoration-none {
  text-decoration: none;
}

.text-black {
  color: black;
}

.red-btn:hover .v-icon {
  color: red !important;
  transition: ease .2ms !important;
}

::v-deep .red-btn:hover {
  color: red !important;
}
</style>
