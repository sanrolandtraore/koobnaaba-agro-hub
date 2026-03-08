import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, Handshake, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PartenaireDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, hasProfile: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [reqRes, profileRes] = await Promise.all([
        supabase.from("service_requests").select("status"),
        supabase.from("partner_directory").select("id").eq("created_by", user.id).maybeSingle(),
      ]);
      const reqs = reqRes.data || [];
      setStats({
        total: reqs.length,
        pending: reqs.filter(r => r.status === "en_attente").length,
        inProgress: reqs.filter(r => r.status === "en_cours").length,
        completed: reqs.filter(r => r.status === "terminee").length,
        hasProfile: !!profileRes.data,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const cards = [
    { label: "Demandes totales", value: stats.total, icon: ClipboardList, color: "text-primary" },
    { label: "En attente", value: stats.pending, icon: Clock, color: "text-amber-500" },
    { label: "En cours", value: stats.inProgress, icon: MessageSquare, color: "text-blue-500" },
    { label: "Terminées", value: stats.completed, icon: CheckCircle, color: "text-emerald-500" },
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
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Handshake className="h-6 w-6 text-primary" /> Espace Partenaire
        </h1>
        <p className="text-muted-foreground mt-1">Proposez vos services et répondez aux demandes des agriculteurs</p>
      </div>

      {!stats.hasProfile && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold">Complétez votre profil partenaire</p>
              <p className="text-sm text-muted-foreground">Renseignez vos informations pour être visible dans l'annuaire</p>
            </div>
            <Button onClick={() => navigate("/dashboard/partner-profile")}>Compléter le profil</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm hover:shadow-warm transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/partner-requests")}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-heading font-semibold">Demandes de services</p>
              <p className="text-sm text-muted-foreground">Consulter et répondre aux demandes des agriculteurs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-warm transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/partner-profile")}>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <Handshake className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="font-heading font-semibold">Mon profil partenaire</p>
              <p className="text-sm text-muted-foreground">Gérer votre fiche dans l'annuaire des partenaires</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartenaireDashboard;
