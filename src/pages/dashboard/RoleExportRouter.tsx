import { useAuth } from "@/contexts/AuthContext";
import AgriculteurExportPage from "./AgriculteurExportPage";
import EleveurExportPage from "./EleveurExportPage";
import PartenaireExportPage from "./PartenaireExportPage";

const RoleExportRouter = () => {
  const { primaryRole } = useAuth();
  if (primaryRole === "eleveur") return <EleveurExportPage />;
  if (
    primaryRole === "partenaire" ||
    primaryRole === "agent_technique" ||
    primaryRole === "expert" ||
    primaryRole === "formation"
  ) {
    return <PartenaireExportPage />;
  }
  return <AgriculteurExportPage />;
};

export default RoleExportRouter;
