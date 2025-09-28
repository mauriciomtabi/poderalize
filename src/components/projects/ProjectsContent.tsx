import { useProjects } from "@/contexts/ProjectsContext";
import { ProjectsFilters } from "./ProjectsFilters";
import { KanbanView } from "./views/KanbanView";
import { TableView } from "./views/TableView";
import { CalendarView } from "./views/CalendarView";
import { DashboardView } from "./views/DashboardView";
import { ArchivedView } from "./views/ArchivedView";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const ProjectsContent = ({ showFilters }: { showFilters: boolean }) => {
  const { state } = useProjects();

  // Show loading state while creating initial project or loading data
  if (state.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Carregando projetos...</p>
            <p className="text-sm text-muted-foreground">
              {state.boards.length === 0 ? "Criando seu primeiro projeto" : "Carregando dados"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'kanban':
        return <KanbanView />;
      case 'table':
        return <TableView />;
      case 'calendar':
        return <CalendarView />;
      case 'dashboard':
        return <DashboardView />;
      default:
        return <KanbanView />;
    }
  };

  // Show archived view when archived filter is active
  if (state.filters.archived) {
    return (
      <div className="flex h-full min-w-0">
        {showFilters && (
          <div className="flex-shrink-0 border-r bg-muted/30 animate-slide-in-right">
            <ProjectsFilters />
          </div>
        )}
        <div className="flex-1 min-w-0 min-h-0">
          <ArchivedView />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0">
      {showFilters && (
        <div className="flex-shrink-0 border-r bg-muted/30 animate-slide-in-right">
          <ProjectsFilters />
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 min-w-0 min-h-0">
        {/* View Content */}
        <div className="h-full">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};