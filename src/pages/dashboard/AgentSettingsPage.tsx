import SettingsPage from "@/components/SettingsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

const roleTab = (
  <Card>
    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Compass className="h-4 w-4" />Paramètres Expert</CardTitle></CardHeader>
    <CardContent className="space-y-2 text-sm text-muted-foreground">
      <p>• Spécialités et zones d'intervention configurables</p>
      <p>• Notifications de nouvelles demandes de services</p>
      <p>• Rapports d'expertise automatisés</p>
    </CardContent>
  </Card>
);

const AgentSettingsPage = () => (
  <SettingsPage roleLabel="Expert Agronome" roleSpecificTab={roleTab} roleSpecificTabLabel="Expertise" />
);

export default AgentSettingsPage;
