import { ReactNode, createContext, useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DueCardAlert } from "@/components/projects/DueCardAlert";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }
  return context;
};

// Page titles mapping
const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/projetos': 'Projetos',
    '/crm': 'CRM',
    '/leads': 'Leads',
    '/clientes': 'Clientes',
    '/vendas': 'Vendas',
    '/acompanhamento': 'Acompanhamento',
    '/relatorios': 'Relatórios',
    '/configuracoes': 'Configurações',
    '/colaboradores': 'Colaboradores',
    '/financeiro': 'Financeiro'
  };
  
  return titles[pathname] || 'Sistema Poderalize';
};

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <Header title={title} />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
        <DueCardAlert />
      </div>
    </SidebarContext.Provider>
  );
};