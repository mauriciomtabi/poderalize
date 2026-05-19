import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DueCardAlert } from "@/components/projects/DueCardAlert";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/projetos': 'Projetos',
    '/crm': 'CRM',
    '/leads': 'Leads',
    '/clientes': 'Clientes',
    '/vendas': 'Vendas',
    '/planos': 'Planos',
    '/redes-sociais': 'Redes Sociais',
    '/acompanhamento': 'Acompanhamento',
    '/relatorios': 'Relatórios',
    '/configuracoes': 'Configurações',
    '/colaboradores': 'Colaboradores',
    '/financeiro': 'Financeiro'
  };
  return titles[pathname] || 'Sistema Poderalize';
};

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed for more screen real estate
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${collapsed ? 'md:pl-16' : 'md:pl-64'}`}>
          <Header title={title} />
          <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
            <Outlet />
          </main>
        </div>
        <DueCardAlert />
      </div>
    </SidebarContext.Provider>
  );
};
