import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Wheat, Bug, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ farms: 0, cycles: 0, animals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [farmsRes, cyclesRes, animalsRes] = await Promise.all([
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("crop_cycles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("animals").select("id", { count: "exact", head: true }).eq("status", "actif"),
      ]);
      setStats({ farms: farmsRes.count || 0, cycles: cyclesRes.count || 0, animals: animalsRes.count || 0 });
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Exploitations suivies", value: stats.farms, icon: MapPin, color: "text-primary" },
    { label: "Cycles actifs", value: stats.cycles, icon: Wheat, color: "text-secondary" },
    { label: "Animaux actifs", value: stats.animals, icon: Bug, color: "text-accent" },
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
        <h1 className="text-2xl font-heading font-bold">Espace Agent Technique</h1>
        <p className="text-muted-foreground mt-1">Suivi et conseil aux producteurs</p>
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
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />Prochaines visites</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Les fonctionnalités agent technique (planification visites, rapports de suivi, etc.) sont en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;
