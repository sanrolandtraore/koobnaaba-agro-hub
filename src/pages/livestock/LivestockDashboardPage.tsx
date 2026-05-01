import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOfflineData } from "@/hooks/useOfflineData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bug, Heart, Baby, DollarSign, AlertTriangle, WifiOff } from "lucide-react";

const speciesLabels: Record<string, string> = {
  bovin: "Bovins",
  ovin: "Ovins",
  caprin: "Caprins",
  porcin: "Porcins",
  volaille: "Volaille",
  pisciculture: "Pisciculture",
};

const LivestockDashboardPage = () => {
  const { user } = useAuth();

  const monthStart = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    []
  );

  const { data: animals, loading: loadingAnimals, isOffline } = useOfflineData<any>({
    table: "animals",
    select: "species, status",
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
    animals.forEach((a: any) => { bySpecies[a.species] = (bySpecies[a.species] || 0) + 1; });

    const healthThisMonth = healthAll.filter((h: any) => h.event_date && h.event_date >= monthStart).length;
    const upcomingBirths = reproAll.filter((r: any) => r.expected_birth_date && !r.actual_birth_date).length;
    const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
    const totalSales = sales.reduce((s: number, e: any) => s + Number(e.total_amount || 0), 0);

    return {
      totalAnimals: animals.length,
      bySpecies,
      healthEventsThisMonth: healthThisMonth,
      upcomingBirths,
      totalExpenses,
      totalSales,
    };
  }, [animals, healthAll, reproAll, expenses, sales, monthStart]);

  const recentHealth = useMemo(
    () => [...healthAll].sort((a: any, b: any) => (b.event_date || "").localeCompare(a.event_date || "")).slice(0, 5),
    [healthAll]
  );

  if (!user) return null;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Élevage — Tableau de bord</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Animaux actifs", value: stats.totalAnimals, icon: Bug, color: "text-emerald-600" },
    { label: "Soins ce mois", value: stats.healthEventsThisMonth, icon: Heart, color: "text-red-500" },
    { label: "Naissances attendues", value: stats.upcomingBirths, icon: Baby, color: "text-blue-500" },
    { label: "Balance", value: `${(stats.totalSales - stats.totalExpenses).toLocaleString()} FCFA`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-heading font-bold">Élevage — Tableau de bord</h1>
        {isOffline && (
          <Badge variant="outline" className="text-xs">
            <WifiOff className="h-3 w-3 mr-1" />Mode hors-ligne — données en cache
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Répartition par espèce</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(stats.bySpecies).length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun animal enregistré</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.bySpecies).map(([sp, count]) => (
                  <div key={sp} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{speciesLabels[sp] || sp}</span>
                    <span className="text-sm font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Derniers événements santé</CardTitle></CardHeader>
          <CardContent>
            {recentHealth.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun événement récent</p>
            ) : (
              <div className="space-y-3">
                {recentHealth.map((h: any) => (
                  <div key={h.id} className="flex items-start gap-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{h.event_type} — {h.animals?.name || "Animal"}</p>
                      <p className="text-muted-foreground">
                        {h.description || "Pas de détails"}
                        {h.event_date && ` • ${new Date(h.event_date).toLocaleDateString("fr-FR")}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivestockDashboardPage;
