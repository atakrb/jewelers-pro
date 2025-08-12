<template>
  <v-container>


  <v-card flat class="pa-0">
    <v-card-title class="py-2 px-4 subtitle-1 font-weight-bold">
      ⚡ Hızlı İşlemler
    </v-card-title>
    <v-divider />

    <v-container fluid class="py-4">
      <v-row dense>
        <v-col
            v-for="(item, i) in items"
            :key="i"
            cols="12" sm="6" md="4" lg="3"
        >
          <v-hover v-slot="{ hover }">
            <v-card
                class="qa-card"
                :elevation="hover ? 10 : 2"
                :to="{ name: item.to }"
                link
            >
              <div class="qa-hero" :style="heroStyle(item)">
                <v-icon class="qa-hero-icon">{{ item.icon }}</v-icon>
              </div>

              <v-divider />

              <div class="qa-title px-4 py-3">
                <div class="subtitle-1 font-weight-bold">
                  {{ item.title }}
                </div>
                <div class="caption grey--text text--darken-1">
                  {{ item.subtitle }}
                </div>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
  </v-container>
</template>

<script>
export default {
  name: "menu",
  data() {
    return {
      items: [
        {
          title: "SATIŞ EKRANI",
          subtitle: "Hızlı satış işlemleri",
          icon: "mdi-cash-register",
          to: "satis",
          colors: ["#FCE8D6", "#FFF6EC"]
        },
        {
          title: "RAPORLAR",
          subtitle: "Grafikler ve özetler",
          icon: "mdi-file-chart",
          to: "raporlar",
          colors: ["#FADBD8", "#FFF0EE"]
        },
        {
          title: "TOPTANCI",
          subtitle: "Toptan alım/satım",
          icon: "mdi-storefront-outline",
          to: "toptanci",
          colors: ["#E6F6E8", "#F4FBF5"]
        },
        {
          title: "KATEGORİLER",
          subtitle: "Ürün grupları",
          icon: "mdi-shape-outline",
          to: "kategoriler",
          colors: ["#DFF2F2", "#ECF9FA"]
        },
        {
          title: "ÜRÜNLER",
          subtitle: "Liste & yönetim",
          icon: "mdi-package-variant-closed",
          to: "urunler",
          colors: ["#FCE8D6", "#FFF6EC"]
        },
        {
          title: "MÜŞTERİ BİLGİLERİ",
          subtitle: "Kayıt ve hareketler",
          icon: "mdi-account-group-outline",
          to: "musteriBilgi",
          colors: ["#FADBD8", "#FFF0EE"]
        },
        {
          title: "STOK",
          subtitle: "Giriş/çıkış & sayım",
          icon: "mdi-archive-outline",
          to: "stok",
          colors: ["#E6F6E8", "#F4FBF5"]
        },
        {
          title: "KARGO",
          subtitle: "Gönderi ve takip",
          icon: "mdi-truck-outline",
          to: "kargo",
          colors: ["#DFF2F2", "#ECF9FA"]
        }
      ]
    };
  },
  methods: {
    heroStyle(it) {
      return `
        background: linear-gradient(180deg, ${it.colors[0]}, ${it.colors[1]});
      `;
    }
  }
};
</script>

<style scoped>
.qa-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform .15s ease, box-shadow .15s ease;
}
.qa-card:hover { transform: translateY(-2px); }

.qa-hero {
  height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qa-hero-icon {
  font-size: 72px;
  opacity: .9;
}
.qa-title { min-height: 72px; }
.qa-card {
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background-color: white;
}

.qa-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.qa-hero {
  height: 200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.qa-hero::after {
  /* Soft parıltı efekti */
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%);
  transform: rotate(25deg);
}

.qa-hero-icon {
  font-size: 64px;
  opacity: 0.95;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(6px);
  border-radius: 50%;
  padding: 16px;
  transition: all 0.25s ease;
}

.qa-card:hover .qa-hero-icon {
  transform: scale(1.1);
  background: rgba(255,255,255,0.8);
}

.qa-title {
  min-height: 72px;
  padding-bottom: 12px;
}

.subtitle-1.font-weight-bold {
  color: #2c3e50;
}

.caption {
  font-size: 0.85rem;
}

</style>
