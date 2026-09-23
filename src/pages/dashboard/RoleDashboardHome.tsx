import { useAuth } from "@/contexts/AuthContext";
import LivestockDashboardPage from "@/pages/livestock/LivestockDashboardPage";
import PartenaireDashboard from "@/pages/dashboard/partenaire/PartenaireDashboard";
import CropPlanningPage from "@/pages/dashboard/CropPlanningPage";

const RoleDashboardHome = () => {
  const { primaryRole, partnerType } = useAuth();

  // Éleveurs pastoraux et cabinets vétérinaires accèdent directement au tableau de bord Cheptel
  if (primaryRole === "eleveur" || (primaryRole === "partenaire" && partnerType === "elevage_veterinaire")) {
    return <LivestockDashboardPage />;
  }

  switch (primaryRole) {
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
