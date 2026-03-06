import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CooperativeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ farms: 0, harvests: 0, totalCosts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [farmsRes, harvestsRes, costsRes] = await Promise.all([
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("harvests").select("quantity_kg"),
        supabase.from("cost_entries").select("amount"),
      ]);
      setStats({
        farms: farmsRes.count || 0,
        harvests: (harvestsRes.data || []).reduce((s, h) => s + Number(h.quantity_kg), 0),
        totalCosts: (costsRes.data || []).reduce((s, c) => s + Number(c.amount), 0),
      });
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Membres / Exploitations", value: stats.farms, icon: Users, color: "text-primary" },
    { label: "Collectes (kg)", value: Math.round(stats.harvests).toLocaleString(), icon: Package, color: "text-secondary" },
    { label: "Dépenses totales (FCFA)", value: Math.round(stats.totalCosts).toLocaleString(), icon: DollarSign, color: "text-accent" },
  ];

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Espace Coopérative</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre coopérative</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm hover:shadow-warm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent><p className="text-2xl font-heading font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Activité récente</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Les fonctionnalités coopérative (gestion de membres, collectes groupées, etc.) sont en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CooperativeDashboard;
