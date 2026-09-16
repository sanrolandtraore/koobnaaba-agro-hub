import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Users, ClipboardList, Wallet, Plus, Store, Microscope,
  CalendarDays, MapPin, ArrowRight,
} from "lucide-react";

interface Mission {
  id: string;
  title: string;
  client_name: string;
  domain: string;
  status: string;
  scheduled_date: string;
  price: number | null;
  paid: boolean;
  location_name: string | null;
}

const statusLabel: Record<string, string> = {
  planifiee: "Planifiée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

export default function ProviderDashboard() {
  const { user, profile } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [interventionCount, setInterventionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [m, c, i] = await Promise.all([
        supabase.from("provider_missions").select("*").eq("provider_id", user.id).order("scheduled_date", { ascending: false }),
        supabase.from("expert_clients").select("id", { count: "exact", head: true }).eq("expert_id", user.id),
        supabase.from("mission_interventions").select("id", { count: "exact", head: true }).eq("provider_id", user.id),
      ]);
      setMissions((m.data ?? []) as Mission[]);
      setClientCount(c.count ?? 0);
      setInterventionCount(i.count ?? 0);
      setLoading(false);
    })();
  }, [user]);

  const active = missions.filter((m) => m.status === "planifiee" || m.status === "en_cours");
  const done = missions.filter((m) => m.status === "terminee");
  const revenue = done.reduce((s, m) => s + (Number(m.price) || 0), 0);
  const unpaid = done.filter((m) => !m.paid).reduce((s, m) => s + (Number(m.price) || 0), 0);
  const upcoming = [...active].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)).slice(0, 5);

  const tiles = [
    { label: "Clients", value: clientCount, icon: Users, to: "/dashboard/clients" },
    { label: "Missions en cours", value: active.length, icon: Briefcase, to: "/dashboard/missions" },
    { label: "Interventions", value: interventionCount, icon: ClipboardList, to: "/dashboard/interventions" },
    { label: "Revenus (FCFA)", value: revenue.toLocaleString("fr-FR"), icon: Wallet, to: "/dashboard/revenus" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-primary/10 p-5">
        <p className="text-sm text-muted-foreground">Espace prestataire</p>
        <h1 className="text-2xl font-bold">Bonjour {profile?.full_name || ""}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {active.length} mission(s) en cours · {unpaid.toLocaleString("fr-FR")} FCFA en attente de paiement
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-auto py-3 justify-start gap-2">
          <Link to="/dashboard/missions"><Plus className="h-4 w-4" /> Nouvelle mission</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2">
          <Link to="/dashboard/clients"><Users className="h-4 w-4" /> Nouveau client</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2">
          <Link to="/dashboard/expert-diagnosis"><Microscope className="h-4 w-4" /> Analyse IA</Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 justify-start gap-2">
          <Link to="/dashboard/marketplace"><Store className="h-4 w-4" /> Marketplace</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to}>
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Prochaines missions
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/missions">Tout voir <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune mission planifiée pour le moment.</p>
          ) : (
            upcoming.map((m) => (
              <Link key={m.id} to="/dashboard/missions" className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.client_name} · {new Date(m.scheduled_date).toLocaleDateString("fr-FR")}
                    {m.location_name ? ` · ${m.location_name}` : ""}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">{statusLabel[m.status] ?? m.status}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Domaines d'intervention</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          {["agriculture", "elevage"].map((d) => (
            <div key={d} className="flex-1 rounded-lg border p-3">
              <p className="text-xs text-muted-foreground capitalize">{d === "elevage" ? "Élevage" : "Agriculture"}</p>
              <p className="text-xl font-bold">{missions.filter((m) => m.domain === d).length}</p>
              <p className="text-xs text-muted-foreground">missions</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
