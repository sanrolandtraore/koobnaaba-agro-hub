import { useAuth } from "@/contexts/AuthContext";
import { useCooperativeRole } from "@/hooks/useCooperativeRole";
import AgriculteurExportPage from "./AgriculteurExportPage";
import EleveurExportPage from "./EleveurExportPage";
import CooperativeExportPage from "./CooperativeExportPage";

const RoleExportRouter = () => {
  const { primaryRole } = useAuth();
  const { isCoopMember } = useCooperativeRole();

  if (isCoopMember) return <CooperativeExportPage />;

  switch (primaryRole) {
    case "eleveur": return <EleveurExportPage />;
    case "cooperative": return <CooperativeExportPage />;
    default: return <AgriculteurExportPage />;
  }
};

export default RoleExportRouter;
