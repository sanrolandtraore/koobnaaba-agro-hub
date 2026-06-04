import { FolderKanban } from "lucide-react";
import PartnerEntriesPage from "./PartnerEntriesPage";

export default function ProgrammesPage() {
  return <PartnerEntriesPage
    category="programme"
    title="Programmes / Projets"
    subtitle="Programmes de développement, projets ONG, appels à candidatures."
    icon={<FolderKanban className="h-5 w-5" />}
  />;
}
