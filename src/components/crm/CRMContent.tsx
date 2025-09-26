import { useCRM } from "@/contexts/CRMContext";
import { FunnelKanban } from "./FunnelKanban";
import { LeadDetailPanel } from "./LeadDetailPanel";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const CRMContent = () => {
  const { state } = useCRM();

  if (!state.currentFunnel) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum funil selecionado</h3>
          <p className="text-muted-foreground">
            Selecione um funil existente ou crie um novo para começar.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6">
      {/* Main Kanban View */}
      <div className="flex-1 min-w-0">
        <FunnelKanban funnel={state.currentFunnel} />
      </div>

      {/* Lead Detail Panel */}
      {state.selectedLead && (
        <div className="w-96 flex-shrink-0">
          <LeadDetailPanel lead={state.selectedLead} />
        </div>
      )}
    </div>
  );
};