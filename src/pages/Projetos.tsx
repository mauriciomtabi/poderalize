import { useState } from "react";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProjectsHeader } from "@/components/projects/ProjectsHeader";
import { ProjectsContent } from "@/components/projects/ProjectsContent";

const Projetos = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <ProjectsProvider>
      <div className="h-full flex flex-col animate-fade-in">
        <ErrorBoundary>
          <ProjectsHeader onToggleFilters={() => setShowFilters(!showFilters)} />
          <div className="flex-1 min-h-0 min-w-0">
            <ProjectsContent showFilters={showFilters} />
          </div>
        </ErrorBoundary>
      </div>
    </ProjectsProvider>
  );
};

export default Projetos;