import SettingsPage from "@/components/SettingsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const roleTab = (
  <Card>
    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Paramètres Coopérative</CardTitle></CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground">
      <p>• Gestion des rôles : Président, Trésorier, Secrétaire, Membre</p>
      <p>• Répartition automatique des revenus de ventes groupées</p>
      <p>• Archivage numérique des documents statutaires</p>
      <p>• Score de performance coopérative</p>
    </CardContent>
  </Card>
);

const CooperativeSettingsPage = () => (
  <SettingsPage roleLabel="Coopérative" roleSpecificTab={roleTab} roleSpecificTabLabel="Coopérative" />
);

export default CooperativeSettingsPage;
