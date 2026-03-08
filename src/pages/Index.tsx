import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Wheat, BarChart3, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
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

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <img src={logo} alt="KoobNaaba" className="h-8 w-auto" />
          <p className="text-sm text-muted-foreground">© 2026 KoobNaaba. Pour l'agriculture burkinabè.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
