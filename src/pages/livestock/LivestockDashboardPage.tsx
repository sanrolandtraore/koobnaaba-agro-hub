import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOfflineData } from "@/hooks/useOfflineData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart, Baby, Wallet, AlertTriangle, WifiOff, ArrowUpRight,
  Stethoscope, Wheat, Sprout, ShoppingCart, TrendingUp, TrendingDown, Bird, Fish,
} from "lucide-react";
import { LivestockZootechnicCard } from "@/components/livestock/LivestockZootechnicCard";
import ProductServiceCatalog from "@/components/marketplace/ProductServiceCatalog";

const speciesLabels: Record<string, string> = {
  bovin: "Bovins",
  ovin: "Ovins",
  caprin: "Caprins",
  porcin: "Porcins",
  volaille: "Volaille",
  pisciculture: "Pisciculture",
};

const speciesEmoji: Record<string, string> = {
  bovin: "🐄", ovin: "🐑", caprin: "🐐", porcin: "🐷", volaille: "🐔", pisciculture: "🐟",
};

const LivestockDashboardPage = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"cheptel" | "catalogue">("cheptel");

  const monthStart = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    []
  );

  const { data: animals, loading: loadingAnimals, isOffline } = useOfflineData<any>({
    table: "animals",
    select: "species, status, is_group, group_size",
    queryKey: "dashboard-animals-actif",
    filter: [{ column: "status", value: "actif" }],
  });

  const { data: healthAll, loading: loadingHealth } = useOfflineData<any>({
    table: "animal_health_events",
    select: "id, event_type, event_date, description, animal_id, animals(name, species)",
    orderBy: "event_date",
    queryKey: "dashboard-health-all",
  });

  const { data: reproAll, loading: loadingRepro } = useOfflineData<any>({
    table: "animal_reproductions",
    select: "id, expected_birth_date, actual_birth_date",
    queryKey: "dashboard-repro-all",
  });

  const { data: expenses, loading: loadingExp } = useOfflineData<any>({
    table: "livestock_expenses",
    select: "amount",
    queryKey: "dashboard-expenses",
  });

  const { data: sales, loading: loadingSales } = useOfflineData<any>({
    table: "livestock_sales",
    select: "total_amount",
    queryKey: "dashboard-sales",
  });

  const loading = loadingAnimals || loadingHealth || loadingRepro || loadingExp || loadingSales;

  const stats = useMemo(() => {
    const bySpecies: Record<string, number> = {};
    let totalHeads = 0;
    animals.forEach((a: any) => {
      const heads = a.is_group ? Number(a.group_size || 0) : 1;
      bySpecies[a.species] = (bySpecies[a.species] || 0) + heads;
      totalHeads += heads;
    });

    const healthThisMonth = healthAll.filter((h: any) => h.event_date && h.event_date >= monthStart).length;
    const upcomingBirths = reproAll.filter((r: any) => r.expected_birth_date && !r.actual_birth_date).length;
    const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
    const totalSales = sales.reduce((s: number, e: any) => s + Number(e.total_amount || 0), 0);

    return {
      totalAnimals: totalHeads,
      lots: animals.length,
      bySpecies,
      healthEventsThisMonth: healthThisMonth,
      upcomingBirths,
      totalExpenses,
      totalSales,
      balance: totalSales - totalExpenses,
    };
  }, [animals, healthAll, reproAll, expenses, sales, monthStart]);

  const recentHealth = useMemo(
    () => [...healthAll].sort((a: any, b: any) => (b.event_date || "").localeCompare(a.event_date || "")).slice(0, 4),
    [healthAll]
  );

  if (!user) return null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  const quickActions = [
    { to: "/dashboard/animals", label: "Animaux", icon: Bird, tone: "bg-secondary/40" },
    { to: "/dashboard/animal-health", label: "Santé", icon: Stethoscope, tone: "bg-rose-100 dark:bg-rose-950/40" },
    { to: "/dashboard/animal-reproduction", label: "Reproduction", icon: Baby, tone: "bg-sky-100 dark:bg-sky-950/40" },
    { to: "/dashboard/animal-feeding", label: "Alimentation", icon: Wheat, tone: "bg-amber-100 dark:bg-amber-950/40" },
    { to: "/dashboard/livestock-finance", label: "Finances", icon: Wallet, tone: "bg-primary/15" },
    { to: "/dashboard/livestock-services", label: "Services", icon: ShoppingCart, tone: "bg-muted" },
  ];

  const speciesEntries = Object.entries(stats.bySpecies);
  const topSpecies = speciesEntries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Sélecteur direct de vue sans nav secondaire */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="grid grid-cols-2 sm:inline-flex p-1.5 rounded-2xl bg-muted/80 border border-border shadow-xs">
          <button
            type="button"
            onClick={() => setActiveView("cheptel")}
            className={`px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-base font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeView === "cheptel"
                ? "bg-primary text-primary-foreground shadow-premium"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Bird className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span>Mon Cheptel</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("catalogue")}
            className={`px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-base font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeView === "catalogue"
                ? "bg-primary text-primary-foreground shadow-premium"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span>Boutique & Intrants</span>
          </button>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-11 px-4 text-sm font-bold rounded-xl border-border hover:border-primary/50 shrink-0"
        >
          <Link to="/dashboard/livestock-services">
            <Stethoscope className="h-4 w-4 mr-2 text-primary" />
            Demandes Vétérinaires
          </Link>
        </Button>
      </div>

      {activeView === "catalogue" ? (
        <div className="animate-fade-in">
          <ProductServiceCatalog
            initialCategory="aliments_elevage"
            title="Catalogue Produits & Services Pastoraux"
            description="Commandez vos provendes, tourteaux de coton, kits prophylactiques, inséminations artificielles et équipements d'élevage directement."
            defaultRole="eleveur"
          />
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Hero header */}
          <section className="livestock-hero rounded-[2rem] p-6 md:p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-[10rem] opacity-10 select-none">
              {topSpecies ? speciesEmoji[topSpecies[0]] : "🐄"}
            </div>
            <div className="relative">
              <p className="text-sm opacity-80">{greeting} 👋</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">Votre élevage en un coup d'œil</h1>
          <div className="mt-5 flex flex-wrap gap-3 items-end">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70">Cheptel total</p>
              <p className="text-4xl md:text-5xl font-bold leading-none mt-1">{stats.totalAnimals}</p>
              <p className="text-xs opacity-70 mt-1">{stats.lots} lot{stats.lots > 1 ? "s" : ""} actifs</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isOffline && (
                <Badge variant="outline" className="bg-background/20 border-white/30 text-primary-foreground text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />Hors-ligne
                </Badge>
              )}
              <Badge className="bg-background text-foreground hover:bg-background/90">
                {stats.balance >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {stats.balance.toLocaleString()} FCFA
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions strip */}
      <section className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {quickActions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className={`${a.tone} rounded-2xl p-3 flex flex-col items-center justify-center gap-2 aspect-square text-center transition-all hover:scale-[1.03] hover:shadow-md`}
          >
            <a.icon className="h-6 w-6 text-foreground" />
            <span className="text-[11px] md:text-xs font-medium leading-tight">{a.label}</span>
          </Link>
        ))}
      </section>

      {/* Bento grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]">
        {/* Soins ce mois */}
        <Link to="/dashboard/animal-health" className="livestock-bento-tile md:col-span-2 group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Soins ce mois</p>
              <p className="text-3xl font-bold mt-1">{stats.healthEventsThisMonth}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
              <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-3 group-hover:text-primary transition-colors">
            Voir l'historique <ArrowUpRight className="h-3 w-3" />
          </div>
        </Link>

        {/* Naissances */}
        <Link to="/dashboard/animal-reproduction" className="livestock-bento-tile group">
          <div className="h-10 w-10 rounded-2xl bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center">
            <Baby className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-3xl font-bold mt-3">{stats.upcomingBirths}</p>
          <p className="text-xs text-muted-foreground mt-1">Naissances à venir</p>
        </Link>

        {/* Ventes */}
        <Link to="/dashboard/livestock-finance" className="livestock-bento-tile group bg-primary text-primary-foreground border-primary">
          <div className="h-10 w-10 rounded-2xl bg-background/20 flex items-center justify-center">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-3">{stats.totalSales.toLocaleString()}</p>
          <p className="text-[11px] opacity-80 mt-1">FCFA de ventes</p>
        </Link>

        {/* Cheptel par espèce — large tile */}
        <div className="livestock-bento-tile md:col-span-2 md:row-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Cheptel par espèce</p>
              <h3 className="text-lg font-bold">Répartition</h3>
            </div>
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          {speciesEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Fish className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucun animal enregistré</p>
              <Link to="/dashboard/animals" className="text-xs text-primary mt-2 underline">Ajouter un animal</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {speciesEntries.map(([sp, count]) => {
                const pct = stats.totalAnimals ? (Number(count) / stats.totalAnimals) * 100 : 0;
                return (
                  <div key={sp}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span className="text-base">{speciesEmoji[sp] || "🐾"}</span>
                        {speciesLabels[sp] || sp}
                      </span>
                      <span className="text-sm font-bold tabular-nums">{Number(count)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dépenses */}
        <div className="livestock-bento-tile">
          <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-foreground" />
          </div>
          <p className="text-xl font-bold mt-3 tabular-nums">{stats.totalExpenses.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-1">FCFA dépenses</p>
        </div>

        {/* Balance */}
        <div className={`livestock-bento-tile ${stats.balance >= 0 ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-rose-50 dark:bg-rose-950/30"}`}>
          <div className="h-10 w-10 rounded-2xl bg-background flex items-center justify-center">
            {stats.balance >= 0
              ? <TrendingUp className="h-5 w-5 text-emerald-600" />
              : <TrendingDown className="h-5 w-5 text-rose-600" />}
          </div>
          <p className="text-xl font-bold mt-3 tabular-nums">{stats.balance.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-1">FCFA balance</p>
        </div>
      </section>
      
      {/* Simulateur zootechnique d'élevage */}
      <LivestockZootechnicCard />

      {/* Activité récente */}
      <section className="livestock-bento-tile">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Activité récente</p>
            <h3 className="text-lg font-bold">Derniers événements santé</h3>
          </div>
          <Link to="/dashboard/animal-health" className="text-xs text-primary hover:underline flex items-center gap-1">
            Tout voir <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {recentHealth.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">Aucun événement récent</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentHealth.map((h: any) => (
              <li key={h.id} className="py-3 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {h.event_type} — {h.animals?.name || speciesLabels[h.animals?.species] || "Animal"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {h.description || "Pas de détails"}
                    {h.event_date && ` • ${new Date(h.event_date).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Section directe Produits & Services Partenaires sur le Dashboard */}
      <section className="pt-8 border-t border-border/80">
        <ProductServiceCatalog
          initialCategory="aliments_elevage"
          title="Boutique & Services pour votre Élevage"
          description="Aliments bétail, tourteaux de coton SN-CITEC, provendes, vaccins et prestations vétérinaires disponibles en commande directe."
          defaultRole="eleveur"
        />
      </section>
      </div>
      )}
    </div>
  );
};

export default LivestockDashboardPage;
