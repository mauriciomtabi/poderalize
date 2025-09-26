import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppProvider } from "@/contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Colaboradores from "./pages/Colaboradores";
import Projetos from "./pages/Projetos";
import CRM from "./pages/CRM";
import Leads from "./pages/Leads";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Acompanhamento from "./pages/Acompanhamento";
import Vendas from "./pages/Vendas";
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
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/colaboradores" element={<Colaboradores />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/acompanhamento" element={<Acompanhamento />} />
              <Route path="/vendas" element={<Vendas />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
