import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Table, Calendar, BarChart3, Search, Filter, Plus, Settings, Users, Star } from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ViewType } from "@/types/projects";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ProjectsFilters } from "@/components/projects/ProjectsFilters";
import { ProjectsSettings } from "@/components/projects/ProjectsSettings";
import { useAuthContext } from "@/contexts/AuthContext";
const viewIcons = {
  kanban: LayoutGrid,
  table: Table,
  calendar: Calendar,
  dashboard: BarChart3
};

const viewLabels = {
  kanban: 'Quadro',
  table: 'Tabela',
  calendar: 'Calendário',
  dashboard: 'Painel'
};
export const ProjectsHeader = ({ onToggleFilters }: { onToggleFilters?: () => void }) => {
  const { state, actions } = useProjects();
  const { isAdmin } = useAuthContext();
  const [showSettings, setShowSettings] = useState(false);
  const handleViewChange = (view: ViewType) => {
    actions.setCurrentView(view);
  };
  const handleSearchChange = (value: string) => {
    actions.setFilters({
      search: value
    });
  };
  const activeFiltersCount = Object.values(state.filters).filter(filter => {
    if (Array.isArray(filter)) return filter.length > 0;
    if (typeof filter === 'boolean') return filter;
    if (typeof filter === 'string') return filter.length > 0;
    return filter !== null;
  }).length;
  return (
    <div className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* View Selector and Search */}
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          {Object.entries(viewIcons).map(([view, Icon]) => {
            // Only admins can see dashboard view
            if (view === 'dashboard' && !isAdmin) {
              return null;
            }
            
            return (
              <Button 
                key={view} 
                variant={state.currentView === view ? "default" : "ghost"} 
                size="sm" 
                onClick={() => handleViewChange(view as ViewType)} 
                className={cn(
                  "h-8 px-3 text-muted-foreground hover:text-foreground", 
                  state.currentView === view && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm"
                )}
              >
                <Icon size={16} className="mr-1" />
                {viewLabels[view as ViewType]}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar cartões..." 
              value={state.filters.search} 
              onChange={e => handleSearchChange(e.target.value)} 
              className="w-64 pl-9" 
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter size={16} className="mr-1" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="bottom" className="p-0 w-80">
              <ProjectsFilters />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={16} className="mr-1" />
            Configurações
          </Button>
        </div>
      </div>

      <ProjectsSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};