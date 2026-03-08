import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapPin, Wheat, BarChart3, ArrowRight, Mail, Phone, MapPinned, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import galleryFarmField from "@/assets/gallery/farm-field.jpg";
import galleryLivestock from "@/assets/gallery/livestock.jpg";
import galleryCooperative from "@/assets/gallery/cooperative.jpg";
import galleryHarvest from "@/assets/gallery/harvest.jpg";
import galleryDigital from "@/assets/gallery/digital-farming.jpg";
import galleryIrrigation from "@/assets/gallery/irrigation.jpg";

// ── Partner data ──
const partners = [
  { name: "Ministère de l'Agriculture", category: "Institution" },
  { name: "Banque Agricole du Faso", category: "Finance" },
  { name: "SOFITEX", category: "Filière coton" },
  { name: "INERA", category: "Recherche" },
  { name: "FAO Burkina", category: "Organisation" },
  { name: "Coris Bank", category: "Finance" },
  { name: "AGRODIA", category: "Distribution" },
  { name: "SN-SOSUCO", category: "Agro-industrie" },
];

// ── Gallery data ──
const galleryItems = [
  { src: galleryFarmField, title: "Champs de mil au coucher du soleil", desc: "Récolte traditionnelle dans la savane" },
  { src: galleryLivestock, title: "Élevage bovin au Sahel", desc: "Troupeau en pâturage naturel" },
  { src: galleryCooperative, title: "Réunion de coopérative", desc: "Producteurs échangeant sur la récolte" },
  { src: galleryHarvest, title: "Marché de produits frais", desc: "Diversité des cultures locales" },
  { src: galleryDigital, title: "Agriculture numérique", desc: "La technologie au service du terrain" },
  { src: galleryIrrigation, title: "Systèmes d'irrigation", desc: "Modernisation des pratiques agricoles" },
];

