import SettingsPage from "@/components/SettingsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake } from "lucide-react";

const roleTab = (
  <Card>
    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Handshake className="h-4 w-4" />Paramètres Partenaire</CardTitle></CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground">
      <p>• Catégorie partenaire : Crédit, Assurance, Intrants, Institution</p>
      <p>• Visibilité dans l'annuaire des partenaires</p>
      <p>• Notifications de demandes de services correspondantes</p>
    </CardContent>
  </Card>
);

const PartenaireSettingsPage = () => (
  <SettingsPage roleLabel="Partenaire" roleSpecificTab={roleTab} roleSpecificTabLabel="Partenariat" />
);

export default PartenaireSettingsPage;
