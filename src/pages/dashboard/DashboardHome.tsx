import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Wheat, Activity, DollarSign } from "lucide-react";

interface Stats {
  farms: number;
  parcels: number;
  activeCycles: number;
  totalCosts: number;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ farms: 0, parcels: 0, activeCycles: 0, totalCosts: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [farmsRes, parcelsRes, cyclesRes, costsRes, activitiesRes] = await Promise.all([
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("parcels").select("id", { count: "exact", head: true }),
        supabase.from("crop_cycles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.rpc("get_user_total_costs", { _user_id: user!.id }),
        supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      const totalCosts = typeof costsRes.data === "number" ? costsRes.data : 0;
      setStats({
        farms: farmsRes.count || 0,
        parcels: parcelsRes.count || 0,
        activeCycles: cyclesRes.count || 0,
        totalCosts,
      });
      setRecentActivities(activitiesRes.data || []);
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: "Exploitations", value: stats.farms, icon: MapPin, color: "text-primary" },
    { label: "Parcelles", value: stats.parcels, icon: MapPin, color: "text-secondary" },
    { label: "Cycles actifs", value: stats.activeCycles, icon: Wheat, color: "text-success" },
    { label: "Coûts totaux", value: `${stats.totalCosts.toLocaleString()} FCFA`, icon: DollarSign, color: "text-accent" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold">Tableau de bord</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-24" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de votre exploitation</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm hover:shadow-warm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Activités récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune activité enregistrée. Commencez par créer une exploitation !</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="font-medium capitalize">{a.activity_type}</span>
                    {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                  </div>
                  <span className="text-sm text-muted-foreground">{new Date(a.date).toLocaleDateString("fr-FR")}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
