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
import { generateId } from "@/hooks/useUuid";

interface AddLeadToFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
}

// Mock data for existing leads (in a real app, this would come from a service)
const existingLeads: Lead[] = [
  {
    id: "lead-1",
    nome: "Carlos Mendes",
    empresa: "Tech Solutions",
    email: "carlos@techsolutions.com",
    telefone: "11 99999-1111",
    fonte: "Website",
    status: "novo",
    valor: 50000,
    probabilidade: 25,
    dataContato: "2024-09-20",
    observacoes: "Interessado em rebranding completo"
  },
  {
    id: "lead-2",
    nome: "Fernanda Lima",
    empresa: "StartupXYZ",
    email: "fernanda@startupxyz.com",
    telefone: "11 88888-2222",
    fonte: "LinkedIn",
    status: "qualificado",
    valor: 75000,
    probabilidade: 60,
    dataContato: "2024-09-18",
    observacoes: "Precisa de estratégia digital completa"
  },
  {
    id: "lead-3",
    nome: "Roberto Santos",
    empresa: "Indústria ABC",
    email: "roberto@industriaabc.com",
    telefone: "11 77777-3333",
    fonte: "Indicação",
    status: "proposta",
    valor: 120000,
    probabilidade: 80,
    dataContato: "2024-09-15",
    observacoes: "Aguardando aprovação da diretoria"
  }
];

export const AddLeadToFunnelDialog = ({ open, onOpenChange, stageId }: AddLeadToFunnelDialogProps) => {
  const { state, updateFunnel } = useCRM();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("existing");
  const newScrollRef = useRef<HTMLDivElement | null>(null);
  const existingScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        newScrollRef.current?.scrollTo({ top: 0 });
        existingScrollRef.current?.scrollTo({ top: 0 });
      }, 0);
    }
  }, [open]);

  const filteredExistingLeads = existingLeads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const convertLeadToAdvanced = (lead: Lead): LeadAdvanced => {
    return {
      ...lead,
      status: 'morno' as const,
      etapaFunil: stageId as any,
      travaEmocional: 'inseguranca_financeira',
      tipoDiscurso: 'tecnico',
      necessidadeOculta: ['Aumentar vendas'],
      produtoInteresse: 'Consultoria',
      ofertaAtrativa: 'Análise gratuita',
      gatilhosFuncionais: ['ROI garantido'],
      pontuacao: 70,
      ultimaInteracao: new Date().toISOString().split('T')[0],
      vendedorId: 'vendedor-1',
      vendedorNome: 'Vendedor Principal'
    };
  };

  const handleAddExistingLead = (lead: Lead) => {
    if (!state.currentFunnel) return;

    const advancedLead = convertLeadToAdvanced(lead);
    
    // Find the target stage and add the lead
    const updatedStages = state.currentFunnel.stages.map(stage => {
      if (stage.id === stageId) {
        return {
          ...stage,
          leads: [...stage.leads, advancedLead]
        };
      }
      return stage;
    });

    updateFunnel(state.currentFunnel.id, { stages: updatedStages });
    onOpenChange(false);
  };

  const handleCreateNewLead = (leadData: Partial<LeadAdvanced>) => {
    if (!state.currentFunnel) return;

    const newLead: LeadAdvanced = {
      id: generateId(),
      nome: leadData.nome || '',
      empresa: leadData.empresa || '',
      email: leadData.email || '',
      telefone: leadData.telefone || '',
      fonte: leadData.fonte || 'CRM',
      status: 'morno',
      etapaFunil: stageId as any,
      valor: leadData.valor || 0,
      probabilidade: 50,
      dataContato: new Date().toISOString().split('T')[0],
      observacoes: leadData.observacoes,
      travaEmocional: leadData.travaEmocional || 'inseguranca_financeira',
      tipoDiscurso: leadData.tipoDiscurso || 'tecnico',
      necessidadeOculta: leadData.necessidadeOculta || ['Aumentar vendas'],
      produtoInteresse: leadData.produtoInteresse || 'Consultoria',
      ofertaAtrativa: leadData.ofertaAtrativa || 'Análise gratuita',
      gatilhosFuncionais: leadData.gatilhosFuncionais || ['ROI garantido'],
      pontuacao: 70,
      ultimaInteracao: new Date().toISOString().split('T')[0],
      vendedorId: 'vendedor-1',
      vendedorNome: 'Vendedor Principal'
    };

    // Find the target stage and add the lead
    const updatedStages = state.currentFunnel.stages.map(stage => {
      if (stage.id === stageId) {
        return {
          ...stage,
          leads: [...stage.leads, newLead]
        };
      }
      return stage;
    });

    updateFunnel(state.currentFunnel.id, { stages: updatedStages });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Lead ao Funil</DialogTitle>
        </DialogHeader>

        <Tabs 
          value={selectedTab}
          onValueChange={(val) => {
            setSelectedTab(val);
            setTimeout(() => {
              if (val === 'new') newScrollRef.current?.scrollTo({ top: 0 });
              if (val === 'existing') existingScrollRef.current?.scrollTo({ top: 0 });
            }, 0);
          }} 
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

          <TabsContent value="existing" className="flex-1 min-h-0 flex flex-col mt-6 overflow-hidden">
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
                  {searchTerm ? "Nenhum lead encontrado" : "Nenhum lead disponível"}
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
                          R$ {lead.valor.toLocaleString()}
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

          <TabsContent value="new" className="flex-1 min-h-0 mt-6 overflow-hidden">
            <div ref={newScrollRef} className="h-full overflow-y-auto pr-2">
              <LeadForm onSubmit={handleCreateNewLead} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};