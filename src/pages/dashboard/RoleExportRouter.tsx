import { useAuth } from "@/contexts/AuthContext";
import AgriculteurExportPage from "./AgriculteurExportPage";
import EleveurExportPage from "./EleveurExportPage";

const RoleExportRouter = () => {
  const { primaryRole } = useAuth();
  return primaryRole === "eleveur" ? <EleveurExportPage /> : <AgriculteurExportPage />;
};

export default RoleExportRouter;
