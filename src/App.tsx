import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { TrainingPage } from "./pages/TrainingPage";
import { RoleAuthPage } from "./pages/RoleAuthPage";
import { CitizenDashboard } from "./pages/CitizenDashboard";
import { WorkerDashboard } from "./pages/WorkerDashboard";
import { VehicleTracking } from "./pages/VehicleTracking";
import { TestLocationTracking } from "./pages/TestLocationTracking";
import { RecyclingCenter } from "./pages/RecyclingCenter";
import { RecyclingCenterDashboard } from "./pages/RecyclingCenterDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { QRScannerPage } from "./pages/QRScannerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Clear localStorage if user is authenticated but has no role
  if (isAuthenticated && !user?.role) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    return null;
  }

  // Redirect admin users to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin-login" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Admin routes - separate from main app */}
      <Route path="/admin-login" element={!isAuthenticated ? <AdminLoginPage /> : <Navigate to="/admin-dashboard" replace />} />
      
      {/* Public routes */}
      <Route path="/" element={isAuthenticated && user?.role && user.role !== 'admin' ? <Navigate to={`/dashboard/${user.role}`} replace /> : <HomePage />} />
      <Route path="/training" element={<TrainingPage />} />
      <Route path="/qr-scanner" element={<QRScannerPage />} />
      <Route path="/scan/:qrCode" element={<QRScannerPage />} />
      <Route path="/auth/:role" element={isAuthenticated && user?.role ? <Navigate to={user.role === 'admin' ? '/admin-dashboard' : `/dashboard/${user.role}`} replace /> : <RoleAuthPage />} />
      
      {/* Protected routes for non-admin users */}
      {isAuthenticated && user?.role !== 'admin' ? (
        <Route path="/dashboard/*" element={
          <Layout>
            <Routes>
              <Route path="/citizen" element={user?.role === 'citizen' ? <CitizenDashboard /> : <Navigate to={user?.role ? `/dashboard/${user.role}` : '/'} replace />} />
              <Route path="/worker" element={user?.role === 'worker' ? <WorkerDashboard /> : <Navigate to={user?.role ? `/dashboard/${user.role}` : '/'} replace />} />
              <Route path="/recycler" element={user?.role === 'recycler' ? <RecyclingCenterDashboard /> : <Navigate to={user?.role ? `/dashboard/${user.role}` : '/'} replace />} />
              <Route path="/tracking" element={<VehicleTracking />} />
              <Route path="/test-location" element={<TestLocationTracking />} />
              <Route path="/undefined" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to={user?.role ? `/dashboard/${user.role}` : '/'} replace />} />
            </Routes>
          </Layout>
        } />
      ) : (
        <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
      )}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
