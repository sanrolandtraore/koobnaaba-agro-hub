import { AgroCalculator } from "@/components/expert/AgroCalculator";
import { Calculator } from "lucide-react";

export default function ExpertCalculatorPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6 text-primary" />Calculatrice agronomique</h1>
        <p className="text-sm text-muted-foreground">Densité de semis, conversions, doses, besoin en eau, rendement potentiel.</p>
      </div>
      <AgroCalculator />
    </div>
  );
}
