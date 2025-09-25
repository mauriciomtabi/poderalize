import { useProjects } from "@/contexts/ProjectsContext";
import { ProjectsFilters } from "./ProjectsFilters";
import { KanbanView } from "./views/KanbanView";
import { TableView } from "./views/TableView";
import { CalendarView } from "./views/CalendarView";
import { DashboardView } from "./views/DashboardView";
import { ArchivedView } from "./views/ArchivedView";

export const ProjectsContent = ({ showFilters }: { showFilters: boolean }) => {
  const { state } = useProjects();

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