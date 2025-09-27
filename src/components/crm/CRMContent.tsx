import { useCRM } from "@/contexts/CRMContext";
import { FunnelKanban } from "./FunnelKanban";
import { LeadDetailModal } from "./LeadDetailModal";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const CRMContent = () => {
  const { currentFunnel, selectedLead } = useCRM();

  if (!currentFunnel) {
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
    <>
      {/* Main Kanban View - Full Width */}
      <div className="h-full">
        <FunnelKanban funnel={currentFunnel} />
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} />
      )}
    </>
  );
};