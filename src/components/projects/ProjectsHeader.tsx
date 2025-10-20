import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LayoutGrid, Table, Calendar, BarChart3, Search, Filter, Plus, Settings, Users, Star, Zap, Eye, Clock, CheckCircle2, AlertCircle } from "lucide-react";
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

  // Calculate metrics
  const metrics = useMemo(() => {
    const allCards = state.currentBoard?.lists.flatMap(list => list.cards) || [];
    const totalCards = allCards.length;
    const inProgress = allCards.filter(card => !card.archived && card.status !== 'done').length;
    const completed = allCards.filter(card => card.status === 'done').length;
    const overdue = allCards.filter(card => {
      if (card.archived || card.status === 'done' || !card.dueDate) return false;
      return new Date(card.dueDate) < new Date();
    }).length;

    return [
      {
        title: "Total de Cartões",
        value: totalCards,
        icon: LayoutGrid,
        bgColor: "bg-primary/10",
        color: "text-primary"
      },
      {
        title: "Em Andamento",
        value: inProgress,
        icon: Clock,
        bgColor: "bg-orange-500/10",
        color: "text-orange-600 dark:text-orange-400"
      },
      {
        title: "Concluídos",
        value: completed,
        icon: CheckCircle2,
        bgColor: "bg-green-500/10",
        color: "text-green-600 dark:text-green-400"
      },
      {
        title: "Vencidos",
        value: overdue,
        icon: AlertCircle,
        bgColor: "bg-destructive/10",
        color: "text-destructive"
      }
    ];
  }, [state.currentBoard]);

  return <div className="sticky top-0 z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 space-y-4 pb-3">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-3 pt-3 sm:px-4 sm:pt-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-3 sm:p-4 hover:shadow-md transition-shadow border-muted">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
                  {metric.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${metric.bgColor} flex-shrink-0 ml-2`}>
                <metric.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Header Controls */}
      <div className="flex flex-row items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
        
        {/* 1. View Selector */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
          {Object.entries(viewIcons).map(([view, Icon]) => {
          // Only admins can see dashboard view
          if (view === 'dashboard' && !isAdmin) {
            return null;
          }
          return <Button key={view} variant={state.currentView === view ? "default" : "ghost"} size="sm" onClick={() => handleViewChange(view as ViewType)} className={cn("h-8 px-2 text-sm", state.currentView === view && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm")}>
                <Icon size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">{viewLabels[view as ViewType]}</span>
              </Button>;
        })}
          </div>
        </div>

        {/* 2. Ver todos (Admin only) */}
        {isAdmin && <div className="flex-shrink-0">
            <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-muted-foreground" />
                <span className="text-xs sm:text-sm">Ver todos</span>
              </div>
              <Switch id="view-all-cards" checked={state.viewAllCardsAsAdmin} onCheckedChange={actions.setViewAllCardsAsAdmin} />
            </div>
          </div>}

        {/* 3. Campo de Busca */}
        <div className="flex-1 min-w-0 max-w-xs">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar cartões..." value={state.filters.search} onChange={e => handleSearchChange(e.target.value)} className="w-full pl-8 h-8 text-sm" />
          </div>
        </div>

        {/* 4. Botões de Ação */}
        <div className="flex gap-1 flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative h-8 px-2">
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
              <Button variant="outline" size="sm" onClick={() => setShowAutomation(true)} title="Automação" className="h-8 px-2">
                <Zap size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Automação</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="h-8 px-2">
                <Settings size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">Config</span>
              </Button>
            </>}
        </div>
      </div>

      <AutomationDialog isOpen={showAutomation} onClose={() => setShowAutomation(false)} />

      <ProjectsSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>;
};