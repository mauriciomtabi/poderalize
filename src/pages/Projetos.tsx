import { Layout } from "@/components/layout/Layout";
import { ProjectsProvider } from "@/contexts/ProjectsContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProjectsHeader } from "@/components/projects/ProjectsHeader";
import { ProjectsContent } from "@/components/projects/ProjectsContent";

const Projetos = () => {
  return (
    <ProjectsProvider>
      <Layout title="Gestão de Projetos">
        <div className="h-full flex flex-col animate-fade-in">
          <ErrorBoundary>
            <ProjectsHeader />
            <div className="flex-1 overflow-hidden">
              <ProjectsContent />
            </div>
          </ErrorBoundary>
        </div>
      </Layout>
    </ProjectsProvider>
  );
};

export default Projetos;