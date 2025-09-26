import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import Projetos from "./pages/Projetos";
import CRM from "./pages/CRM";
import Leads from "./pages/Leads";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Acompanhamento from "./pages/Acompanhamento";
import Vendas from "./pages/Vendas";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public route */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <AuthGuard>
                    <Layout />
                  </AuthGuard>
                }>
                  <Route index element={
                    <AuthGuard requiredPage="dashboard">
                      <Dashboard />
                    </AuthGuard>
                  } />
                  <Route path="projetos" element={
                    <AuthGuard requiredPage="projetos">
                      <Projetos />
                    </AuthGuard>
                  } />
                  <Route path="crm" element={
                    <AuthGuard requiredPage="crm">
                      <CRM />
                    </AuthGuard>
                  } />
                  <Route path="leads" element={
                    <AuthGuard requiredPage="leads">
                      <Leads />
                    </AuthGuard>
                  } />
                  <Route path="vendas" element={
                    <AuthGuard requiredPage="vendas">
                      <Vendas />
                    </AuthGuard>
                  } />
                  <Route path="acompanhamento" element={
                    <AuthGuard requiredPage="acompanhamento">
                      <Acompanhamento />
                    </AuthGuard>
                  } />
                  <Route path="relatorios" element={
                    <AuthGuard requiredPage="relatorios">
                      <Relatorios />
                    </AuthGuard>
                  } />
                  <Route path="configuracoes" element={
                    <AuthGuard requiredPage="configuracoes">
                      <Configuracoes />
                    </AuthGuard>
                  } />
                  <Route path="colaboradores" element={
                    <AuthGuard requiredRole="admin" requiredPage="colaboradores">
                      <Colaboradores />
                    </AuthGuard>
                  } />
                </Route>
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
