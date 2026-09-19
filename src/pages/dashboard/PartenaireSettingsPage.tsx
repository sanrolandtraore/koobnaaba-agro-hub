import SettingsPage from "@/components/SettingsPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getStoredProviderSubscription, SUBSCRIPTION_PLANS } from "@/lib/providerSubscription";

const PartenaireSettingsTab = () => {
  const sub = getStoredProviderSubscription();
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === sub.tier) || SUBSCRIPTION_PLANS[2];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Abonnement Prestataire & Partenaire
            </CardTitle>
            <Badge className="bg-emerald-600 text-white font-semibold">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Actif
            </Badge>
          </div>
          <CardDescription>
            Formule actuelle : <strong>{plan.title}</strong> ({sub.companyName})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Valide jusqu'au <strong>{new Date(sub.endDate).toLocaleDateString("fr-FR")}</strong>. Votre compte donne accès à l'ensemble des outils d'aide à la décision KoobNaaba : Diagnostic IA, Ordonnances signées, Scouting terrain, Flotte de location et Offres de vente.
          </p>
          <Button asChild size="sm" className="gradient-primary text-primary-foreground font-semibold">
            <Link to="/dashboard/partenaire-abonnement">
              Modifier ou renouveler mon abonnement <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const PartenaireSettingsPage = () => (
  <SettingsPage
    roleLabel="Entreprise Prestataire"
    roleSpecificTab={<PartenaireSettingsTab />}
    roleSpecificTabLabel="Abonnement & Entreprise"
  />
);

export default PartenaireSettingsPage;
