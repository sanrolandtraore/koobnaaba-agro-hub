import { useAuth } from "@/contexts/AuthContext";
import AgriculteurSettingsPage from "./AgriculteurSettingsPage";
import EleveurSettingsPage from "./EleveurSettingsPage";
import PartenaireSettingsPage from "./PartenaireSettingsPage";

const RoleSettingsRouter = () => {
  const { primaryRole } = useAuth();
  if (primaryRole === "eleveur") return <EleveurSettingsPage />;
  if (primaryRole === "partenaire") return <PartenaireSettingsPage />;
  return <AgriculteurSettingsPage />;
};

export default RoleSettingsRouter;
