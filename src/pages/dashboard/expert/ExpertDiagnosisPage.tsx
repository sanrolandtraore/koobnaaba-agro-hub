import { CropDiagnosisTool } from "@/components/expert/CropDiagnosisTool";
import { Microscope } from "lucide-react";

export default function ExpertDiagnosisPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Microscope className="h-6 w-6 text-primary" />Diagnostic IA</h1>
        <p className="text-sm text-muted-foreground">Identifiez maladies, ravageurs ou carences à partir d'une photo et de symptômes observés.</p>
      </div>
      <CropDiagnosisTool />
    </div>
  );
}
