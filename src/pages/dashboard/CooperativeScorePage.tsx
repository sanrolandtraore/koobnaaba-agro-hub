import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Users, Wheat, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

type ScoreData = {
  totalMembers: number; activeMembers: number;
  totalProduction: number; totalCotisations: number;
  cotisationRate: number; avgYield: number;
  totalSales: number; totalExpenses: number;
};

const CooperativeScorePage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [mRes, cRes, cotRes, sRes, eRes, pRes] = await Promise.all([
        supabase.from("cooperative_members").select("id, status", { count: "exact" }),
        supabase.from("cooperative_collectes").select("quantity_kg"),
        supabase.from("cooperative_cotisations").select("amount, member_id"),
        supabase.from("cooperative_sales").select("total_amount"),
        supabase.from("cooperative_expenses").select("amount"),
        supabase.from("cooperative_parcels").select("area_ha"),
      ]);

      const members = mRes.data || [];
      const collectes = cRes.data || [];
      const cotisations = cotRes.data || [];
      const sales = sRes.data || [];
      const expenses = eRes.data || [];
      const parcels = pRes.data || [];

      const totalMembers = members.length;
      const activeMembers = members.filter((m: any) => m.status === "actif").length;
      const totalProduction = collectes.reduce((s: number, c: any) => s + Number(c.quantity_kg), 0);
      const totalCotisations = cotisations.reduce((s: number, c: any) => s + Number(c.amount), 0);
      const uniqueCotMembers = new Set(cotisations.map((c: any) => c.member_id)).size;
      const cotisationRate = totalMembers > 0 ? (uniqueCotMembers / totalMembers) * 100 : 0;
      const totalArea = parcels.reduce((s: number, p: any) => s + Number(p.area_ha), 0);
      const avgYield = totalArea > 0 ? totalProduction / totalArea : 0;
      const totalSalesAmount = sales.reduce((s: number, r: any) => s + Number(r.total_amount), 0);
      const totalExpensesAmount = expenses.reduce((s: number, r: any) => s + Number(r.amount), 0);

      setData({
        totalMembers, activeMembers, totalProduction,
        totalCotisations, cotisationRate, avgYield,
        totalSales: totalSalesAmount, totalExpenses: totalExpensesAmount,
      });
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map(i=><Skeleton key={i} className="h-40" />)}</div></div>;
  if (!data) return null;

  // Score calculation (0–100)
  const memberScore = Math.min(data.totalMembers / 50 * 25, 25); // max 25 for 50+ members
  const cotisationScore = Math.min(data.cotisationRate / 100 * 25, 25); // max 25 for 100% rate
  const productionScore = Math.min(data.totalProduction / 10000 * 25, 25); // max 25 for 10t+
  const financeScore = data.totalSales > 0 ? Math.min((data.totalSales - data.totalExpenses) / data.totalSales * 25, 25) : 0;
  const totalScore = Math.round(memberScore + cotisationScore + productionScore + Math.max(financeScore, 0));

  const getGrade = (score: number) => {
    if (score >= 80) return { label: "A — Excellent", color: "text-primary" };
    if (score >= 60) return { label: "B — Bon", color: "text-accent" };
    if (score >= 40) return { label: "C — Moyen", color: "text-secondary" };
    return { label: "D — À améliorer", color: "text-destructive" };
  };
  const grade = getGrade(totalScore);

  const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

  const criteria = [
    { label: "Effectif & Organisation", score: Math.round(memberScore), max: 25, icon: Users, detail: `${data.totalMembers} membres (${data.activeMembers} actifs)` },
    { label: "Discipline cotisation", score: Math.round(cotisationScore), max: 25, icon: CheckCircle, detail: `${Math.round(data.cotisationRate)}% des membres cotisent` },
    { label: "Production totale", score: Math.round(productionScore), max: 25, icon: Wheat, detail: `${fmt(data.totalProduction)} kg collectés` },
    { label: "Santé financière", score: Math.round(Math.max(financeScore, 0)), max: 25, icon: DollarSign, detail: `Ventes: ${fmt(data.totalSales)} / Dépenses: ${fmt(data.totalExpenses)} FCFA` },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" /> Score Coopérative
        </h1>
        <p className="text-muted-foreground mt-1">Évaluation globale basée sur la performance</p>
      </div>

      {/* Global score */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center py-8">
          <div className="text-6xl font-heading font-bold text-primary">{totalScore}</div>
          <div className="text-sm text-muted-foreground mt-1">/ 100</div>
          <Badge className="mt-3 text-lg px-4 py-1" variant="outline">
            <span className={grade.color}>{grade.label}</span>
          </Badge>
          <Progress value={totalScore} className="mt-4 w-64 h-3" />
        </CardContent>
      </Card>

      {/* Criteria breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {criteria.map(c => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <c.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-heading font-bold">{c.score}</span>
                <span className="text-sm text-muted-foreground">/ {c.max}</span>
              </div>
              <Progress value={(c.score / c.max) * 100} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">{c.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recommandations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.totalMembers < 20 && <p className="text-sm text-muted-foreground">• Recruter plus de membres pour renforcer la coopérative</p>}
          {data.cotisationRate < 70 && <p className="text-sm text-muted-foreground">• Améliorer le taux de cotisation ({Math.round(data.cotisationRate)}% actuellement)</p>}
          {data.totalProduction < 5000 && <p className="text-sm text-muted-foreground">• Augmenter la production collective ({fmt(data.totalProduction)} kg actuellement)</p>}
          {data.totalExpenses > data.totalSales * 0.8 && <p className="text-sm text-muted-foreground">• Contrôler les dépenses (ratio dépenses/ventes élevé)</p>}
          {totalScore >= 60 && <p className="text-sm text-primary font-medium">✓ Coopérative éligible à une demande de financement groupé</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default CooperativeScorePage;
