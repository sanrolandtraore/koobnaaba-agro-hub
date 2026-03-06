import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CooperativeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ members: 0, collectes: 0, totalKg: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [mRes, cRes] = await Promise.all([
        supabase.from("cooperative_members").select("id", { count: "exact", head: true }),
        supabase.from("cooperative_collectes").select("quantity_kg, total_amount"),
      ]);
      const rows = cRes.data || [];
      setStats({
        members: mRes.count || 0,
        collectes: rows.length,
        totalKg: rows.reduce((s, r) => s + Number(r.quantity_kg), 0),
        totalValue: rows.reduce((s, r) => s + Number(r.total_amount), 0),
      });
      setLoading(false);
    };
    load();
  }, [user]);

  const cards = [
    { label: "Membres", value: stats.members, icon: Users, color: "text-primary" },
    { label: "Collectes", value: stats.collectes, icon: Package, color: "text-secondary" },
    { label: "Total collecté (kg)", value: Math.round(stats.totalKg).toLocaleString(), icon: TrendingUp, color: "text-accent" },
    { label: "Valeur totale (FCFA)", value: Math.round(stats.totalValue).toLocaleString(), icon: DollarSign, color: "text-primary" },
  ];

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Espace Coopérative</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre coopérative</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
};

export default CooperativeDashboard;
