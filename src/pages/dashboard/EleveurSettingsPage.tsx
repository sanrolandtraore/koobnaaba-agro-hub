import SettingsPage from "@/components/SettingsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef } from "lucide-react";

const roleTab = (
  <Card>
    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Beef className="h-4 w-4" />Paramètres Élevage</CardTitle></CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground">
      <p>• Espèces gérées : bovins, caprins, porcins, volaille, pisciculture</p>
      <p>• Suivi individuel ou par lot selon vos préférences</p>
      <p>• Rappels automatiques de vaccinations et traitements</p>
    </CardContent>
  </Card>
);

const EleveurSettingsPage = () => (
  <SettingsPage roleLabel="Éleveur" roleSpecificTab={roleTab} roleSpecificTabLabel="Élevage" />
);

export default EleveurSettingsPage;
