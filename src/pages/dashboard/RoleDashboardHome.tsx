import { useAuth } from "@/contexts/AuthContext";
import { useCooperativeRole } from "@/hooks/useCooperativeRole";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import LivestockDashboardPage from "@/pages/livestock/LivestockDashboardPage";
import CooperativeDashboard from "@/pages/dashboard/CooperativeDashboard";
import AgentDashboard from "@/pages/dashboard/AgentDashboard";
import PartenaireDashboard from "@/pages/dashboard/PartenaireDashboard";

const RoleDashboardHome = () => {
  const { primaryRole } = useAuth();
  const { isCoopMember } = useCooperativeRole();

  // If user is a linked cooperative member, show cooperative dashboard
  if (isCoopMember) return <CooperativeDashboard />;

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
