import { useCRM } from "@/contexts/CRMContext";
import { LeadDetailModal } from "./LeadDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Users } from "lucide-react";
import { LeadCard } from "./LeadCard";
import { useState } from "react";
import { AddLeadToFunnelDialog } from "./AddLeadToFunnelDialog";

export const CRMContent = () => {
  const { currentFunnel, selectedLead, filters } = useCRM();
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

  // Collect all leads from all stages
  const allLeads = currentFunnel.stages.flatMap(stage => stage.leads);

  // Apply search filter
  const filteredLeads = allLeads.filter(lead => {
    const searchTerm = filters.search.toLowerCase();
    if (!searchTerm) return true;
    
    return lead.nome.toLowerCase().includes(searchTerm) ||
           lead.empresa.toLowerCase().includes(searchTerm) ||
           lead.email.toLowerCase().includes(searchTerm);
  });

  return (
    <>
      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {allLeads.length === 0 ? 'Nenhum lead ainda' : 'Nenhum lead encontrado'}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {allLeads.length === 0 
                ? 'Adicione leads ao funil para começar a gerenciar suas oportunidades.'
                : 'Tente ajustar os termos de busca para encontrar leads.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredLeads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onLeadUpdate={() => window.location.reload()} 
            />
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} />
      )}

      {/* Add Lead Dialog */}
      <AddLeadToFunnelDialog
        open={addLeadDialog}
        onOpenChange={setAddLeadDialog}
        stageId={currentFunnel.stages[0]?.id || ""}
      />
    </>
  );
};