import { useProjects } from "@/contexts/ProjectsContext";
import { ProjectsFilters } from "./ProjectsFilters";
import { KanbanView } from "./views/KanbanView";
import { TableView } from "./views/TableView";
import { CalendarView } from "./views/CalendarView";
import { DashboardView } from "./views/DashboardView";
import { TimelineView } from "./views/TimelineView";
import { MapView } from "./views/MapView";
import { cn } from "@/lib/utils";

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
      case 'timeline':
        return <TimelineView />;
      case 'map':
        return <MapView />;
      default:
        return <KanbanView />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Filters Sidebar */}
      <div className={cn(
        "border-r border-border bg-card transition-all duration-300",
        showFilters ? "w-80" : "w-0 overflow-hidden"
      )}>
        {showFilters && (
          <div className="p-4">
            <ProjectsFilters />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* View Content */}
        <div className="h-full">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};