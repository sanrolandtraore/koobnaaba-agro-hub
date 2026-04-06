import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bug, Heart, Baby, DollarSign, AlertTriangle } from "lucide-react";

interface Stats {
  totalAnimals: number;
  bySpecies: Record<string, number>;
  healthEventsThisMonth: number;
  upcomingBirths: number;
  totalExpenses: number;
  totalSales: number;
}

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
  const [stats, setStats] = useState<Stats>({
    totalAnimals: 0, bySpecies: {}, healthEventsThisMonth: 0,
    upcomingBirths: 0, totalExpenses: 0, totalSales: 0,
  });
  const [recentHealth, setRecentHealth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const [animalsRes, healthRes, reproRes, expensesRes, salesRes, recentHealthRes] = await Promise.all([
        supabase.from("animals").select("species, status").eq("status", "actif"),
        supabase.from("animal_health_events").select("id, event_date").gte("event_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
        supabase.from("animal_reproductions").select("id, expected_birth_date").not("expected_birth_date", "is", null).is("actual_birth_date", null),
        supabase.from("livestock_expenses").select("amount"),
        supabase.from("livestock_sales").select("total_amount"),
        supabase.from("animal_health_events").select("id, event_type, event_date, description, animal_id, animals(name, species)").order("event_date", { ascending: false }).limit(5),
      ]);

      const animals = animalsRes.data || [];
      const bySpecies: Record<string, number> = {};
      animals.forEach((a: any) => { bySpecies[a.species] = (bySpecies[a.species] || 0) + 1; });

      setStats({
        totalAnimals: animals.length,
        bySpecies,
        healthEventsThisMonth: (healthRes.data || []).length,
        upcomingBirths: (reproRes.data || []).length,
        totalExpenses: (expensesRes.data || []).reduce((s: number, e: any) => s + Number(e.amount), 0),
        totalSales: (salesRes.data || []).reduce((s: number, e: any) => s + Number(e.total_amount), 0),
      });
      setRecentHealth(recentHealthRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

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
      <h1 className="text-2xl font-heading font-bold">Élevage — Tableau de bord</h1>

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
                      <p className="font-medium">{h.event_type} — {(h as any).animals?.name || "Animal"}</p>
                      <p className="text-muted-foreground">{h.description || "Pas de détails"} • {new Date(h.event_date).toLocaleDateString("fr-FR")}</p>
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
