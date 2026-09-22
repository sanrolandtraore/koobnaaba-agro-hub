import SettingsPage from "@/components/SettingsPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Microscope, Award, FileCheck, MapPin } from "lucide-react";

const roleTab = (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Microscope className="h-4 w-4 text-primary" />
          Paramètres du profil Expert Agronome
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Agrément & Certification</p>
            <p className="text-xs">Numéro d'agrément agronomique et affiliations officielles (Ordre des Agronomes, Ministères).</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <FileCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Signature des ordonnances</p>
            <p className="text-xs">Signature électronique apposée sur vos ordonnances phytosanitaires et plans de fertilisation.</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Rayon de tournée & Géolocalisation</p>
            <p className="text-xs">Zone géographique d'intervention pour les visites de parcelles et diagnostics terrain.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ExpertSettingsPage = () => (
  <SettingsPage roleLabel="Expert Agronome" roleSpecificTab={roleTab} roleSpecificTabLabel="Expertise" />
);

export default ExpertSettingsPage;
