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
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 items-stretch lg:items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 lg:pb-0">
          <div className="grid grid-cols-2 md:flex items-center space-x-0 md:space-x-1 gap-1 md:gap-0 bg-muted rounded-lg p-1">
          {Object.entries(viewIcons).map(([view, Icon]) => {
          // Only admins can see dashboard view
          if (view === 'dashboard' && !isAdmin) {
            return null;
          }
          return <Button key={view} variant={state.currentView === view ? "default" : "ghost"} size="sm" onClick={() => handleViewChange(view as ViewType)} className={cn("h-8 px-2 sm:px-3 text-muted-foreground hover:text-foreground", state.currentView === view && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm")}>
                <Icon size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">{viewLabels[view as ViewType]}</span>
              </Button>;
        })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {isAdmin && <div className="flex items-center justify-between sm:justify-start space-x-2 sm:mr-4 px-3 py-1 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye size={16} className="text-muted-foreground" />
                <span className="text-sm">Ver todos</span>
              </div>
              <Switch id="view-all-cards" checked={state.viewAllCardsAsAdmin} onCheckedChange={actions.setViewAllCardsAsAdmin} />
            </div>}
          
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar cartões..." value={state.filters.search} onChange={e => handleSearchChange(e.target.value)} className="w-full sm:w-64 pl-9" />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative flex-1 sm:flex-initial">
                  <Filter size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeFiltersCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="bottom" className="p-0 w-80">
                <ProjectsFilters />
              </PopoverContent>
            </Popover>

            {isAdmin && <>
                <Button variant="outline" size="sm" onClick={() => setShowAutomation(true)} title="Automação" className="flex-1 sm:flex-initial">
                  <Zap size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Automação</span>
                </Button>

                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="flex-1 sm:flex-initial">
                  <Settings size={16} className="sm:mr-1" />
                  <span className="hidden sm:inline">Config</span>
                </Button>
              </>}
          </div>
        </div>
      </div>

      <AutomationDialog isOpen={showAutomation} onClose={() => setShowAutomation(false)} />

      <ProjectsSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>;
};