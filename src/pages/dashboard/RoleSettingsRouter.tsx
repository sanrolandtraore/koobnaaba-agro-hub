import { useAuth } from "@/contexts/AuthContext";
import AgriculteurSettingsPage from "./AgriculteurSettingsPage";
import EleveurSettingsPage from "./EleveurSettingsPage";

const RoleSettingsRouter = () => {
  const { primaryRole } = useAuth();
  return primaryRole === "eleveur" ? <EleveurSettingsPage /> : <AgriculteurSettingsPage />;
};

export default RoleSettingsRouter;
