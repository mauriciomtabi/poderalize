import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarContext } from "./Layout";
import { 
  Users, 
  Kanban, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Target,
  PieChart,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "@/assets/poderalize-logo.png";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { PagePermission } from "@/hooks/useUserPermissions";

const menuItems = [
  { icon: Users, label: "Colaboradores", href: "/colaboradores", page: "colaboradores" as PagePermission, adminOnly: true },
  { icon: Kanban, label: "Projetos", href: "/projetos", page: "projetos" as PagePermission },
  { icon: PieChart, label: "CRM", href: "/crm", page: "crm" as PagePermission },
  { icon: Target, label: "Leads", href: "/leads", page: "leads" as PagePermission },
  { icon: UserCheck, label: "Clientes", href: "/clientes", page: "clientes" as PagePermission },
];

export const Sidebar = () => {
  const { collapsed, setCollapsed } = useSidebarContext();
  const location = useLocation();
  const { user, isAdmin } = useAuthContext();
  const [visibleMenuItems, setVisibleMenuItems] = useState(menuItems);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) {
        setVisibleMenuItems([]);
        return;
      }

      // Admins veem tudo
      if (isAdmin) {
        setVisibleMenuItems(menuItems);
        return;
      }

      // Para não-admins, verificar permissões
      const itemsWithPermission = await Promise.all(
        menuItems.map(async (item) => {
          // Se o item é só para admin, esconder
          if (item.adminOnly) {
            return null;
          }

          // Se não tem página específica (como Clientes), mostrar
          if (!item.page) {
            return item;
          }

          // Verificar permissão no banco
          try {
            const { data, error } = await supabase.rpc('user_has_page_permission', {
              _user_id: user.id,
              _page: item.page
            });

            if (error) throw error;
            return data ? item : null;
          } catch (error) {
            console.error('Error checking permission:', error);
            return null;
          }
        })
      );

      setVisibleMenuItems(itemsWithPermission.filter(Boolean) as typeof menuItems);
    };

    checkPermissions();
  }, [user, isAdmin]);

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
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname === item.href || (location.pathname === "/" && item.href === "/projetos");
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