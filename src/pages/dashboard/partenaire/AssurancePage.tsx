import { ShieldCheck } from "lucide-react";
import PartnerEntriesPage from "./PartnerEntriesPage";

export default function AssurancePage() {
  return <PartnerEntriesPage
    category="assurance"
    title="Partenaires Assurance"
    subtitle="Compagnies et produits d'assurance agricole et d'élevage."
    icon={<ShieldCheck className="h-5 w-5" />}
  />;
}
