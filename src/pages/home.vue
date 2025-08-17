<template>
  <v-container fluid class="px-0 py-0">

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
      </v-list>
    </v-navigation-drawer>

    <!-- HEADER HERO (kompakt, üst boşluğu kapatır) -->
    <div class="hero">
      <div class="hero-glow" :style="{ '--accent': accent }"></div>
      <div class="hero-content">
        <div class="overline mb-1">JEWELERS PRO</div>
        <h2 class="hero-title">Tüm mağazan tek ekranda.</h2>
        <div class="hero-sub">Satış, stok, kargo ve raporlar — tek tıkla.</div>
      </div>
    </div>

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
          <v-hover v-slot="{ hover }">
            <v-card
                :to="{ name: card.to }"
                link
                class="menu-card"
                :elevation="hover ? 16 : 6"
                :style="cardStyle(i, hover)"
            >
              <!-- Accent'e bağlı üst glow -->
              <div class="card-top-glow"></div>

              <!-- Favori (sadece yıldız, sayı/badge yok) -->
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

              <div class="mc-hero" :style="heroStyle(card)">
                <v-icon class="mc-icon">{{ card.icon }}</v-icon>
                <!-- numara rozetleri tamamen kaldırıldı -->
                <div class="mc-shine" />
              </div>

              <div class="px-4 py-3">
                <div class="d-flex align-center">
                  <div>
                    <div class="subtitle-1 font-weight-bold">{{ card.title }}</div>
                    <div class="caption grey--text text--darken-1">{{ card.subtitle }}</div>
                  </div>
                  <v-spacer/>
                </div>
              </div>
            </v-card>
          </v-hover>
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
      theme: localStorage.getItem("jp_theme_mode") || "auto",     // auto | light | dark
      accent: localStorage.getItem("jp_accent") || "#5865F2",
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
      cards: [
        { title:"SATIŞ EKRANI",     subtitle:"Hızlı satış işlemleri",   icon:"mdi-cash-register",           to:"satis",       colors:["#6a11cb","#2575fc"] },
        { title:"RAPORLAR",         subtitle:"Grafikler ve özetler",    icon:"mdi-file-chart",              to:"raporlar",    colors:["#00c6ff","#0072ff"] },
        { title:"TOPTANCI",         subtitle:"Toptan alım/satım",       icon:"mdi-storefront-outline",      to:"toptanci",    colors:["#11998e","#38ef7d"] },
        { title:"KATEGORİLER",      subtitle:"Ürün grupları",           icon:"mdi-shape-outline",           to:"kategoriler", colors:["#00b09b","#96c93d"] },
        { title:"ÜRÜNLER",          subtitle:"Liste & yönetim",         icon:"mdi-package-variant-closed",  to:"urunler",     colors:["#fc4a1a","#f7b733"] },
        { title:"MÜŞTERİ BİLGİLERİ",subtitle:"Kayıt ve hareketler",     icon:"mdi-account-group-outline",   to:"musteriBilgi",colors:["#8E2DE2","#4A00E0"] },
        { title:"STOK",             subtitle:"Giriş/çıkış & sayım",     icon:"mdi-archive-outline",         to:"stok",        colors:["#ee0979","#ff6a00"] },
        { title:"KARGO",            subtitle:"Gönderi ve takip",        icon:"mdi-truck-outline",           to:"kargo",       colors:["#36D1DC","#5B86E5"] }
      ],
      accents: ["#5865F2","#0EA5E9","#22C55E","#F59E0B","#EF4444","#8B5CF6"],
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
      // favoriler öne
      list.sort((a,b) => Number(this.isFav(b)) - Number(this.isFav(a)));
      return list;
    }
  },
  methods: {
    // hero arka plan
    heroStyle(c) {
      const [a,b] = c.colors || ["#6a11cb","#2575fc"];
      return `
        background:
          radial-gradient(80% 120% at 0% 0%, rgba(255,255,255,.20), transparent 60%),
          linear-gradient(135deg, ${a}, ${b});
      `;
    },
    // kart görsel değişkenleri
    cardStyle(i, hover){
      return {
        '--accent': this.accent,
        '--glow': this.glowColorByIndex(i),     // farklı kartlara hafifçe değişen ton
        transform: hover ? 'translateY(-6px) rotateX(0.8deg) rotateY(-0.8deg)' : 'translateY(0)',
      };
    },
    glowColorByIndex(i){
      // accent'ten 20° kaydırılmış HSL ton
      const {h,s,l} = this.hexToHsl(this.accent);
      const hue = (h + (i*20)) % 360;
      return `hsl(${hue} ${s}% ${Math.max(30,l-5)}%)`;
    },
    hexToHsl(hex){
      let c = hex.replace('#','');
      if(c.length===3) c = c.split('').map(x=>x+x).join('');
      const r = parseInt(c.substr(0,2),16)/255;
      const g = parseInt(c.substr(2,2),16)/255;
      const b = parseInt(c.substr(4,2),16)/255;
      const max=Math.max(r,g,b), min=Math.min(r,g,b);
      let h,s,l=(max+min)/2;
      if(max===min){ h=0; s=0; }
      else{
        const d = max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
          case r: h=(g-b)/d + (g<b?6:0); break;
          case g: h=(b-r)/d + 2; break;
          case b: h=(r-g)/d + 4; break;
        }
        h = Math.round(h*60);
      }
      return {h, s:Math.round(s*100), l:Math.round(l*100)};
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
    },
    cycleTheme(){
      this.theme = this.theme === 'auto' ? 'light' : this.theme === 'light' ? 'dark' : 'auto';
      localStorage.setItem('jp_theme_mode', this.theme);
      this.applyTheme();
    },
    setAccent(c){
      this.accent = c;
      localStorage.setItem('jp_accent', c);
    },

    // favoriler
    isFav(card){ return this.favorites.has(card.to); },
    toggleFav(card){
      if (this.isFav(card)) this.favorites.delete(card.to);
      else this.favorites.add(card.to);
      localStorage.setItem('jp_favs', JSON.stringify(Array.from(this.favorites)));
    },

    // klavye kısayolları
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
    // auto tema takibi
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
/* DRAWER */
.elevated-drawer{
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
}

