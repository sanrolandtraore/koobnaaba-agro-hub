import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Microscope, FileText, Eye, Tractor, Store, Calculator, MapPin,
  Users, Handshake, CheckCircle2, ArrowRight, ShieldCheck, Zap, Package
} from "lucide-react";
import { getStoredProviderSubscription, ProviderSubscription, SUBSCRIPTION_PLANS } from "@/lib/providerSubscription";

export default function PartenaireDashboard() {
  const { user, profile } = useAuth();
  const [sub, setSub] = useState<ProviderSubscription>(getStoredProviderSubscription());
  const [counts, setCounts] = useState<{ offers: number; clients: number; partners: number }>({
    offers: 0,
    clients: 0,
    partners: 0,
  });

  useEffect(() => {
    const handler = () => setSub(getStoredProviderSubscription());
    window.addEventListener("koobnaaba-subscription-updated", handler);
    return () => window.removeEventListener("koobnaaba-subscription-updated", handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [offersRes, clientsRes, partnersRes] = await Promise.all([
          supabase.from("marketplace_offers").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
          supabase.from("expert_clients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          supabase.from("partner_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        ]);
        setCounts({
          offers: offersRes.count || 0,
          clients: clientsRes.count || 0,
          partners: partnersRes.count || 0,
        });
      } catch (e) {
        // Fallback gracefully
      }
    })();
  }, [user]);

  const activePlan = SUBSCRIPTION_PLANS.find(p => p.id === sub.tier) || SUBSCRIPTION_PLANS[2];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <Handshake className="h-3.5 w-3.5" />
            Espace Entreprise Prestataire & Partenaire
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Bonjour {profile?.full_name || sub.companyName}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Pilotez vos activités de <strong>Services agricoles</strong>, <strong>Vente d'intrants</strong> et <strong>Location de matériel</strong> grâce aux outils technologiques KoobNaaba.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 bg-background/80 backdrop-blur-sm p-4 rounded-xl border">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Abonnement {activePlan.title}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Valide jusqu'au {new Date(sub.endDate).toLocaleDateString("fr-FR")}
          </p>
          <Button asChild size="sm" variant="outline" className="text-xs font-semibold mt-1">
            <Link to="/dashboard/partenaire-abonnement">
              Gérer mon abonnement <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary 3 Pillars: Services, Vente, Location */}
      <div>
        <h2 className="text-lg font-heading font-bold mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Vos Pôles d'Activités & Outils KoobNaaba
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pôle 1: Services Agronomiques & Conseil */}
          <Card className="hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                <Microscope className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">1. Services Agronomiques</CardTitle>
              <CardDescription className="text-xs">
                Diagnostic IA, ordonnances signées, scouting GPS et accompagnement des producteurs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/dashboard/expert-diagnosis" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Microscope className="h-3.5 w-3.5 text-primary" /> Diagnostic IA Végétal</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/expert-prescriptions" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-emerald-600" /> Ordonnances PDF Signées</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/scouting" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 text-blue-600" /> Scouting terrain GPS</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/expert-calculator" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Calculator className="h-3.5 w-3.5 text-indigo-600" /> Calculatrice de doses</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pôle 2: Location de Matériel & Mécanisation */}
          <Card className="hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                <Tractor className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">2. Location de Matériel</CardTitle>
              <CardDescription className="text-xs">
                Mise en location de tracteurs, pulvérisateurs par drone, moissonneuses et équipements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/dashboard/equipment" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Tractor className="h-3.5 w-3.5 text-amber-600" /> Parc Machines & Disponibilité</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/expert-cartography" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-rose-600" /> Mesure surface & Polygones</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/expert-clients" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-teal-600" /> Tournées & Producteurs clients</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pôle 3: Vente d'Intrants, Semences & Matériels */}
          <Card className="hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-2">
                <Store className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold">3. Vente d'Intrants & Matériels</CardTitle>
              <CardDescription className="text-xs">
                Publication de vos catalogues, semences certifiées, engrais et réception des commandes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex flex-col gap-1.5 text-xs">
                <Link to="/dashboard/partenaire-mes-offres" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Store className="h-3.5 w-3.5 text-indigo-600" /> Mes Offres en ligne ({counts.offers})</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/crop-library" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-emerald-600" /> Fiches techniques de référence</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
                <Link to="/dashboard/marketplace" className="p-2 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between font-medium">
                  <span className="flex items-center gap-2"><Store className="h-3.5 w-3.5 text-amber-600" /> Marketplace KoobNaaba</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscription upgrade banner */}
      <div className="bg-card border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base">Faites évoluer votre abonnement entreprise</h3>
            <p className="text-xs text-muted-foreground">
              Bénéficiez du pack Pro Prestataire & Location ou Entreprise Multi-agents avec Mobile Money (Orange Money, Moov Money, Wave).
            </p>
          </div>
        </div>
        <Button asChild className="gradient-primary text-primary-foreground font-semibold shrink-0">
          <Link to="/dashboard/partenaire-abonnement">
            Voir les formules d'abonnement
          </Link>
        </Button>
      </div>
    </div>
  );
}
