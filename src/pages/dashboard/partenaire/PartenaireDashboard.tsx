import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, ShieldCheck, FolderKanban, Landmark, Handshake } from "lucide-react";

const TILES = [
  { to: "/dashboard/partenaire-fournisseurs", label: "Fournisseurs", icon: Truck, category: "fournisseur" as const },
  { to: "/dashboard/partenaire-assurance", label: "Assurance", icon: ShieldCheck, category: "assurance" as const },
  { to: "/dashboard/partenaire-programmes", label: "Programmes / Projets", icon: FolderKanban, category: "programme" as const },
  { to: "/dashboard/partenaire-banques", label: "Services bancaires agricoles", icon: Landmark, category: "banque" as const },
];

export default function PartenaireDashboard() {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("partner_entries").select("category").eq("user_id", user.id);
      const c: Record<string, number> = {};
      (data || []).forEach((r: any) => { c[r.category] = (c[r.category] || 0) + 1; });
      setCounts(c);
    })();
  }, [user]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 text-primary"><Handshake className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Module Partenaires</h1>
          <p className="text-sm text-muted-foreground">Bienvenue {profile?.full_name || ""}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TILES.map(({ to, label, icon: Icon, category }) => (
          <Link key={to} to={to}>
            <Card className="hover:border-primary/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{counts[category] || 0}</p>
                <p className="text-xs text-muted-foreground">entrées enregistrées</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
