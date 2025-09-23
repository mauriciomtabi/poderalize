import { Layout } from "@/components/layout/Layout";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

const Projetos = () => {
  return (
    <Layout title="Gestão de Projetos">
      <div className="h-full animate-fade-in">
        <KanbanBoard />
      </div>
    </Layout>
  );
};

export default Projetos;