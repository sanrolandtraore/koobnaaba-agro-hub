import { useAuth } from "@/contexts/AuthContext";
import LivestockDashboardPage from "@/pages/livestock/LivestockDashboardPage";
import PartenaireDashboard from "@/pages/dashboard/partenaire/PartenaireDashboard";
import CropPlanningPage from "@/pages/dashboard/CropPlanningPage";

const RoleDashboardHome = () => {
  const { primaryRole } = useAuth();

  switch (primaryRole) {
    case "eleveur":
      return <LivestockDashboardPage />;
    case "agriculteur":
    case "farmer":
      return <CropPlanningPage />;
    case "partenaire":
    case "agent_technique":
    case "expert":
    case "formation":
    default:
      return <PartenaireDashboard />;
  }
};

export default RoleDashboardHome;
