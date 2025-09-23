import { Layout } from "@/components/layout/Layout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { KanbanProvider } from "@/contexts/KanbanContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Projetos = () => {
  return (
    <Layout title="Gestão de Projetos">
      <div className="h-full animate-fade-in">
        <ErrorBoundary>
          <KanbanProvider>
            <KanbanBoard />
          </KanbanProvider>
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default Projetos;