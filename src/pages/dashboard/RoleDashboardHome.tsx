import { useAuth } from "@/contexts/AuthContext";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import LivestockDashboardPage from "@/pages/livestock/LivestockDashboardPage";
import CooperativeDashboard from "@/pages/dashboard/CooperativeDashboard";
import AgentDashboard from "@/pages/dashboard/AgentDashboard";
import PartenaireDashboard from "@/pages/dashboard/PartenaireDashboard";

const RoleDashboardHome = () => {
  const { primaryRole } = useAuth();

  switch (primaryRole) {
    case "eleveur":
      return <LivestockDashboardPage />;
    case "cooperative":
      return <CooperativeDashboard />;
    case "agent_technique":
      return <AgentDashboard />;
    case "partenaire":
      return <PartenaireDashboard />;
    case "agriculteur":
    case "admin":
    case "manager":
    case "farmer":
    case "viewer":
    default:
      return <DashboardHome />;
  }
};

export default RoleDashboardHome;
