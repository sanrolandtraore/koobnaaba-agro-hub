import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOfflineData } from "@/hooks/useOfflineData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Wheat, Activity, DollarSign, WifiOff, ArrowUpRight,
  Sprout, CalendarDays, Package, TrendingUp, TrendingDown, Calculator, Microscope,
} from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();

  const monthStart = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    []
  );

  const { data: farms, loading: l1 } = useOfflineData<any>({
    table: "farms",
    select: "id",
    queryKey: "dashboard-farms",
  });

  const { data: parcels, loading: l2 } = useOfflineData<any>({
    table: "parcels",
    select: "id, name, area_ha",
    queryKey: "dashboard-parcels",
  });

  const { data: cycles, loading: l3 } = useOfflineData<any>({
    table: "crop_cycles",
    select: "id, status, season, crop_references(name)",
    queryKey: "dashboard-cycles",
  });

  const { data: costs, loading: l4 } = useOfflineData<any>({
    table: "cost_entries",
    select: "id, amount, date",
    queryKey: "dashboard-costs",
  });

  const { data: harvests, loading: l5 } = useOfflineData<any>({
    table: "harvests",
    select: "id, quantity_kg, date",
    queryKey: "dashboard-harvests",
  });

  const { data: activities, loading: l6 } = useOfflineData<any>({
    table: "activity_logs",
    select: "id, activity_type, description, date, created_at",
    orderBy: "created_at",
    queryKey: "dashboard-activities",
  });

  const loading = l1 || l2 || l3 || l4 || l5 || l6;
  const isOffline = !navigator.onLine;

  const stats = useMemo(() => {
    const activeCycles = cycles.filter((c: any) => c.status === "active");
    const totalArea = parcels.reduce((s: number, p: any) => s + Number(p.area_ha || 0), 0);
    const totalCosts = costs.reduce((s: number, c: any) => s + Number(c.amount || 0), 0);
    const costsThisMonth = costs.filter((c: any) => c.date && c.date >= monthStart)
      .reduce((s: number, c: any) => s + Number(c.amount || 0), 0);
    const totalHarvests = harvests.reduce((s: number, h: any) => s + Number(h.quantity_kg || 0), 0);
    const byCrop: Record<string, number> = {};
    activeCycles.forEach((c: any) => {
      const name = c.crop_references?.name || "Autre";
      byCrop[name] = (byCrop[name] || 0) + 1;
    });
    return {
      farms: farms.length,
      parcels: parcels.length,
      totalArea,
      activeCycles: activeCycles.length,
      totalCosts,
      costsThisMonth,
      totalHarvests,
      harvestCount: harvests.length,
      byCrop,
    };
  }, [farms, parcels, cycles, costs, harvests, monthStart]);

  const recentActivities = useMemo(
    () => [...activities]
      .sort((a: any, b: any) => (b.created_at || "").localeCompare(a.created_at || ""))
      .slice(0, 4),
    [activities]
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
    { to: "/dashboard/parcels", label: "Parcelles", icon: MapPin, tone: "bg-secondary/40" },
    { to: "/dashboard/crop-cycles", label: "Cultures", icon: Wheat, tone: "bg-amber-100 dark:bg-amber-950/40" },
    { to: "/dashboard/activities", label: "Activités", icon: Activity, tone: "bg-sky-100 dark:bg-sky-950/40" },
    { to: "/dashboard/calendar", label: "Calendrier", icon: CalendarDays, tone: "bg-rose-100 dark:bg-rose-950/40" },
    { to: "/dashboard/expert-diagnosis", label: "Diagnostic IA", icon: Microscope, tone: "bg-primary/15" },
    { to: "/dashboard/costs", label: "Coûts", icon: DollarSign, tone: "bg-muted" },
  ];

  const cropEntries = Object.entries(stats.byCrop).sort((a, b) => Number(b[1]) - Number(a[1]));
  const cropEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("maïs") || n.includes("mais")) return "🌽";
    if (n.includes("riz")) return "🌾";
    if (n.includes("tomate")) return "🍅";
    if (n.includes("oignon")) return "🧅";
    if (n.includes("arachide")) return "🥜";
    if (n.includes("coton")) return "☁️";
    if (n.includes("sorgho") || n.includes("mil")) return "🌾";
    if (n.includes("niébé") || n.includes("haricot")) return "🫘";
    return "🌱";
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Hero header */}
      <section className="livestock-hero rounded-[2rem] p-6 md:p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-[10rem] opacity-10 select-none">🌾</div>
        <div className="relative">
          <p className="text-sm opacity-80">{greeting} 👋</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">Votre exploitation en un coup d'œil</h1>
          <div className="mt-5 flex flex-wrap gap-3 items-end">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70">Surface cultivée</p>
              <p className="text-4xl md:text-5xl font-bold leading-none mt-1">
                {stats.totalArea.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs opacity-70 mt-1">
                hectare{stats.totalArea > 1 ? "s" : ""} • {stats.parcels} parcelle{stats.parcels > 1 ? "s" : ""}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isOffline && (
                <Badge variant="outline" className="bg-background/20 border-white/30 text-primary-foreground text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />Hors-ligne
                </Badge>
              )}
              <Badge className="bg-background text-foreground hover:bg-background/90">
                <Sprout className="h-3 w-3 mr-1" />
                {stats.activeCycles} cycle{stats.activeCycles > 1 ? "s" : ""} actif{stats.activeCycles > 1 ? "s" : ""}
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
        {/* Parcelles */}
        <Link to="/dashboard/parcels" className="livestock-bento-tile md:col-span-2 group flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Parcelles</p>
              <p className="text-3xl font-bold mt-1">{stats.parcels}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl bg-secondary/40 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-3 group-hover:text-primary transition-colors">
            Gérer mes parcelles <ArrowUpRight className="h-3 w-3" />
          </div>
        </Link>

        {/* Cycles actifs */}
        <Link to="/dashboard/crop-cycles" className="livestock-bento-tile group">
          <div className="h-10 w-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
            <Wheat className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-bold mt-3">{stats.activeCycles}</p>
          <p className="text-xs text-muted-foreground mt-1">Cycles culturaux actifs</p>
        </Link>

        {/* Récoltes */}
        <Link to="/dashboard/harvests" className="livestock-bento-tile group bg-primary text-primary-foreground border-primary">
          <div className="h-10 w-10 rounded-2xl bg-background/20 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-3">{stats.totalHarvests.toLocaleString()}</p>
          <p className="text-[11px] opacity-80 mt-1">kg récoltés ({stats.harvestCount} récolte{stats.harvestCount > 1 ? "s" : ""})</p>
        </Link>

        {/* Cultures en cours — large tile */}
        <div className="livestock-bento-tile md:col-span-2 md:row-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Cultures en cours</p>
              <h3 className="text-lg font-bold">Répartition</h3>
            </div>
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          {cropEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Wheat className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucun cycle cultural actif</p>
              <Link to="/dashboard/crop-cycles" className="text-xs text-primary mt-2 underline">Démarrer un cycle</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cropEntries.map(([crop, count]) => {
                const pct = stats.activeCycles ? (Number(count) / stats.activeCycles) * 100 : 0;
                return (
                  <div key={crop}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span className="text-base">{cropEmoji(crop)}</span>
                        {crop}
                      </span>
                      <span className="text-sm font-bold tabular-nums">{Number(count)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dépenses du mois */}
        <Link to="/dashboard/costs" className="livestock-bento-tile group">
          <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-foreground" />
          </div>
          <p className="text-xl font-bold mt-3 tabular-nums">{stats.costsThisMonth.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-1">FCFA ce mois</p>
        </Link>

        {/* Coûts totaux */}
        <Link to="/dashboard/investment" className="livestock-bento-tile group bg-emerald-50 dark:bg-emerald-950/30">
          <div className="h-10 w-10 rounded-2xl bg-background flex items-center justify-center">
            <Calculator className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold mt-3 tabular-nums">{stats.totalCosts.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-1">FCFA investis au total</p>
        </Link>
      </section>

      {/* Activité récente */}
      <section className="livestock-bento-tile">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Activité récente</p>
            <h3 className="text-lg font-bold">Dernières opérations</h3>
          </div>
          <Link to="/dashboard/activities" className="text-xs text-primary hover:underline flex items-center gap-1">
            Tout voir <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {recentActivities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Aucune activité enregistrée. Commencez par créer une parcelle !
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentActivities.map((a: any) => (
              <li key={a.id} className="py-3 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate capitalize">{a.activity_type}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.description || "Pas de détails"}
                    {a.date && ` • ${new Date(a.date).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DashboardHome;
