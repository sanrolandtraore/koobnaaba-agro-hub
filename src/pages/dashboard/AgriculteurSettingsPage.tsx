import SettingsPage from "@/components/SettingsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout } from "lucide-react";

const roleTab = (
  <Card>
    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sprout className="h-4 w-4" />Paramètres Agriculture</CardTitle></CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground">
      <p>• Unités de mesure : hectares, kilogrammes, FCFA</p>
      <p>• Saisons configurées automatiquement selon votre pays</p>
      <p>• Les zones climatiques et cultures de référence s'adaptent à votre localisation</p>
    </CardContent>
  </Card>
);

const AgriculteurSettingsPage = () => (
  <SettingsPage roleLabel="Agriculteur" roleSpecificTab={roleTab} roleSpecificTabLabel="Agriculture" />
);

export default AgriculteurSettingsPage;
