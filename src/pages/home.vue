<template>
  <v-container fluid class="px-0 py-0">

    <!-- SOL MENÜ: FONKSİYONLAR AYNI -->
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
            link exact
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
              icon small :style="{ color: c }"
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

        <v-list-item :to="{ name:'urunler' }" class="rounded-lg" link>
          <v-list-item-icon><v-icon>mdi-plus</v-icon></v-list-item-icon>
          <v-list-item-title>Yeni Sipariş Ekle</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- HERO -->
<v-row>
  <v-col cols="1"><a href="https://www.shopier.com/ShulesFines"><img style="height: 127px; width:135px" src="https://i.etsystatic.com/41872415/r/isla/718c5b/61411742/isla_180x180.61411742_m1dinmtg.jpg"><img></a></v-col>

  <v-col cols="11">           <div class="hero">
    <div class="hero-glow" :style="{ '--accent': accent }"></div>
    <div class="hero-content"> <div class="overline mb-1">JEWELERS PRO</div>
      <h2 class="hero-title"> Shulesfines</h2>
    </div>
  </div></v-col>
</v-row>



    <!-- HIZLI AKSİYONLAR -->
    <v-container class="pt-4 pb-0">
      <v-slide-group show-arrows>
        <v-slide-item v-for="qa in quickActions" :key="qa.to">
          <v-card class="qa" :to="{ name: qa.to }" link :style="{ borderColor: accent }">
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

    <!-- ANA KARTLAR -->
    <v-container class="py-6">
      <v-row dense>
        <v-col
            v-for="(card,i) in filtered"
            :key="card.to"
            cols="12" sm="6" md="4" lg="3"
        >
          <v-card
              :to="{ name: card.to }"
              link
              class="menu-card"
              :elevation="0"
              :style="cardStyle(i)"
          >
            <!-- üst cam/ışık -->
            <div class="card-sheen"></div>

            <!-- Fav -->
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                    absolute top right small icon class="fav-btn"
                    v-bind="attrs" v-on="on"
                    :color="isFav(card) ? accent : ''"
                    @click.stop="toggleFav(card)"
                >
                  <v-icon>{{ isFav(card) ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
                </v-btn>
              </template>
              <span>Favorilere {{ isFav(card) ? 'çıkar' : 'ekle' }}</span>
            </v-tooltip>

            <div class="mc-hero">
              <v-icon class="mc-icon">{{ card.icon }}</v-icon>
            </div>

            <div class="px-4 pb-4">
              <div class="subtitle-1 font-weight-bold">{{ card.title }}</div>
              <div class="caption grey--text text--lighten-1">{{ card.subtitle }}</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

  </v-container>
</template>

<script>
export default {
  name: "Menu",
  data() {
    return {
      drawer: this.$vuetify?.breakpoint?.lgAndUp || false,
      mini: this.$vuetify?.breakpoint?.lgAndUp || false,
      query: "",
      theme: localStorage.getItem("jp_theme_mode") || "auto", // auto | light | dark
      // seçtiğin lacivert/indigo
      accent: localStorage.getItem("jp_accent") || "#5B6EF7",

      favorites: new Set(JSON.parse(localStorage.getItem("jp_favs") || "[]")),
      drawerItems: [
        { title:'Ana Sayfa',    icon:'mdi-view-dashboard-outline', to:'home' },
        { title:'Satış',        icon:'mdi-cash-register',          to:'satis' },
        { title:'Raporlar',     icon:'mdi-file-chart',             to:'raporlar' },
        { title:'Toptancı',     icon:'mdi-storefront-outline',     to:'toptanci' },
        { title:'Kategoriler',  icon:'mdi-shape-outline',          to:'kategoriler' },
        { title:'Ürünler',      icon:'mdi-package-variant-closed', to:'urunler' },
        { title:'Müşteri Bilgi',icon:'mdi-account-group-outline',  to:'musteriBilgi' },
        { title:'Stok',         icon:'mdi-archive-outline',        to:'stok' },
        { title:'Kargo',        icon:'mdi-truck-outline',          to:'kargo' },
      ],
      // (kart renkleri tek tip koyu yüzey; başlıktaki iconu beyaz tutuyoruz)
      cards: [
        { title:"SATIŞ EKRANI",     subtitle:"Hızlı satış işlemleri",   icon:"mdi-cash-register",           to:"satis" },
        { title:"RAPORLAR",         subtitle:"Grafikler ve özetler",    icon:"mdi-file-chart",              to:"raporlar" },
        { title:"TOPTANCI",         subtitle:"Toptan alım/satım",       icon:"mdi-storefront-outline",      to:"toptanci" },
        { title:"KATEGORİLER",      subtitle:"Ürün grupları",           icon:"mdi-shape-outline",           to:"kategoriler" },
        { title:"ÜRÜNLER",          subtitle:"Liste & yönetim",         icon:"mdi-package-variant-closed",  to:"urunler" },
        { title:"MÜŞTERİ BİLGİLERİ",subtitle:"Kayıt ve hareketler",     icon:"mdi-account-group-outline",   to:"musteriBilgi" },
        { title:"STOK",             subtitle:"Giriş/çıkış & sayım",     icon:"mdi-archive-outline",         to:"stok" },
        { title:"KARGO",            subtitle:"Gönderi ve takip",        icon:"mdi-truck-outline",           to:"kargo" }
      ],
      accents: ["#5B6EF7","#6E7CFF","#7C8AFF","#4FA5FF","#36C2C2","#E5B25E","#8BA0B8"],
      quickActions: [
        { title:"Yeni Satış",    subtitle:"Fiş oluştur",      icon:"mdi-flash",         to:"satis",   key:"S" },
        { title:"Ürün Ekle",     subtitle:"Stoka ekle",       icon:"mdi-plus-box",      to:"urunler", key:"U" },
        { title:"Hareket Ekle",  subtitle:"Stok giriş/çıkış", icon:"mdi-swap-vertical", to:"stok",    key:"H" },
        { title:"Kargo Oluştur", subtitle:"Gönderi & takip",  icon:"mdi-truck-fast",    to:"kargo",   key:"K" },
      ],
    };
  },
  computed: {
    themeLabel(){
      return this.theme === 'auto' ? 'Oto' : (this.theme === 'dark' ? 'Koyu' : 'Açık');
    },
    filtered() {
      const q = this.query.trim().toLowerCase();
      let list = [...this.cards];
      if (q) list = list.filter(c => (c.title + " " + c.subtitle).toLowerCase().includes(q));
      list.sort((a,b) => Number(this.isFav(b)) - Number(this.isFav(a)));
      return list;
    }
  },
  methods: {
    // kart görünümü (gölge yok; koyu yüzey + ince kenar + cam parıltı üstte)
    cardStyle(){
      return {
        '--accent': this.accent,
        border: this.$vuetify?.theme?.dark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(10,14,20,.08)',
        background: this.$vuetify?.theme?.dark
            ? 'linear-gradient(180deg, #1B1F2A 0%, #141821 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F7F8FC 100%)',
      };
    },

    // tema & accent
    applyTheme(){
      if (!this.$vuetify?.theme) return;
      if (this.theme === 'auto'){
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.$vuetify.theme.dark = dark;
      } else {
        this.$vuetify.theme.dark = this.theme === 'dark';
      }
      document.documentElement.style.setProperty('--accent', this.accent);
    },
    cycleTheme(){
      this.theme = this.theme === 'auto' ? 'light' : this.theme === 'light' ? 'dark' : 'auto';
      localStorage.setItem('jp_theme_mode', this.theme);
      this.applyTheme();
    },
    setAccent(c){
      this.accent = c;
      localStorage.setItem('jp_accent', c);
      this.applyTheme();
    },

    // favoriler
    isFav(card){ return this.favorites.has(card.to); },
    toggleFav(card){
      if (this.isFav(card)) this.favorites.delete(card.to);
      else this.favorites.add(card.to);
      localStorage.setItem('jp_favs', JSON.stringify(Array.from(this.favorites)));
    },

    // kısayollar
    focusSearch() {
      const el = this.$el.querySelector('.menu-search input');
      el && el.focus();
    },
    handleKey(e) {
      const key = e.key.toLowerCase();
      if (key === '/') { e.preventDefault(); this.focusSearch(); return; }
      if (key === 's') { this.$router.push({ name:'satis' }); return; }
      if (key === 'u') { this.$router.push({ name:'urunler' }); return; }
      if (key === 'h') { this.$router.push({ name:'stok' }); return; }
      if (key === 'k') { this.$router.push({ name:'kargo' }); return; }
      const n = parseInt(e.key, 10);
      if (!isNaN(n) && n >= 1 && n <= Math.min(9, this.filtered.length)) {
        this.$router.push({ name: this.filtered[n - 1].to });
      }
    }
  },
  mounted() {
    this.applyTheme();
    window.addEventListener('keydown', this.handleKey);
    this._mq = window.matchMedia('(prefers-color-scheme: dark)');
    this._mqListener = () => this.applyTheme();
    this._mq.addEventListener?.('change', this._mqListener);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKey);
    this._mq?.removeEventListener?.('change', this._mqListener);
  }
};
</script>

<style scoped>
/* === DRAWER: lacivert/sSlate, gölge yok === */
.elevated-drawer{
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  box-shadow: none;
  background: var(--drawer-bg);
  border-right: 1px solid var(--drawer-border);
}

/* === HERO: lacivert gradient bar === */
.hero{
  position: relative;
  height: 128px;
  overflow: hidden;
  border-bottom: 1px solid var(--hairline);
  background:
      radial-gradient(100% 60% at 10% 0%, rgba(91,110,247,.18), transparent 50%),
      linear-gradient(180deg, var(--hero-top) 0%, var(--hero-bottom) 100%);
}
.hero-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(80% 60% at 25% 15%, var(--accent, #5B6EF7) 0%, transparent 60%),
      radial-gradient(70% 50% at 80% 20%, rgba(91,110,247,.35) 0%, transparent 60%);
  filter: blur(42px);
  opacity:.45;
}
.hero-content{
  position: relative;
  height:100%;
  display:flex; flex-direction:column; justify-content:center;
  padding: 16px 24px;
}
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px; }
.hero-sub{ opacity:.8 }

/* === QUICK ACTIONS: accent kenarlı, cam efekti === */
.qa{
  display:flex; align-items:center;
  padding: 10px 14px; margin-right:12px;
  border-radius: 14px;
  border: 1px solid var(--hairline-strong);
  background: var(--qa-bg);
  backdrop-filter: blur(6px);
  transition: transform .18s ease, border-color .18s ease;
  box-shadow: none;
}
.qa:hover{ transform: translateY(-2px); }

/* === ANA KARTLAR: koyu yüzey + üst sheen (gölge yok) === */
.menu-card{
  position: relative;
  min-height: 190px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: none;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  transition: transform .14s ease, border-color .14s ease;
}
.menu-card:hover{ transform: translateY(-3px); border-color: var(--accent); }

/* üst cam parıltısı */
.card-sheen{
  content:""; position:absolute; inset:0; pointer-events:none;
  background:
      radial-gradient(120% 100% at 50% -10%, rgba(255,255,255,.06), transparent 45%),
      radial-gradient(80% 60% at 80% 10%, rgba(255,255,255,.03), transparent 55%);
  mix-blend-mode: screen;
}

@media (max-width:960px){ .mc-hero{ height:110px } }
@media (max-width:600px){ .mc-hero{ height:96px } }
.mc-hero{
  height:130px; display:flex; align-items:center; justify-content:center;
}
.mc-icon{ font-size:56px; color:#fff; }

/* Fav btn öncelik */
.fav-btn{ z-index:2; }
</style>

<!-- GLOBAL TOKENS + FONT -->
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root{
  /* LIGHT */
  --bg: #F6F8FB;
  --hero-top: #EEF2FF;
  --hero-bottom: #E6EBFF;
  --drawer-bg: linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.5));
  --drawer-border: rgba(91,110,247,.25);
  --hairline: rgba(10,14,20,.08);
  --hairline-strong: rgba(10,14,20,.12);
  --qa-bg: rgba(255,255,255,.85);
  --card-bg: linear-gradient(180deg,#FFFFFF 0%, #F7F8FC 100%);
  --card-border: rgba(10,14,20,.08);
}
.theme--dark{
  /* DARK — aynı tonların 2-3 tık koyusu */
  --bg: #0C0F14;
  --hero-top: #0E1320;
  --hero-bottom: #0A0E14;
  --drawer-bg: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0));
  --drawer-border: rgba(255,255,255,.08);
  --hairline: rgba(255,255,255,.06);
  --hairline-strong: rgba(255,255,255,.10);
  --qa-bg: rgba(28,28,36,.65);
  --card-bg: linear-gradient(180deg,#1B1F2A 0%, #141821 100%);
  --card-border: rgba(255,255,255,.06);
}

/* global */
html, body, .v-application {
  font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Apple Color Emoji","Segoe UI Emoji", "Segoe UI Symbol", sans-serif !important;
  background: var(--bg) !important;
}

/* v-main default top padding'i iptal et */
.v-main__wrap { padding-top: 0 !important; }
</style>
