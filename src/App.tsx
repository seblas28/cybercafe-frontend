// src/App.tsx
import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { Sidebar } from "@/components/Sidebar";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClientPCMap = lazy(() => import("./pages/client/ClientPCMap"));
const ClientReserve = lazy(() => import("./pages/client/ClientReserve"));
const ClientCafeteria = lazy(() => import("./pages/client/ClientCafeteria"));
const ClientReport = lazy(() => import("./pages/client/ClientReport"));
const ClientAccount = lazy(() => import("./pages/client/ClientAccount"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPCManagement = lazy(() => import("./pages/admin/AdminPCManagement"));
const AdminUserManagement = lazy(() => import("./pages/admin/AdminUserManagement"));
const AdminDemand = lazy(() => import("./pages/admin/AdminDemand"));
const NotFound = lazy(() => import("./pages/NotFound"));

import { initializeMockData } from "@/utils/mockData";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const ProtectedLayout = ({ children }: { children: JSX.Element }) => {
  const { isOpen } = useSidebar();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className={`flex-1 p-6 overflow-auto transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  useEffect(() => {
    const seed = async () => {
      try {
        await initializeMockData();
      } catch (err) {
        console.warn('Seed falló:', err);
      }
    };
    seed();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SidebarProvider>
            <BrowserRouter>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-cyan-400 font-bold">Cargando cyber-matrix...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
                  
                  <Route path="/dashboard/cliente" element={<ProtectedLayout><ClientPCMap /></ProtectedLayout>} />
                  <Route path="/dashboard/cliente/reserve" element={<ProtectedLayout><ClientReserve /></ProtectedLayout>} />
                  <Route path="/dashboard/cliente/cafeteria" element={<ProtectedLayout><ClientCafeteria /></ProtectedLayout>} />
                  <Route path="/dashboard/cliente/report" element={<ProtectedLayout><ClientReport /></ProtectedLayout>} />
                  <Route path="/dashboard/cliente/my-account" element={<ProtectedLayout><ClientAccount /></ProtectedLayout>} />

                  <Route path="/dashboard/admin" element={<ProtectedLayout><AdminDashboard /></ProtectedLayout>} />
                  <Route path="/dashboard/admin/demand" element={<ProtectedLayout><AdminDemand /></ProtectedLayout>} />
                  <Route path="/dashboard/admin/manage-pcs" element={<ProtectedLayout><AdminPCManagement /></ProtectedLayout>} />
                  <Route path="/dashboard/admin/manage-users" element={<ProtectedLayout><AdminUserManagement /></ProtectedLayout>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>

              <Toaster />
              <Sonner />
            </BrowserRouter>
          </SidebarProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;