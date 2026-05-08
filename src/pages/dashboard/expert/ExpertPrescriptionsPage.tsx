import { PrescriptionGenerator } from "@/components/expert/PrescriptionGenerator";
import { FileText } from "lucide-react";

export default function ExpertPrescriptionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Ordonnance agronomique</h1>
        <p className="text-sm text-muted-foreground">Générez et archivez une ordonnance PDF signée pour votre client.</p>
      </div>
      <PrescriptionGenerator />
    </div>
  );
}
