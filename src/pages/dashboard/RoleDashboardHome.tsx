import { useAuth } from "@/contexts/AuthContext";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import LivestockDashboardPage from "@/pages/livestock/LivestockDashboardPage";
import EducationCatalogPage from "@/pages/dashboard/education/EducationCatalogPage";
import PartenaireDashboard from "@/pages/dashboard/partenaire/PartenaireDashboard";

const RoleDashboardHome = () => {
  const { primaryRole } = useAuth();

  switch (primaryRole) {
    case "eleveur":
      return <LivestockDashboardPage />;
    case "formation":
      return <EducationCatalogPage />;
    case "partenaire":
      return <PartenaireDashboard />;
    default:
      return <DashboardHome />;
  }
};

export default RoleDashboardHome;
