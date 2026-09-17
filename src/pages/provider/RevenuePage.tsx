import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Mission {
  id: string; title: string; client_name: string; domain: string; status: string;
  scheduled_date: string; completed_date: string | null; price: number | null; paid: boolean;
}

const fcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

export default function RevenuePage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("provider_missions")
      .select("id, title, client_name, domain, status, scheduled_date, completed_date, price, paid")
      .eq("provider_id", user.id).order("scheduled_date", { ascending: false });
    setMissions((data ?? []) as Mission[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const billable = useMemo(() => missions.filter((m) => m.status === "terminee" && m.price), [missions]);
  const total = billable.reduce((s, m) => s + Number(m.price), 0);
  const paid = billable.filter((m) => m.paid).reduce((s, m) => s + Number(m.price), 0);
  const pending = total - paid;

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    billable.forEach((m) => {
      const key = (m.completed_date ?? m.scheduled_date).slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + Number(m.price));
    });
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  }, [billable]);

  const togglePaid = async (m: Mission) => {
    const { error } = await supabase.from("provider_missions").update({ paid: !m.paid }).eq("id", m.id);
    if (error) return toast({ title: "Mise à jour impossible", variant: "destructive" });
    load();
  };

  const tiles = [
    { label: "Chiffre d'affaires", value: fcfa(total), icon: TrendingUp },
    { label: "Encaissé", value: fcfa(paid), icon: CheckCircle2 },
    { label: "En attente", value: fcfa(pending), icon: Clock },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-5 w-5" /> Revenus</h1>
        <p className="text-sm text-muted-foreground">Suivi des prestations facturées et des paiements</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiles.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-xl font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {byMonth.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Par mois</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {byMonth.map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {new Date(`${month}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
                <span className="font-medium">{fcfa(amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Prestations terminées</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : billable.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune prestation facturée pour le moment.</p>
          ) : (
            billable.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.client_name} · {new Date(m.completed_date ?? m.scheduled_date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold">{fcfa(Number(m.price))}</span>
                  <Badge variant={m.paid ? "secondary" : "outline"}>{m.paid ? "Payé" : "À encaisser"}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => togglePaid(m)}>
                    {m.paid ? "Annuler" : "Marquer payé"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
