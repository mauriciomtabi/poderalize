import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarContext } from "./Layout";
import { 
  Home, 
  Users, 
  Kanban, 
  UserPlus, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Target,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "@/assets/poderalize-logo.png";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Colaboradores", href: "/colaboradores" },
  { icon: Kanban, label: "Projetos", href: "/projetos" },
  { icon: PieChart, label: "CRM", href: "/crm" },
  { icon: Target, label: "Leads", href: "/leads" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export const Sidebar = () => {
  const { collapsed, setCollapsed } = useSidebarContext();
  const location = useLocation();

  return (
    <div className={cn(
      "fixed left-0 top-0 bg-gradient-secondary text-secondary-foreground transition-all duration-300 h-screen flex flex-col border-r border-border z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-secondary/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Poderalize" className="w-12 h-12 rounded-lg shadow-lg" />
              <div>
                <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">Poderalize</span>
                <div className="text-sm text-secondary-foreground/80">CRM</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex flex-col items-center space-y-2 w-full">
              <img src={logo} alt="Poderalize" className="w-10 h-10 rounded-lg shadow-lg" />
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="text-secondary-foreground hover:bg-secondary/20"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="text-secondary-foreground hover:bg-secondary/20"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-secondary/20 text-secondary-foreground"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-secondary/20">
        {!collapsed && (
          <div className="text-xs text-secondary-foreground/60 text-center">
            v1.0 - Poderalize
          </div>
        )}
      </div>
    </div>
  );
};