import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutGrid, 
  Table, 
  Calendar, 
  BarChart3, 
  Clock, 
  Map,
  Search,
  Filter,
  Plus,
  Settings,
  Users,
  Star
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ViewType } from "@/types/projects";
import { cn } from "@/lib/utils";

const viewIcons = {
  kanban: LayoutGrid,
  table: Table,
  calendar: Calendar,
  dashboard: BarChart3,
  timeline: Clock,
  map: Map
};

const viewLabels = {
  kanban: 'Quadro',
  table: 'Tabela',
  calendar: 'Calendário',
  dashboard: 'Painel',
  timeline: 'Cronograma',
  map: 'Mapa'
};

export const ProjectsHeader = () => {
  const { state, actions } = useProjects();

  const handleViewChange = (view: ViewType) => {
    actions.setCurrentView(view);
  };

  const handleSearchChange = (value: string) => {
    actions.setFilters({ search: value });
  };

  const activeFiltersCount = Object.values(state.filters).filter(filter => {
    if (Array.isArray(filter)) return filter.length > 0;
    if (typeof filter === 'boolean') return filter;
    if (typeof filter === 'string') return filter.length > 0;
    return filter !== null;
  }).length;

  return (
    <div className="border-b border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-foreground">
              {state.currentBoard?.title || 'Projetos'}
            </h1>
            {state.currentBoard?.status === 'active' && (
              <Badge variant="secondary" className="text-xs">
                Ativo
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Star size={16} className="mr-1" />
              Favoritar
            </Button>
            <Button variant="ghost" size="sm">
              <Users size={16} className="mr-1" />
              {state.currentBoard?.members.length || 0}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus size={16} className="mr-1" />
            Convite
          </Button>
          <Button variant="ghost" size="sm">
            <Settings size={16} />
          </Button>
        </div>
      </div>

      {/* View Selector and Search */}
      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          {Object.entries(viewIcons).map(([view, Icon]) => (
            <Button
              key={view}
              variant={state.currentView === view ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleViewChange(view as ViewType)}
              className={cn(
                "h-8 px-3",
                state.currentView === view && "bg-background shadow-sm"
              )}
            >
              <Icon size={16} className="mr-1" />
              {viewLabels[view as ViewType]}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cartões..."
              value={state.filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="relative"
          >
            <Filter size={16} className="mr-1" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};