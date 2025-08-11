<template>
  <v-app>
    <!-- SABİT APP BAR -->
    <v-app-bar app color="deep-purple" dark>
      <v-app-bar-nav-icon @click="drawer = true"/>
      <v-toolbar-title>ANA MENÜ</v-toolbar-title>
    </v-app-bar>

    <!-- DRAWER -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list nav dense>
        <v-list-item-group v-model="group" active-class="deep-purple--text text--accent-4">
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

    <v-main>
      <v-container>
        <!-- ÜST: SOL/SAĞ PANELLER -->
        <v-row>
          <!-- SOL: Altın & Gümüş -->
          <v-col cols="12" md="6">
            <v-card elevation="0" class="pa-3 rounded-lg" outlined>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-gold</v-icon>
                  <div class="title font-weight-medium">Altın Piyasası</div>
                </div>
                <v-chip small class="text--secondary" outlined>Güncellenme: 16:12</v-chip>
              </div>

              <v-row class="mt-3" dense>
                <v-col cols="6" sm="3" v-for="(p, i) in gold" :key="'gold-'+i">
                  <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                    <div class="caption text--secondary">{{ p.name }}</div>
                    <div class="headline font-weight-bold">
                      {{ p.buy }} <span class="subtitle-2">₺</span>
                    </div>
                    <div class="caption">
                      <v-icon x-small class="mr-1" :class="p.change>0?'success--text':'error--text'">
                        {{ p.change > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                      </v-icon>
                      {{ p.change }}%
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>

              <div class="d-flex align-center justify-space-between mt-4">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-silverware</v-icon>
                  <div class="title font-weight-medium">Gümüş Piyasası</div>
                </div>
              </div>

              <v-row class="mt-3" dense>
                <v-col cols="6" sm="3" v-for="(p, i) in silver" :key="'silver-'+i">
                  <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                    <div class="caption text--secondary">{{ p.name }}</div>
                    <div class="headline font-weight-bold">
                      {{ p.buy }} <span class="subtitle-2">₺</span>
                    </div>
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

          <!-- SAĞ: TRY/USD & TRY/EURO -->
          <v-col cols="12" md="6">
            <v-card elevation="0" class="pa-3 rounded-lg" outlined>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-currency-usd</v-icon>
                  <div class="title font-weight-medium">TRY / USD</div>
                </div>
                <v-chip small class="text--secondary" outlined>Güncellenme: 16:12</v-chip>
              </div>

              <v-row class="mt-3" dense>
                <v-col cols="6" sm="6" v-for="(p, i) in trusd" :key="'usd-'+i">
                  <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                    <div class="caption text--secondary">{{ p.name }}</div>
                    <div class="headline font-weight-bold">
                      {{ p.buy }} <span class="subtitle-2">₺</span>
                    </div>
                    <div class="caption">
                      <v-icon x-small class="mr-1" :class="p.change>0?'success--text':'error--text'">
                        {{ p.change > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                      </v-icon>
                      {{ p.change }}%
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>

              <div class="d-flex align-center justify-space-between mt-4">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-currency-eur</v-icon>
                  <div class="title font-weight-medium">TRY / EURO</div>
                </div>
              </div>

              <v-row class="mt-3" dense>
                <v-col cols="6" sm="6" v-for="(p, i) in treuro" :key="'eur-'+i">
                  <v-sheet class="pa-3 rounded-lg price-tile" outlined>
                    <div class="caption text--secondary">{{ p.name }}</div>
                    <div class="headline font-weight-bold">
                      {{ p.buy }} <span class="subtitle-2">₺</span>
                    </div>
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

        <!-- HIZLI İŞLEMLER -->
        <v-row class="pt-3" dense>
          <v-col cols="12">
            <v-card elevation="0" class="pa-3 rounded-lg" outlined>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                <div class="title font-weight-medium">Hızlı İşlemler</div>
              </div>

              <v-container class="mt-4">
                <v-row dense>
                  <v-col v-for="(m, i) in modules" :key="'mod-'+i" cols="12" sm="6" md="4">
                    <v-card class="h-100 d-flex flex-column" elevation="1" :to="m.to">
                      <v-img height="180" :src="m.img" :alt="m.title"/>
                      <v-card-title class="text-h6">{{ m.title }}</v-card-title>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>


      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'JewelryDashboard',
  data: () => ({
    drawer: false,
    group: 0,

    gold: [
      {name: 'Gram Altın', buy: '2.585', change: 0.8},
      {name: 'Çeyrek', buy: '4.250', change: -0.4},
      {name: 'Yarım', buy: '8.450', change: 0.2},
      {name: 'Cumhuriyet', buy: '16.900', change: -0.1},
    ],
    silver: [
      {name: 'Gram Gümüş', buy: '585', change: 0.8},
      {name: 'Çeyrek', buy: '1.250', change: -0.4},
      {name: 'Yarım', buy: '2.450', change: 0.2},
      {name: 'Kilo', buy: '5.023', change: -0.1},
    ],
    trusd: [
      {name: 'Alış', buy: '42', change: 0.8},
      {name: 'Satış', buy: '43', change: -0.49},
    ],
    treuro: [
      {name: 'Alış', buy: '46', change: 0.12},
      {name: 'Satış', buy: '47', change: -0.21},
    ],

    modules: [
      {
        title: '📦 Envanter Yönetimi ',
        img: 'https://kuyumcum.net/Uploads/Sayfalar/kuyumcum-envanter-modulu_1762020_205638_2.PNG',
        to: { name: 'envantory' }
      },
      {
        title: '💰 Satış & Müşteri Modülü',
        img: 'https://kuyumcum.net/Uploads/Sayfalar/kuyumcum-perakande-modulu_1762020_210214_2.PNG',
        to: { name: 'customers' }

      },
      {
        title: '🔄 Alış & Toptancı Modülü',
        img: 'https://kuyumcum.net/Uploads/Sayfalar/kuyumcum-toptan-modulu_1762020_210614_2.PNG',
        link: '#'
      },
      {
        title: '📈 Finans & Kasa Modülü',
        img: 'https://kuyumcum.net/Uploads/Sayfalar/kuyumcum-cari-modulu_1762020_211321_2.PNG',
        link: '#'
      },
      {
        title: '📊 Raporlama & Analiz Modülü',
        img: 'https://kuyumcum.net/Uploads/Sayfalar/kuyumcum-rapor-modulu_1762020_212543_2.PNG',
        link: '#'
      },
      {
        title: '🔒 Kullanıcı & Yetki Yönetimi',
        img: 'https://kuyumcum.net/Uploads/Sayfalar/kuyumcum-personel-modulu_1762020_212121_2.PNG',
        link: '#'
      },
    ],
  }),
}
</script>

<style scoped>
.price-tile {
  transition: transform .15s ease;
}

.price-tile:hover {
  transform: translateY(-2px);
}
</style>
