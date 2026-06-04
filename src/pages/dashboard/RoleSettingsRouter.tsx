import { useAuth } from "@/contexts/AuthContext";
import AgriculteurSettingsPage from "./AgriculteurSettingsPage";
import EleveurSettingsPage from "./EleveurSettingsPage";
import CooperativeSettingsPage from "./CooperativeSettingsPage";
import AgentSettingsPage from "./AgentSettingsPage";

const RoleSettingsRouter = () => {
  const { primaryRole } = useAuth();

  switch (primaryRole) {
    case "eleveur": return <EleveurSettingsPage />;
    case "cooperative": return <CooperativeSettingsPage />;
    case "agent_technique": return <AgentSettingsPage />;
    default: return <AgriculteurSettingsPage />;
  }
};

export default RoleSettingsRouter;
