import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import FarmsPage from "./pages/dashboard/FarmsPage";
import ParcelsPage from "./pages/dashboard/ParcelsPage";
import CropCyclesPage from "./pages/dashboard/CropCyclesPage";
import ActivitiesPage from "./pages/dashboard/ActivitiesPage";
import CostsPage from "./pages/dashboard/CostsPage";
import InvestmentPlanPage from "./pages/dashboard/InvestmentPlanPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="farms" element={<FarmsPage />} />
              <Route path="parcels" element={<ParcelsPage />} />
              <Route path="cycles" element={<CropCyclesPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="costs" element={<CostsPage />} />
              <Route path="investment" element={<InvestmentPlanPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
