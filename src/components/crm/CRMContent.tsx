import { useCRM } from "@/contexts/CRMContext";
import { FunnelKanban } from "./FunnelKanban";
import { LeadDetailModal } from "./LeadDetailModal";
import { Card } from "@/components/ui/card";
import { AlertCircle, LayoutDashboard, LayoutTemplate } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMDashboard } from "./CRMDashboard";

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
      <Tabs defaultValue="kanban" className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutTemplate size={16} /> Kanban
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard size={16} /> Dashboard
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden h-full">
          <FunnelKanban funnel={currentFunnel} />
        </TabsContent>

        <TabsContent value="dashboard" className="flex-1 overflow-y-auto mt-0 data-[state=inactive]:hidden h-full">
          <CRMDashboard />
        </TabsContent>
      </Tabs>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} />
      )}
    </>
  );
};
