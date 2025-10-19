import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Table, Calendar, BarChart3, Search, Filter, Plus, Settings, Users, Star, Zap, Eye } from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ViewType } from "@/types/projects";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectsFilters } from "@/components/projects/ProjectsFilters";
import { ProjectsSettings } from "@/components/projects/ProjectsSettings";
import { AutomationDialog } from "./automation/AutomationDialog";
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
export const ProjectsHeader = ({
  onToggleFilters
}: {
  onToggleFilters?: () => void;
}) => {
  const {
    state,
    actions
  } = useProjects();
  const {
    isAdmin
  } = useAuthContext();
  const [showSettings, setShowSettings] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
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
  return <div className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* View Selector and Search */}
      <div className="flex flex-col lg:flex-row gap-3 landscape:gap-2 lg:gap-0 items-stretch lg:items-center justify-between px-3 landscape:px-2 sm:px-4 pb-3 landscape:pb-1 sm:pb-4">
        <div className="flex items-center space-x-3 landscape:space-x-2 overflow-x-auto pb-2 landscape:pb-1 lg:pb-0">
          <div className="grid grid-cols-2 md:flex items-center space-x-0 md:space-x-1 gap-1 landscape:gap-0.5 md:gap-0 bg-muted rounded-lg p-1 landscape:p-0.5">
          {Object.entries(viewIcons).map(([view, Icon]) => {
          // Only admins can see dashboard view
          if (view === 'dashboard' && !isAdmin) {
            return null;
          }
          return <Button key={view} variant={state.currentView === view ? "default" : "ghost"} size="sm" onClick={() => handleViewChange(view as ViewType)} className={cn("h-8 landscape:h-6 px-2 landscape:px-1 sm:px-3 text-muted-foreground hover:text-foreground text-sm landscape:text-xs", state.currentView === view && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm")}>
                <Icon size={16} className="sm:mr-1 landscape:w-3 landscape:h-3" />
                <span className="hidden sm:inline landscape:hidden lg:inline">{viewLabels[view as ViewType]}</span>
              </Button>;
        })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 landscape:gap-1">
          {isAdmin && <div className="flex items-center justify-between sm:justify-start space-x-2 landscape:space-x-1 sm:mr-4 px-3 landscape:px-2 py-1 landscape:py-0.5 bg-muted rounded-lg">
              <div className="flex items-center space-x-2 landscape:space-x-1">
                <Eye size={16} className="text-muted-foreground landscape:w-3 landscape:h-3" />
                <span className="text-sm landscape:text-xs">Ver todos</span>
              </div>
              <Switch id="view-all-cards" checked={state.viewAllCardsAsAdmin} onCheckedChange={actions.setViewAllCardsAsAdmin} className="landscape:scale-75" />
            </div>}
          
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 landscape:left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground landscape:w-3 landscape:h-3" />
            <Input placeholder="Buscar cartões..." value={state.filters.search} onChange={e => handleSearchChange(e.target.value)} className="w-full sm:w-64 pl-9 landscape:pl-7 h-10 landscape:h-7 text-sm landscape:text-xs" />
          </div>
          
          <div className="flex items-center gap-2 landscape:gap-1 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative flex-1 sm:flex-initial h-9 landscape:h-7 px-3 landscape:px-2">
                  <Filter size={16} className="sm:mr-1 landscape:w-3 landscape:h-3" />
                  <span className="hidden sm:inline landscape:hidden lg:inline text-sm landscape:text-xs">Filtros</span>
                  {activeFiltersCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 landscape:h-4 w-5 landscape:w-4 rounded-full p-0 text-xs landscape:text-[10px]">
                      {activeFiltersCount}
                    </Badge>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="bottom" className="p-0 w-80">
                <ProjectsFilters />
              </PopoverContent>
            </Popover>

            {isAdmin && <>
                <Button variant="outline" size="sm" onClick={() => setShowAutomation(true)} title="Automação" className="flex-1 sm:flex-initial h-9 landscape:h-7 px-3 landscape:px-2">
                  <Zap size={16} className="sm:mr-1 landscape:w-3 landscape:h-3" />
                  <span className="hidden sm:inline landscape:hidden lg:inline text-sm landscape:text-xs">Automação</span>
                </Button>

                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="flex-1 sm:flex-initial h-9 landscape:h-7 px-3 landscape:px-2">
                  <Settings size={16} className="sm:mr-1 landscape:w-3 landscape:h-3" />
                  <span className="hidden sm:inline landscape:hidden lg:inline text-sm landscape:text-xs">Config</span>
                </Button>
              </>}
          </div>
        </div>
      </div>

      <AutomationDialog isOpen={showAutomation} onClose={() => setShowAutomation(false)} />

      <ProjectsSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>;
};