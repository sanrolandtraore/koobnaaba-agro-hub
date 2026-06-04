import { useAuth } from "@/contexts/AuthContext";
import { useCooperativeRole } from "@/hooks/useCooperativeRole";
import AgriculteurExportPage from "./AgriculteurExportPage";
import EleveurExportPage from "./EleveurExportPage";
import CooperativeExportPage from "./CooperativeExportPage";
import AgentExportPage from "./AgentExportPage";

const RoleExportRouter = () => {
  const { primaryRole } = useAuth();
  const { isCoopMember } = useCooperativeRole();

  if (isCoopMember) return <CooperativeExportPage />;

  switch (primaryRole) {
    case "eleveur": return <EleveurExportPage />;
    case "cooperative": return <CooperativeExportPage />;
    case "agent_technique": return <AgentExportPage />;
    default: return <AgriculteurExportPage />;
  }
};

export default RoleExportRouter;
