import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "#e67e22", "#27ae60", "#8e44ad", "#2980b9", "#c0392b",
];

const CooperativeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ members: 0, collectes: 0, totalKg: 0, totalValue: 0 });
  const [productData, setProductData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; kg: number; value: number }[]>([]);
  const [topMembers, setTopMembers] = useState<{ name: string; kg: number; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [mRes, cRes, membersRes] = await Promise.all([
        supabase.from("cooperative_members").select("id, full_name", { count: "exact" }),
        supabase.from("cooperative_collectes").select("quantity_kg, total_amount, product_name, collecte_date, member_id"),
        supabase.from("cooperative_members").select("id, full_name"),
      ]);

      const collectes = cRes.data || [];
      const members = membersRes.data || [];
      const memberMap = new Map(members.map(m => [m.id, m.full_name]));

      // KPIs
      setStats({
        members: mRes.count || 0,
        collectes: collectes.length,
        totalKg: collectes.reduce((s, r) => s + Number(r.quantity_kg), 0),
        totalValue: collectes.reduce((s, r) => s + Number(r.total_amount || 0), 0),
      });

      // Répartition par produit
      const byProduct: Record<string, number> = {};
      collectes.forEach(c => {
        byProduct[c.product_name] = (byProduct[c.product_name] || 0) + Number(c.quantity_kg);
      });
      setProductData(
        Object.entries(byProduct)
          .map(([name, value]) => ({ name, value: Math.round(value) }))
          .sort((a, b) => b.value - a.value)
      );

      // Évolution mensuelle
      const byMonth: Record<string, { kg: number; value: number }> = {};
      collectes.forEach(c => {
        const d = new Date(c.collecte_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!byMonth[key]) byMonth[key] = { kg: 0, value: 0 };
        byMonth[key].kg += Number(c.quantity_kg);
        byMonth[key].value += Number(c.total_amount || 0);
      });
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
      setMonthlyData(
        Object.entries(byMonth)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, v]) => {
            const [, m] = key.split("-");
            return { month: monthNames[parseInt(m) - 1], kg: Math.round(v.kg), value: Math.round(v.value) };
          })
      );

      // Top membres producteurs
      const byMember: Record<string, { kg: number; value: number }> = {};
      collectes.forEach(c => {
        if (!c.member_id) return;
        const name = memberMap.get(c.member_id) || "Inconnu";
        if (!byMember[name]) byMember[name] = { kg: 0, value: 0 };
        byMember[name].kg += Number(c.quantity_kg);
        byMember[name].value += Number(c.total_amount || 0);
      });
      setTopMembers(
        Object.entries(byMember)
          .map(([name, v]) => ({ name, kg: Math.round(v.kg), value: Math.round(v.value) }))
          .sort((a, b) => b.kg - a.kg)
          .slice(0, 10)
      );

      setLoading(false);
    };
    load();
  }, [user]);

  const kpiCards = [
    { label: "Membres", value: stats.members, icon: Users, color: "text-primary" },
    { label: "Collectes", value: stats.collectes, icon: Package, color: "text-secondary" },
    { label: "Total collecté (kg)", value: Math.round(stats.totalKg).toLocaleString(), icon: TrendingUp, color: "text-accent" },
    { label: "Valeur totale (FCFA)", value: Math.round(stats.totalValue).toLocaleString(), icon: DollarSign, color: "text-primary" },
  ];

  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}</div>
      <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Espace Coopérative</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble et analyse de votre coopérative</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="shadow-sm hover:shadow-warm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent><p className="text-2xl font-heading font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Répartition par produit */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-heading">Répartition des collectes par produit</CardTitle>
          </CardHeader>
          <CardContent>
            {productData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Aucune collecte enregistrée</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={productData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} kg`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-heading">Évolution mensuelle des collectes</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Aucune donnée disponible</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    formatter={(v: number, name: string) =>
                      [`${v.toLocaleString()} ${name === "kg" ? "kg" : "FCFA"}`, name === "kg" ? "Quantité" : "Valeur"]
                    }
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                  <Legend />
                  <Bar dataKey="kg" name="Quantité (kg)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value" name="Valeur (FCFA)" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Membres */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-heading">Top membres producteurs</CardTitle>
        </CardHeader>
        <CardContent>
          {topMembers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Aucun apport enregistré</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, topMembers.length * 40 + 40)}>
              <BarChart data={topMembers} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs fill-muted-foreground" />
                <YAxis dataKey="name" type="category" width={120} className="text-xs fill-muted-foreground" />
                <Tooltip
                  formatter={(v: number, name: string) =>
                    [`${v.toLocaleString()} ${name === "kg" ? "kg" : "FCFA"}`, name === "kg" ? "Quantité" : "Valeur"]
                  }
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Legend />
                <Bar dataKey="kg" name="Quantité (kg)" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="value" name="Valeur (FCFA)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CooperativeDashboard;
