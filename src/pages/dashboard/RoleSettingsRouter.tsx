import { useAuth } from "@/contexts/AuthContext";
import AgriculteurSettingsPage from "./AgriculteurSettingsPage";
import EleveurSettingsPage from "./EleveurSettingsPage";
import CooperativeSettingsPage from "./CooperativeSettingsPage";

const RoleSettingsRouter = () => {
  const { primaryRole } = useAuth();

  switch (primaryRole) {
    case "eleveur": return <EleveurSettingsPage />;
    case "cooperative": return <CooperativeSettingsPage />;
    default: return <AgriculteurSettingsPage />;
  }
};

export default RoleSettingsRouter;