// ── Auto-scroll carousel hook ──
function useCarousel(length: number, interval = 4000) {
  const [index, setIndex] = useState(0);
  const prev = useCallback(() => setIndex(i => (i - 1 + length) % length), [length]);
  const next = useCallback(() => setIndex(i => (i + 1) % length), [length]);
  useEffect(() => {
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [next, interval]);
  return { index, setIndex, prev, next };
}

const Index = () => {
  const navigate = useNavigate();
  const partnerCarousel = useCarousel(partners.length, 3000);
  const galleryCarousel = useCarousel(galleryItems.length, 5000);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <section className="gradient-hero min-h-[80vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="container max-w-5xl mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
            <img src={logo} alt="KoobNaaba" className="h-20 w-auto" />
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary-foreground leading-tight">
              La gestion agricole,{" "}
              <span className="text-gradient-warm">enfin facile.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              La plateforme de gestion agricole intelligente conçue pour les agriculteurs africains. 
              Gérez vos exploitations, suivez vos cultures et optimisez vos rendements.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="gradient-warm text-accent-foreground font-semibold px-8 shadow-warm hover:opacity-90 transition-opacity">
                Commencer <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Se connecter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Banner Carousel */}
      <section className="py-10 bg-muted/30 border-y border-border overflow-hidden">
        <div className="container max-w-5xl mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Nos partenaires de confiance
          </h3>
          <div className="relative">
            <button
              onClick={partnerCarousel.prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 border border-border shadow-sm hover:bg-accent transition-colors"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={partnerCarousel.next}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 border border-border shadow-sm hover:bg-accent transition-colors"
              aria-label="Suivant"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>

            <div className="overflow-hidden mx-10">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${partnerCarousel.index * (100 / 4)}%)` }}
              >
                {[...partners, ...partners].map((p, i) => (
                  <div
                    key={`${p.name}-${i}`}
                    className="flex-shrink-0 w-1/2 md:w-1/4 px-3"
                  >
                    <div
                      className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-warm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center gap-2"
                      onClick={() => {}}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-foreground leading-tight">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-5">
              {partners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => partnerCarousel.setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === partnerCarousel.index ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"
                  }`}
                  aria-label={`Partenaire ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Tout pour gérer votre <span className="text-gradient-warm">exploitation</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: MapPin, title: "Exploitations & Parcelles", desc: "Enregistrez vos fermes, délimitez vos parcelles et suivez chaque mètre carré de votre exploitation." },
              { icon: Wheat, title: "Cycles culturaux", desc: "Planifiez vos saisons, estimez vos rendements et suivez vos cultures du semis à la récolte." },
              { icon: BarChart3, title: "Suivi financier", desc: "Contrôlez vos coûts, estimez vos revenus et calculez votre ROI par cycle cultural." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-warm transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Carousel */}
      <section className="py-20 bg-muted/50">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-4">
            Découvrez le <span className="text-gradient-warm">terrain</span>
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
            Des champs de mil aux marchés locaux, notre plateforme accompagne chaque étape.
          </p>

          <div className="relative">
            <button
              onClick={galleryCarousel.prev}
              className="absolute left-2 md:-left-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background/90 border border-border shadow-lg hover:bg-accent transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={galleryCarousel.next}
              className="absolute right-2 md:-right-5 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-background/90 border border-border shadow-lg hover:bg-accent transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>

            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${galleryCarousel.index * 100}%)` }}
              >
                {galleryItems.map((item, i) => (
                  <div key={i} className="flex-shrink-0 w-full relative">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm md:text-base text-white/80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {galleryItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => galleryCarousel.setIndex(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === galleryCarousel.index ? "w-8 bg-primary" : "w-2.5 bg-border hover:bg-muted-foreground/40"
                  }`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="py-20 bg-background">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            À propos de <span className="text-gradient-warm">KoobNaaba</span>
          </h2>
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">KoobNaaba</strong> est une startup agritech basée à <strong className="text-foreground">Ouagadougou, Burkina Faso</strong>, dédiée à la modernisation de l'agriculture en Afrique de l'Ouest.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Notre mission : fournir aux agriculteurs, éleveurs et coopératives des outils numériques simples et accessibles pour gérer leurs exploitations, optimiser leurs rendements et améliorer leurs revenus.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Fondée par des passionnés du monde rural, notre équipe combine expertise agricole locale et innovation technologique pour répondre aux défis concrets du terrain.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "🌍", label: "Conçu en Afrique, pour l'Afrique" },
                { value: "📱", label: "Accessible hors connexion" },
                { value: "🤝", label: "Support coopératives & éleveurs" },
                { value: "🔒", label: "Données sécurisées" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                  <div className="text-3xl mb-2">{value}</div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted">
        <div className="container max-w-5xl mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1 space-y-3">
              <img src={logo} alt="KoobNaaba" className="h-10 w-auto" />
              <p className="text-sm text-muted-foreground">
                La plateforme de gestion agricole intelligente pour l'Afrique.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Ressources légales</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/mentions-legales" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mentions légales</Link>
                <Link to="/conditions-utilisation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Conditions d'utilisation</Link>
                <Link to="/politique-confidentialite" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Politique de confidentialité</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Contact</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 shrink-0" />
                  Quartier Cissin, Ouagadougou, Burkina Faso
                </span>
                <a href="mailto:contact@koobnaaba.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4 shrink-0" />
                  contact@koobnaaba.com
                </a>
                <a href="tel:+22600000000" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone className="h-4 w-4 shrink-0" />
                  +226 XX XX XX XX
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Suivez-nous</h4>
              <div className="flex gap-3">
                <a href="https://facebook.com/koobnaaba" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" aria-label="Facebook">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://twitter.com/koobnaaba" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" aria-label="X (Twitter)">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com/company/koobnaaba" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" aria-label="LinkedIn">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://wa.me/22600000000" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" aria-label="WhatsApp">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 KoobNaaba SARL. Tous droits réservés.</p>
            <p className="text-xs text-muted-foreground">Siège social : Ouagadougou, Burkina Faso</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
