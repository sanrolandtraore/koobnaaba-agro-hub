import { useAuth } from "@/contexts/AuthContext";
import AgriculteurSettingsPage from "./AgriculteurSettingsPage";
import EleveurSettingsPage from "./EleveurSettingsPage";
import CooperativeSettingsPage from "./CooperativeSettingsPage";
import AgentSettingsPage from "./AgentSettingsPage";
import PartenaireSettingsPage from "./PartenaireSettingsPage";

const RoleSettingsRouter = () => {
  const { primaryRole } = useAuth();

  switch (primaryRole) {
    case "eleveur": return <EleveurSettingsPage />;
    case "cooperative": return <CooperativeSettingsPage />;
    case "agent_technique": return <AgentSettingsPage />;
    case "partenaire": return <PartenaireSettingsPage />;
    default: return <AgriculteurSettingsPage />;
  }
};

export default RoleSettingsRouter;
