import { useCRM } from "@/contexts/CRMContext";
import { LeadDetailModal } from "./LeadDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Users, Plus } from "lucide-react";
import { LeadCard } from "./LeadCard";
import { AddLeadToFunnelDialog } from "./AddLeadToFunnelDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const CRMContent = () => {
  const { currentFunnel, selectedLead, leads: allLeads } = useCRM();
  const [addLeadDialog, setAddLeadDialog] = useState(false);

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

  // Get leads for current funnel
  const funnelLeads = allLeads.filter(lead => lead.funnelId === currentFunnel.id);

  return (
    <>
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button onClick={() => setAddLeadDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>

        {/* Leads Grid */}
        {funnelLeads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum lead ainda</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Adicione leads ao seu funil para começar a gerenciar suas oportunidades.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {funnelLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && <LeadDetailModal lead={selectedLead} />}

      {/* Add Lead Dialog */}
      <AddLeadToFunnelDialog
        open={addLeadDialog}
        onOpenChange={setAddLeadDialog}
        stageId={currentFunnel.stages[0]?.id || ""}
      />
    </>
  );
};