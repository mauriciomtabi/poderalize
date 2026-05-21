import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadAdvanced, NegotiationTemperature } from "@/types/crm";
import { useCRM } from "@/contexts/CRMContext";
import { useLeadInteractions } from "@/hooks/useLeadInteractions";
import { useFollowUps } from "@/hooks/useFollowUps";
import { TemperatureSelector } from "./TemperatureSelector";
import { InteractionForm } from "./InteractionForm";
import { InteractionHistory } from "./InteractionHistory";
import { ScheduleFollowUpDialog } from "./ScheduleFollowUpDialog";
import { Building2, Mail, Phone, Globe, DollarSign, Calendar, TrendingUp, Clock, Save, Lightbulb, AlertTriangle, Eye, Check, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LeadActionDialog } from "./LeadActionDialog";
import { useLeads } from "@/hooks/useLeads";

interface LeadDetailModalProps {
  lead: LeadAdvanced;
}

export const LeadDetailModal = ({
  lead
}: LeadDetailModalProps) => {
  const {
    selectedLead,
    setSelectedLead,
    currentFunnel,
    updateLead
  } = useCRM();
  
  const [negotiationData, setNegotiationData] = useState({
    valor: lead.valor,
    produtoInteresse: lead.produtoInteresse,
    dorAtual: lead.necessidadeOculta?.[0] || '',
    oportunidadeIdentificada: lead.observacoes || '',
    temperaturaNegociacao: lead.temperaturaNegociacao || 'mediana' as NegotiationTemperature
  });
  
  const [selectedFollowUp, setSelectedFollowUp] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{ isOpen: boolean; action: 'close' | 'lose' | null }>({
    isOpen: false,
    action: null
  });

  const { markLeadAsClosed, markLeadAsLost } = useLeads();

  // Hooks for interactions and follow-ups
  const {
    interactions,
    loadInteractions,
    refreshInteractions
  } = useLeadInteractions();
  const {
    followUps,
    loadFollowUps,
    refreshFollowUps
  } = useFollowUps();

  // Load data when lead changes
  useEffect(() => {
    if (lead.id) {
      loadInteractions(lead.id);
      loadFollowUps(lead.id);
    }
  }, [lead.id, loadInteractions, loadFollowUps]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const currentStage = currentFunnel?.stages.find(stage => stage.leads.some(l => l.id === lead.id));

  const handleNegotiationUpdate = (field: string, value: string | number) => {
    setNegotiationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveNegotiation = async () => {
    try {
      await updateLead(lead.id, {
        valor: negotiationData.valor,
        produtoInteresse: negotiationData.produtoInteresse,
        necessidadeOculta: [negotiationData.dorAtual],
        observacoes: negotiationData.oportunidadeIdentificada,
        temperaturaNegociacao: negotiationData.temperaturaNegociacao
      });
      toast.success("Dados da negociação salvos com sucesso!");
    } catch (error) {
      console.error('Error saving negotiation data:', error);
      toast.error("Erro ao salvar dados da negociação");
    }
  };

  const handleRefreshData = () => {
    refreshInteractions();
    refreshFollowUps();
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    try {
      const { error } = await supabase
        .from('follow_ups')
        .update({ status: 'concluido' })
        .eq('id', followUpId);

      if (error) {
        throw error;
      }

      toast.success("Follow-up marcado como concluído!");
      refreshFollowUps();
    } catch (error) {
      console.error('Error completing follow-up:', error);
      toast.error("Erro ao marcar follow-up como concluído");
    }
  };

  const handleLeadAction = async (motivo?: string) => {
    if (actionDialog.action === 'close') {
      const success = await markLeadAsClosed(lead.id);
      if (success) {
        setSelectedLead(null);
      }
    } else if (actionDialog.action === 'lose' && motivo) {
      const success = await markLeadAsLost(lead.id, motivo);
      if (success) {
        setSelectedLead(null);
      }
    }
  };

  return (
    <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
      <DialogContent className="max-w-5xl h-[82vh] p-0 flex flex-col overflow-hidden">
        {/* Header with Action Buttons */}
        <DialogHeader className="p-6 pb-4 flex-shrink-0 border-b border-border/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border border-border bg-muted">
                <AvatarFallback className="text-sm font-semibold bg-secondary/5 text-secondary">
                  {getInitials(lead.nome)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg font-bold text-secondary truncate max-w-[300px]">
                  {lead.nome}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{lead.empresa}</span>
                  </div>
                  <span className="text-muted-foreground/30">•</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    {currentStage?.title || lead.etapaFunil}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                onClick={() => setActionDialog({ isOpen: true, action: 'close' })} 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 h-9"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Fechar Lead
              </Button>
              <Button 
                onClick={() => setActionDialog({ isOpen: true, action: 'lose' })} 
                size="sm"
                variant="destructive"
                className="font-medium text-xs px-3 h-9"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Perdido
              </Button>
              <div className="h-5 w-px bg-border/60 mx-1" />
              <Button onClick={handleSaveNegotiation} size="sm" variant="outline" className="h-9 text-xs">
                <Save className="h-4 w-4 mr-1.5" />
                Salvar
              </Button>
              <InteractionForm leadId={lead.id} leadName={lead.nome} onSuccess={handleRefreshData} />
              <ScheduleFollowUpDialog leadId={lead.id} leadName={lead.nome} onSuccess={handleRefreshData} />
            </div>
          </div>
        </DialogHeader>

        {/* Content - Two scrollable columns */}
        <div className="flex-1 min-h-0 px-6 py-5 grid grid-cols-2 gap-6 overflow-hidden bg-background">
          {/* Left Column - Form & General Info */}
          <div className="overflow-y-auto pr-2 space-y-4 max-h-full">
            {/* Negotiation Status */}
            <div className="bg-primary/[0.02] border border-border/80 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
                <h4 className="font-bold text-sm text-secondary">Negociação</h4>
              </div>
              
              {/* Temperature and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <TemperatureSelector value={negotiationData.temperaturaNegociacao} onChange={temp => handleNegotiationUpdate('temperaturaNegociacao', temp)} />
                </div>
                <div>
                  <Label htmlFor="valor" className="text-xs font-semibold text-muted-foreground">Valor</Label>
                  <div className="mt-1.5 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input id="valor" type="number" placeholder="0,00" value={negotiationData.valor} onChange={e => handleNegotiationUpdate('valor', parseFloat(e.target.value) || 0)} className="pl-9 h-9 text-sm" />
                  </div>
                </div>
              </div>

              {/* Produto de Interesse */}
              <div>
                <Label htmlFor="produto" className="text-xs font-semibold text-muted-foreground">Produto de Interesse</Label>
                <Input id="produto" placeholder="Digite o produto de interesse..." value={negotiationData.produtoInteresse} onChange={e => handleNegotiationUpdate('produtoInteresse', e.target.value)} className="mt-1.5 h-9 text-sm" />
              </div>

              {/* Dor Atual & Oportunidade side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dor" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Dor Atual do Cliente
                  </Label>
                  <Textarea id="dor" placeholder="Descreva a principal dor..." value={negotiationData.dorAtual} onChange={e => handleNegotiationUpdate('dorAtual', e.target.value)} className="mt-1.5 min-h-[80px] text-xs leading-relaxed resize-none" rows={3} />
                </div>

                <div>
                  <Label htmlFor="oportunidade" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-yellow-500" />
                    Oportunidade Identificada
                  </Label>
                  <Textarea id="oportunidade" placeholder="Descreva a oportunidade..." value={negotiationData.oportunidadeIdentificada} onChange={e => handleNegotiationUpdate('oportunidadeIdentificada', e.target.value)} className="mt-1.5 min-h-[80px] text-xs leading-relaxed resize-none" rows={3} />
                </div>
              </div>
            </div>

            {/* General Info - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Contact Information */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                <h5 className="font-semibold text-xs text-foreground mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Contato
                </h5>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
                    <span className="truncate" title={lead.email}>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
                    <span>{lead.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
                    <span>{lead.fonte}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                <h5 className="font-semibold text-xs text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Linha do Tempo
                </h5>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">Cadastrado em:</span>
                    <span className="font-medium text-secondary">{format(new Date(lead.dataContato), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-muted-foreground">Último contato:</span>
                    <span className="font-medium text-secondary">{format(new Date(lead.ultimaInteracao), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs for History & Follow-ups */}
          <div className="flex flex-col h-full overflow-hidden border border-border/60 rounded-xl p-4 bg-muted/[0.08]">
            <Tabs defaultValue="interactions" className="flex-1 flex flex-col min-h-0">
              <TabsList className="bg-muted w-full justify-start mb-4 h-9 p-1">
                <TabsTrigger value="interactions" className="flex items-center gap-1.5 text-xs h-7">
                  <Clock size={14} /> Interações ({interactions.length})
                </TabsTrigger>
                <TabsTrigger value="followups" className="flex items-center gap-1.5 text-xs h-7">
                  <Calendar size={14} /> Follow-ups ({followUps.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="interactions" className="flex-1 min-h-0 overflow-y-auto pr-1">
                <InteractionHistory interactions={interactions} hideCard />
              </TabsContent>
              
              <TabsContent value="followups" className="flex-1 min-h-0 overflow-y-auto pr-1">
                {followUps.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground bg-background/30 rounded-xl border border-dashed border-border p-6">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40 text-primary" />
                    <p className="font-semibold text-sm">Nenhum follow-up agendado</p>
                    <p className="text-xs text-muted-foreground mt-1">Use o botão "Agendar Follow-up" no topo para agendar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followUps.map(followUp => {
                      const isOverdue = new Date(followUp.dataAgendada) < new Date() && followUp.status !== 'concluido';
                      return (
                        <div key={followUp.id} className={`bg-background/80 p-3.5 rounded-xl border border-border/60 transition-colors hover:bg-background/95 ${isOverdue ? 'border-destructive/40 bg-destructive/[0.02]' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] px-1.5 h-5 bg-background font-semibold">
                                {followUp.tipo}
                              </Badge>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 h-5 font-semibold">
                                  Atrasado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge variant={followUp.status === 'concluido' ? 'default' : 'secondary'} className="text-[10px] px-1.5 h-5 font-semibold">
                                {followUp.status === 'concluido' ? 'Concluído' : 'Pendente'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedFollowUp(followUp)}
                                className="h-6 w-6 p-0 hover:bg-muted"
                                title="Visualizar detalhes"
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                              </Button>
                              {followUp.status !== 'concluido' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCompleteFollowUp(followUp.id)}
                                  className="h-6 w-6 p-0 hover:bg-muted"
                                  title="Marcar como concluído"
                                >
                                  <Check className="h-3.5 w-3.5 text-green-600 hover:text-green-700" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="text-sm cursor-pointer" onClick={() => setSelectedFollowUp(followUp)}>
                            <p className={`font-semibold text-xs ${isOverdue ? 'text-destructive' : 'text-secondary'}`}>
                              {format(new Date(followUp.dataAgendada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                            {followUp.observacoes && (
                              <p className="text-muted-foreground mt-1 text-[11px] leading-normal line-clamp-2">{followUp.observacoes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* Lead Action Dialog */}
      <LeadActionDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, action: null })}
        onConfirm={handleLeadAction}
        action={actionDialog.action!}
        leadName={lead.nome}
      />
      
      {/* Follow-up Detail Modal */}
      {selectedFollowUp && (
        <Dialog open={!!selectedFollowUp} onOpenChange={() => setSelectedFollowUp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes do Follow-up</DialogTitle>
              <DialogDescription>
                Informações completas do follow-up agendado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                <p className="text-sm">{selectedFollowUp.tipo}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Data e Hora</Label>
                <p className="text-sm font-medium">
                  {format(new Date(selectedFollowUp.dataAgendada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant={selectedFollowUp.status === 'concluido' ? 'default' : 'secondary'} className="text-xs">
                  {selectedFollowUp.status === 'concluido' ? 'Concluído' : 'Pendente'}
                </Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Lead</Label>
                <p className="text-sm">{selectedFollowUp.leadNome}</p>
              </div>
              
              {selectedFollowUp.observacoes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                  <p className="text-sm">{selectedFollowUp.observacoes}</p>
                </div>
              )}
              
              {selectedFollowUp.templateMensagem && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Template de Mensagem</Label>
                  <p className="text-sm bg-muted/50 p-2 rounded">{selectedFollowUp.templateMensagem}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedFollowUp.status !== 'concluido' && (
                  <Button
                    onClick={() => {
                      handleCompleteFollowUp(selectedFollowUp.id);
                      setSelectedFollowUp(null);
                    }}
                    size="sm"
                  >
                    Marcar como Concluído
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedFollowUp(null)}
                  size="sm"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};
