import { useProjects } from "@/contexts/ProjectsContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { ProjectsFilters } from "./ProjectsFilters";
import { KanbanView } from "./views/KanbanView";
import { TableView } from "./views/TableView";
import { CalendarView } from "./views/CalendarView";
import { DashboardView } from "./views/DashboardView";
import { ArchivedView } from "./views/ArchivedView";
import { AutomationWatcher } from "./AutomationWatcher";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export const ProjectsContent = ({ showFilters }: { showFilters: boolean }) => {
  const { state } = useProjects();
  const { isAdmin } = useAuthContext();

  // Note: We no longer unmount the view during loading to prevent modal closures
  // The LoadingOverlay in KanbanView will handle the loading state

  const renderCurrentView = () => {
    // Restrict dashboard view to admins only
    if (state.currentView === 'dashboard' && !isAdmin) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <Alert className="max-w-md">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Apenas administradores podem acessar esta visualização.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

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
      <AutomationWatcher />
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