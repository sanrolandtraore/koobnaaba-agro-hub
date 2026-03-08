import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import OfflineIndicator from "@/components/OfflineIndicator";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import RoleDashboardHome from "./pages/dashboard/RoleDashboardHome";
import FarmsPage from "./pages/dashboard/FarmsPage";
import ParcelsPage from "./pages/dashboard/ParcelsPage";
import CropCyclesPage from "./pages/dashboard/CropCyclesPage";
import ActivitiesPage from "./pages/dashboard/ActivitiesPage";
import CostsPage from "./pages/dashboard/CostsPage";
import InvestmentPlanPage from "./pages/dashboard/InvestmentPlanPage";
import WorkersPage from "./pages/dashboard/WorkersPage";
import EquipmentPage from "./pages/dashboard/EquipmentPage";
import HarvestsPage from "./pages/dashboard/HarvestsPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import AgriculteurExportPage from "./pages/dashboard/AgriculteurExportPage";
import EleveurExportPage from "./pages/dashboard/EleveurExportPage";
import AgentExportPage from "./pages/dashboard/AgentExportPage";
import PartenaireExportPage from "./pages/dashboard/PartenaireExportPage";
import MembersPage from "./pages/dashboard/MembersPage";
import CollectesPage from "./pages/dashboard/CollectesPage";
import CooperativeExportPage from "./pages/dashboard/CooperativeExportPage";
import CooperativeFinancePage from "./pages/dashboard/CooperativeFinancePage";
import CooperativeProfilePage from "./pages/dashboard/CooperativeProfilePage";
import CooperativeCotisationsPage from "./pages/dashboard/CooperativeCotisationsPage";
import CooperativeParcelsPage from "./pages/dashboard/CooperativeParcelsPage";
import CooperativeEquipmentPage from "./pages/dashboard/CooperativeEquipmentPage";
import CooperativeDocumentsPage from "./pages/dashboard/CooperativeDocumentsPage";
import CooperativeScorePage from "./pages/dashboard/CooperativeScorePage";
import CropPlanningPage from "./pages/dashboard/CropPlanningPage";
import ServicesPage from "./pages/dashboard/ServicesPage";
import AgentDashboard from "./pages/dashboard/AgentDashboard";
import LivestockDashboardPage from "./pages/livestock/LivestockDashboardPage";
import AnimalsPage from "./pages/livestock/AnimalsPage";
import AnimalHealthPage from "./pages/livestock/AnimalHealthPage";
import AnimalReproductionPage from "./pages/livestock/AnimalReproductionPage";
import AnimalFeedingPage from "./pages/livestock/AnimalFeedingPage";
import LivestockFinancePage from "./pages/livestock/LivestockFinancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<RoleDashboardHome />} />
              <Route path="farms" element={<FarmsPage />} />
              <Route path="parcels" element={<ParcelsPage />} />
              <Route path="cycles" element={<CropCyclesPage />} />
              <Route path="planning" element={<CropPlanningPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="costs" element={<CostsPage />} />
              <Route path="investment" element={<InvestmentPlanPage />} />
              <Route path="workers" element={<WorkersPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              <Route path="harvests" element={<HarvestsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="export" element={<AgriculteurExportPage />} />
              <Route path="export-eleveur" element={<EleveurExportPage />} />
              <Route path="export-agent" element={<AgentExportPage />} />
              <Route path="export-partenaire" element={<PartenaireExportPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="collectes" element={<CollectesPage />} />
              <Route path="cooperative-export" element={<CooperativeExportPage />} />
              <Route path="cooperative-finance" element={<CooperativeFinancePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="expert/requests" element={<AgentDashboard />} />
              <Route path="livestock" element={<LivestockDashboardPage />} />
              <Route path="livestock/animals" element={<AnimalsPage />} />
              <Route path="livestock/health" element={<AnimalHealthPage />} />
              <Route path="livestock/reproduction" element={<AnimalReproductionPage />} />
              <Route path="livestock/feeding" element={<AnimalFeedingPage />} />
              <Route path="livestock/finance" element={<LivestockFinancePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
