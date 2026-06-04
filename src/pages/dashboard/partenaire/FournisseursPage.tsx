import { Truck } from "lucide-react";
import PartnerEntriesPage from "./PartnerEntriesPage";

export default function FournisseursPage() {
  return <PartnerEntriesPage
    category="fournisseur"
    title="Fournisseurs"
    subtitle="Vos fournisseurs d'intrants, semences, matériels et autres."
    icon={<Truck className="h-5 w-5" />}
  />;
}
