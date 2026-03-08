import { lazy, Suspense } from "react";
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
import MentionsLegales from "./pages/MentionsLegales";
import ConditionsUtilisation from "./pages/ConditionsUtilisation";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

// Lazy-loaded dashboard pages for code splitting
const RoleDashboardHome = lazy(() => import("./pages/dashboard/RoleDashboardHome"));
const FarmsPage = lazy(() => import("./pages/dashboard/FarmsPage"));
const ParcelsPage = lazy(() => import("./pages/dashboard/ParcelsPage"));
const CropCyclesPage = lazy(() => import("./pages/dashboard/CropCyclesPage"));
const ActivitiesPage = lazy(() => import("./pages/dashboard/ActivitiesPage"));
const CostsPage = lazy(() => import("./pages/dashboard/CostsPage"));
const InvestmentPlanPage = lazy(() => import("./pages/dashboard/InvestmentPlanPage"));
const WorkersPage = lazy(() => import("./pages/dashboard/WorkersPage"));
const EquipmentPage = lazy(() => import("./pages/dashboard/EquipmentPage"));
const HarvestsPage = lazy(() => import("./pages/dashboard/HarvestsPage"));
const CalendarPage = lazy(() => import("./pages/dashboard/CalendarPage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const AgriculteurExportPage = lazy(() => import("./pages/dashboard/AgriculteurExportPage"));
const EleveurExportPage = lazy(() => import("./pages/dashboard/EleveurExportPage"));
const AgentExportPage = lazy(() => import("./pages/dashboard/AgentExportPage"));
const PartenaireExportPage = lazy(() => import("./pages/dashboard/PartenaireExportPage"));
const MembersPage = lazy(() => import("./pages/dashboard/MembersPage"));
const CollectesPage = lazy(() => import("./pages/dashboard/CollectesPage"));
const CooperativeExportPage = lazy(() => import("./pages/dashboard/CooperativeExportPage"));
const CooperativeFinancePage = lazy(() => import("./pages/dashboard/CooperativeFinancePage"));
const CooperativeProfilePage = lazy(() => import("./pages/dashboard/CooperativeProfilePage"));
const CooperativeCotisationsPage = lazy(() => import("./pages/dashboard/CooperativeCotisationsPage"));
const CooperativeParcelsPage = lazy(() => import("./pages/dashboard/CooperativeParcelsPage"));
const CooperativeEquipmentPage = lazy(() => import("./pages/dashboard/CooperativeEquipmentPage"));
const CooperativeDocumentsPage = lazy(() => import("./pages/dashboard/CooperativeDocumentsPage"));
const CooperativeScorePage = lazy(() => import("./pages/dashboard/CooperativeScorePage"));
const PartnerProfilePage = lazy(() => import("./pages/dashboard/PartnerProfilePage"));
const PartnerRequestsPage = lazy(() => import("./pages/dashboard/PartnerRequestsPage"));
const CropPlanningPage = lazy(() => import("./pages/dashboard/CropPlanningPage"));
const ServicesPage = lazy(() => import("./pages/dashboard/ServicesPage"));
const AgentDashboard = lazy(() => import("./pages/dashboard/AgentDashboard"));
const RoleSettingsRouter = lazy(() => import("./pages/dashboard/RoleSettingsRouter"));
const LivestockDashboardPage = lazy(() => import("./pages/livestock/LivestockDashboardPage"));
const AnimalsPage = lazy(() => import("./pages/livestock/AnimalsPage"));
const AnimalHealthPage = lazy(() => import("./pages/livestock/AnimalHealthPage"));
const AnimalReproductionPage = lazy(() => import("./pages/livestock/AnimalReproductionPage"));
const AnimalFeedingPage = lazy(() => import("./pages/livestock/AnimalFeedingPage"));
const LivestockFinancePage = lazy(() => import("./pages/livestock/LivestockFinancePage"));
const LivestockServicesPage = lazy(() => import("./pages/livestock/LivestockServicesPage"));
const PricingPage = lazy(() => import("./pages/dashboard/PricingPage"));
const ServiceMarketplacePage = lazy(() => import("./pages/dashboard/ServiceMarketplacePage"));
const JoinCooperativePage = lazy(() => import("./pages/dashboard/JoinCooperativePage"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-48">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Suspense fallback={<PageLoader />}><RoleDashboardHome /></Suspense>} />
              <Route path="farms" element={<Suspense fallback={<PageLoader />}><FarmsPage /></Suspense>} />
              <Route path="parcels" element={<Suspense fallback={<PageLoader />}><ParcelsPage /></Suspense>} />
              <Route path="cycles" element={<Suspense fallback={<PageLoader />}><CropCyclesPage /></Suspense>} />
              <Route path="planning" element={<Suspense fallback={<PageLoader />}><CropPlanningPage /></Suspense>} />
              <Route path="activities" element={<Suspense fallback={<PageLoader />}><ActivitiesPage /></Suspense>} />
              <Route path="costs" element={<Suspense fallback={<PageLoader />}><CostsPage /></Suspense>} />
              <Route path="investment" element={<Suspense fallback={<PageLoader />}><InvestmentPlanPage /></Suspense>} />
              <Route path="workers" element={<Suspense fallback={<PageLoader />}><WorkersPage /></Suspense>} />
              <Route path="equipment" element={<Suspense fallback={<PageLoader />}><EquipmentPage /></Suspense>} />
              <Route path="harvests" element={<Suspense fallback={<PageLoader />}><HarvestsPage /></Suspense>} />
              <Route path="calendar" element={<Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>} />
              <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense>} />
              <Route path="marketplace" element={<Suspense fallback={<PageLoader />}><ServiceMarketplacePage /></Suspense>} />
              <Route path="export" element={<Suspense fallback={<PageLoader />}><AgriculteurExportPage /></Suspense>} />
              <Route path="export-eleveur" element={<Suspense fallback={<PageLoader />}><EleveurExportPage /></Suspense>} />
              <Route path="export-agent" element={<Suspense fallback={<PageLoader />}><AgentExportPage /></Suspense>} />
              <Route path="export-partenaire" element={<Suspense fallback={<PageLoader />}><PartenaireExportPage /></Suspense>} />
              <Route path="members" element={<Suspense fallback={<PageLoader />}><MembersPage /></Suspense>} />
              <Route path="collectes" element={<Suspense fallback={<PageLoader />}><CollectesPage /></Suspense>} />
              <Route path="cooperative-export" element={<Suspense fallback={<PageLoader />}><CooperativeExportPage /></Suspense>} />
              <Route path="cooperative-finance" element={<Suspense fallback={<PageLoader />}><CooperativeFinancePage /></Suspense>} />
              <Route path="cooperative-profile" element={<Suspense fallback={<PageLoader />}><CooperativeProfilePage /></Suspense>} />
              <Route path="cooperative-cotisations" element={<Suspense fallback={<PageLoader />}><CooperativeCotisationsPage /></Suspense>} />
              <Route path="cooperative-parcels" element={<Suspense fallback={<PageLoader />}><CooperativeParcelsPage /></Suspense>} />
              <Route path="cooperative-equipment" element={<Suspense fallback={<PageLoader />}><CooperativeEquipmentPage /></Suspense>} />
              <Route path="cooperative-documents" element={<Suspense fallback={<PageLoader />}><CooperativeDocumentsPage /></Suspense>} />
              <Route path="cooperative-score" element={<Suspense fallback={<PageLoader />}><CooperativeScorePage /></Suspense>} />
              <Route path="services" element={<Suspense fallback={<PageLoader />}><ServicesPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<PageLoader />}><RoleSettingsRouter /></Suspense>} />
              <Route path="partner-profile" element={<Suspense fallback={<PageLoader />}><PartnerProfilePage /></Suspense>} />
              <Route path="partner-requests" element={<Suspense fallback={<PageLoader />}><PartnerRequestsPage /></Suspense>} />
              <Route path="expert/requests" element={<Suspense fallback={<PageLoader />}><AgentDashboard /></Suspense>} />
              <Route path="livestock" element={<Suspense fallback={<PageLoader />}><LivestockDashboardPage /></Suspense>} />
              <Route path="livestock/animals" element={<Suspense fallback={<PageLoader />}><AnimalsPage /></Suspense>} />
              <Route path="livestock/health" element={<Suspense fallback={<PageLoader />}><AnimalHealthPage /></Suspense>} />
              <Route path="livestock/reproduction" element={<Suspense fallback={<PageLoader />}><AnimalReproductionPage /></Suspense>} />
              <Route path="livestock/feeding" element={<Suspense fallback={<PageLoader />}><AnimalFeedingPage /></Suspense>} />
              <Route path="livestock/finance" element={<Suspense fallback={<PageLoader />}><LivestockFinancePage /></Suspense>} />
              <Route path="livestock/services" element={<Suspense fallback={<PageLoader />}><LivestockServicesPage /></Suspense>} />
              <Route path="pricing" element={<Suspense fallback={<PageLoader />}><PricingPage /></Suspense>} />
              <Route path="join-cooperative" element={<Suspense fallback={<PageLoader />}><JoinCooperativePage /></Suspense>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
