import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageGuard } from "@/components/auth/PageGuard";
import { Layout } from "@/components/layout/Layout";
import Colaboradores from "./pages/Colaboradores";
import Projetos from "./pages/Projetos";
import CRM from "./pages/CRM";
import Leads from "./pages/Leads";
import Clientes from "./pages/Clientes";
import Vendas from "./pages/Vendas";
import Financeiro from "./pages/Financeiro";
import Planos from "./pages/Planos";
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
                    <PageGuard page="projetos">
                      <Projetos />
                    </PageGuard>
                  } />
                  <Route path="projetos" element={
                    <PageGuard page="projetos">
                      <Projetos />
                    </PageGuard>
                  } />
                  <Route path="crm" element={
                    <PageGuard page="crm">
                      <CRM />
                    </PageGuard>
                  } />
                  <Route path="leads" element={
                    <PageGuard page="leads">
                      <Leads />
                    </PageGuard>
                  } />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="vendas" element={<Vendas />} />
                  <Route path="planos" element={<Planos />} />
                  <Route path="financeiro" element={
                    <AuthGuard requiredRole="admin">
                      <Financeiro />
                    </AuthGuard>
                  } />
                  <Route path="colaboradores" element={
                    <AuthGuard requiredRole="admin">
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