/* HERO: kompakt */
.hero{
  position: relative;
  height: 120px;
  overflow: hidden;
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
  filter: blur(42px);
  opacity:.55;
}
.theme--dark .hero-glow{ opacity:.35; }

.hero-content{
  position: relative;
  height:100%;
  display:flex; flex-direction:column; justify-content:center;
  padding: 12px 24px;
}
.hero-title{ margin:0; font-weight:800; letter-spacing:.2px; }
.hero-sub{ opacity:.8 }

/* QUICK ACTIONS */
.qa{
  display:flex; align-items:center;
  padding: 10px 14px; margin-right:12px;
  border-radius: 14px;
  border: 1px solid transparent;
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(6px);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.theme--dark .qa{ background: rgba(30,30,30,.65); }
.qa:hover{
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,.08);
}

/* KARTLAR */
.menu-card{
  position: relative;
  min-height: 190px;
  border-radius: 18px;
  overflow: hidden;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  background: #fff;
  border: 1px solid #eef0f3;
}
.theme--light .menu-card{
  background: linear-gradient(180deg,#ffffff 0%, #fbfbfb 100%);
}
.theme--dark .menu-card{
  background: #171717;
  border-color: rgba(255,255,255,.06);
}

/* üst renkli glow — accent'e bağlı */
.card-top-glow{
  position:absolute; inset:-30%;
  background:
      radial-gradient(90% 60% at 30% 30%, var(--accent) 0%, transparent 60%),
      radial-gradient(90% 60% at 90% 20%, rgba(99,102,241,.55) 0%, transparent 60%),
      linear-gradient(180deg, rgba(255,255,255,.35), transparent 60%);
  animation: float 16s ease-in-out infinite;
  filter: blur(42px);
  opacity:.55;
}
.theme--dark .card-top-glow{ opacity:.32; }

.menu-card:hover{
  box-shadow: 0 10px 24px rgba(0,0,0,.12);
  border-color: var(--accent);
}

/* HERO BLOKU kart içi */
@media (max-width:960px){ .mc-hero{ height:110px } }
@media (max-width:600px){ .mc-hero{ height:95px } }
.mc-hero{
  height:130px; position: relative;
  display:flex; align-items:center; justify-content:center;
  z-index: 1; /* glow'un üstünde */
}
.mc-icon{
  font-size:56px; color:#fff;
  text-shadow:0 8px 24px rgba(0,0,0,.25);
}
.mc-shine{
  content:""; position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,.28), transparent 60%);
}

/* Fav button */
.fav-btn{ z-index:2; }

/* Animations */
@keyframes float{
  0%{ transform: translate3d(0,0,0) rotate(0deg); }
  50%{ transform: translate3d(2%, -2%, 0) rotate(1deg); }
  100%{ transform: translate3d(0,0,0) rotate(0deg); }
}
</style>

<!-- ÜST BOŞLUĞU TAMAMEN KAPATMAK İÇİN (scoped değil) -->
<style>
/* v-main default top padding'i iptal et */
.v-main__wrap { padding-top: 0 !important; }
</style>
