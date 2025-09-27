import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, UserPlus } from "lucide-react";
import { useCRM } from "@/contexts/CRMContext";
import { LeadForm } from "./LeadForm";
import { Lead, LeadAdvanced } from "@/types/crm";

interface AddLeadToFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
}

export const AddLeadToFunnelDialog = ({ open, onOpenChange, stageId }: AddLeadToFunnelDialogProps) => {
  const { addLead, currentFunnel, funnelLeadHooks, leadHooks } = useCRM();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("existing");
  const [unassignedLeads, setUnassignedLeads] = useState<Lead[]>([]);
  const newScrollRef = useRef<HTMLDivElement | null>(null);
  const existingScrollRef = useRef<HTMLDivElement | null>(null);

  // Load unassigned leads when dialog opens
  useEffect(() => {
    if (open) {
      const loadUnassignedLeads = async () => {
        try {
          const leads = await funnelLeadHooks.getUnassignedLeads();
          setUnassignedLeads(leads);
        } catch (error) {
          console.error('Error loading unassigned leads:', error);
          setUnassignedLeads([]);
        }
      };
      loadUnassignedLeads();
    }
  }, [open, funnelLeadHooks]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        newScrollRef.current?.scrollTo({ top: 0 });
        existingScrollRef.current?.scrollTo({ top: 0 });
      });
    }
  }, [open]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (selectedTab === 'new') newScrollRef.current?.scrollTo({ top: 0 });
      if (selectedTab === 'existing') existingScrollRef.current?.scrollTo({ top: 0 });
    });
  }, [selectedTab]);

  const filteredExistingLeads = unassignedLeads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAddExistingLead = async (lead: Lead) => {
    if (!currentFunnel) return;

    try {
      const success = await funnelLeadHooks.addLeadToFunnel(lead.id, currentFunnel.id, stageId);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error adding existing lead to funnel:', error);
    }
  };

  const handleCreateNewLead = async (leadData: Partial<LeadAdvanced>) => {
    if (!currentFunnel) return;

    try {
      // Create the lead with funnel association
      const newLeadData = {
        ...leadData,
        etapaFunil: stageId // This will be used as funnel_stage_id in the addLead function
      } as Omit<LeadAdvanced, 'id'>;

      await addLead(newLeadData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating new lead:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Lead ao Funil</DialogTitle>
        </DialogHeader>

        <Tabs 
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="flex-1 min-h-0 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Leads Existentes
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo Lead
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="flex-1 min-h-0 flex flex-col mt-2 overflow-hidden">
            {/* Search */}
            <div className="relative mb-4 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar leads existentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Leads List */}
            <div ref={existingScrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredExistingLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Nenhum lead encontrado" : "Nenhum lead disponível fora de funis"}
                </div>
              ) : (
                filteredExistingLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleAddExistingLead(lead)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="text-sm">
                            {getInitials(lead.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{lead.nome}</h4>
                          <p className="text-sm text-muted-foreground">{lead.empresa}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          R$ {(lead.valor || 0).toLocaleString()}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {lead.fonte}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="flex-1 min-h-0 mt-2 overflow-hidden">
            <div ref={newScrollRef} className="overflow-y-auto pr-2">
              <LeadForm onSubmit={handleCreateNewLead} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};