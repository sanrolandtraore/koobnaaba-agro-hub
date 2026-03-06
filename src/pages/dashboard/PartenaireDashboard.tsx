import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, BarChart3, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PartenaireDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalInvestment: 0, totalRevenue: 0, avgRoi: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from("investment_plans").select("total_investment, expected_revenue, expected_roi_percent");
      const plans = data || [];
      const totalInvestment = plans.reduce((s, p) => s + Number(p.total_investment), 0);
      const totalRevenue = plans.reduce((s, p) => s + Number(p.expected_revenue), 0);
      const avgRoi = plans.length ? plans.reduce((s, p) => s + Number(p.expected_roi_percent || 0), 0) / plans.length : 0;
      setStats({ totalInvestment, totalRevenue, avgRoi });
      setLoading(false);
    };
    fetch();
  }, [user]);

  const cards = [
    { label: "Investissements (FCFA)", value: Math.round(stats.totalInvestment).toLocaleString(), icon: Calculator, color: "text-primary" },
    { label: "Revenus projetés (FCFA)", value: Math.round(stats.totalRevenue).toLocaleString(), icon: DollarSign, color: "text-secondary" },
    { label: "ROI moyen (%)", value: stats.avgRoi.toFixed(1), icon: BarChart3, color: "text-accent" },
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
        <h1 className="text-2xl font-heading font-bold">Espace Partenaire</h1>
        <p className="text-muted-foreground mt-1">Suivi des investissements et performances</p>
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
        <CardHeader><CardTitle>Portefeuille</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Les fonctionnalités partenaire (suivi portefeuille, dossiers de financement, etc.) sont en cours de développement.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartenaireDashboard;
