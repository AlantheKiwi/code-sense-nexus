import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HowItWorksPage from "./pages/HowItWorksPage";
import DemoPage from "./pages/DemoPage";
import UsefulPromptsPage from "./pages/UsefulPromptsPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import StatsPage from "./pages/StatsPage";
import BestPracticesPage from "./pages/BestPracticesPage";
import ProjectSettingsPage from "./pages/ProjectSettingsPage";
import UpdatesPage from "./pages/UpdatesPage";
import DebugSessionPage from "./pages/DebugSessionPage";
import TeamSettingsPage from "./pages/TeamSettingsPage";
import AppLayout from "./components/layout/AppLayout";
import InstructionsPage from "./pages/InstructionsPage";

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PricingManagement from "./pages/admin/PricingManagement";
import UserManagement from "./pages/admin/UserManagement";
import LegalPagesManagement from "./pages/admin/LegalPagesManagement";
import SystemSettings from "./pages/admin/SystemSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log('App component is rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/instructions" element={<InstructionsPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/useful-prompts" element={<UsefulPromptsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/best-practices" element={<BestPracticesPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/project/:projectId/settings" element={<ProjectSettingsPage />} />
                  <Route path="/team/:teamId/settings" element={<TeamSettingsPage />} />
                  <Route path="/project/:projectId/debug/:sessionId" element={<DebugSessionPage />} />
                  <Route path="/updates" element={<UpdatesPage />} />
                </Route>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="pricing" element={<PricingManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="legal" element={<LegalPagesManagement />} />
                  <Route path="settings" element={<SystemSettings />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
