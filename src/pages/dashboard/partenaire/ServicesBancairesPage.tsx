import { Landmark } from "lucide-react";
import PartnerEntriesPage from "./PartnerEntriesPage";

export default function ServicesBancairesPage() {
  return <PartnerEntriesPage
    category="banque"
    title="Services bancaires agricoles"
    subtitle="Banques, microfinances et produits de crédit dédiés à l'agriculture."
    icon={<Landmark className="h-5 w-5" />}
  />;
}
