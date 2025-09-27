import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LeadAdvanced, NegotiationTemperature } from "@/types/crm";
import { useCRM } from "@/contexts/CRMContext";
import { useLeadInteractions } from "@/hooks/useLeadInteractions";
import { useFollowUps } from "@/hooks/useFollowUps";
import { TemperatureSelector } from "./TemperatureSelector";
import { InteractionForm } from "./InteractionForm";
import { InteractionHistory } from "./InteractionHistory";
import { ScheduleFollowUpDialog } from "./ScheduleFollowUpDialog";
import { Building2, Mail, Phone, Globe, DollarSign, Calendar, Target, TrendingUp, User, Clock, Save, Lightbulb, AlertTriangle, Star, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  const [isContactDetailsOpen, setIsContactDetailsOpen] = useState(false);
  const [isInteractionHistoryOpen, setIsInteractionHistoryOpen] = useState(true);
  const [negotiationData, setNegotiationData] = useState({
    valor: lead.valor,
    produtoInteresse: lead.produtoInteresse,
    dorAtual: lead.necessidadeOculta?.[0] || '',
    oportunidadeIdentificada: lead.observacoes || '',
    temperaturaNegociacao: lead.temperaturaNegociacao || 'mediana' as NegotiationTemperature
  });

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
  const getTravaEmocionalLabel = (trava: string) => {
    const labels = {
      'inseguranca_financeira': 'Insegurança Financeira',
      'medo_dar_errado': 'Medo de dar errado',
      'falta_apoio': 'Falta de apoio',
      'falta_tempo': 'Falta de tempo',
      'desconfianca': 'Desconfiança'
    };
    return labels[trava as keyof typeof labels] || trava;
  };
  const getTipoDiscursoLabel = (tipo: string) => {
    const labels = {
      'tecnico': 'Técnico',
      'emocional': 'Emocional',
      'inspirador': 'Inspirador'
    };
    return labels[tipo as keyof typeof labels] || tipo;
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
  return <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg font-medium">
                {getInitials(lead.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-foreground mb-1">
                {lead.nome}
              </DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Building2 className="h-4 w-4" />
                <span>{lead.empresa}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentStage?.title || lead.etapaFunil}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content with better layout */}
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Negotiation Info */}
            <div className="space-y-6">
              {/* Informações da Negociação */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Status da Negociação</h4>
                </div>
                
                <div className="space-y-4">
                  {/* Temperature and Value in same row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <TemperatureSelector value={negotiationData.temperaturaNegociacao} onChange={temp => handleNegotiationUpdate('temperaturaNegociacao', temp)} />
                    </div>
                    <div>
                      <Label htmlFor="valor" className="text-sm font-medium">Valor da Negociação</Label>
                      <div className="mt-1 relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="valor" type="number" placeholder="0,00" value={negotiationData.valor} onChange={e => handleNegotiationUpdate('valor', parseFloat(e.target.value) || 0)} className="pl-10" />
                      </div>
                    </div>
                  </div>

                  {/* Produto de Interesse */}
                  <div>
                    <Label htmlFor="produto" className="text-sm font-medium">Produto de Interesse</Label>
                    <Input id="produto" placeholder="Digite o produto de interesse..." value={negotiationData.produtoInteresse} onChange={e => handleNegotiationUpdate('produtoInteresse', e.target.value)} className="mt-1" />
                  </div>

                  {/* Dor Atual */}
                  <div>
                    <Label htmlFor="dor" className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Dor Atual do Cliente
                    </Label>
                    <Textarea id="dor" placeholder="Descreva a principal dor ou problema do cliente..." value={negotiationData.dorAtual} onChange={e => handleNegotiationUpdate('dorAtual', e.target.value)} className="mt-1" rows={2} />
                  </div>

                  {/* Oportunidade Identificada */}
                  <div>
                    <Label htmlFor="oportunidade" className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Oportunidade Identificada
                    </Label>
                    <Textarea id="oportunidade" placeholder="Descreva a oportunidade identificada..." value={negotiationData.oportunidadeIdentificada} onChange={e => handleNegotiationUpdate('oportunidadeIdentificada', e.target.value)} className="mt-1" rows={2} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleSaveNegotiation} size="sm" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                    <InteractionForm leadId={lead.id} leadName={lead.nome} onSuccess={handleRefreshData} />
                    <ScheduleFollowUpDialog leadId={lead.id} leadName={lead.nome} onSuccess={handleRefreshData} />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Informações de Contato
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{lead.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{lead.fonte}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - History and Details */}
            <div className="space-y-6">
              {/* Interaction History */}
              <Collapsible open={isInteractionHistoryOpen} onOpenChange={setIsInteractionHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Histórico de Interações</span>
                      <Badge variant="secondary" className="ml-2">
                        {interactions.length}
                      </Badge>
                    </div>
                    {isInteractionHistoryOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <div className="max-h-60 overflow-y-auto">
                    <InteractionHistory interactions={interactions} />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Follow-ups Scheduled */}
              {followUps.length > 0 && <div className="bg-muted/50 p-4 rounded-lg">
                  <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Follow-ups Agendados
                    <Badge variant="secondary">{followUps.length}</Badge>
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {followUps.slice(0, 3).map(followUp => <div key={followUp.id} className="bg-background/50 p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {followUp.tipo}
                          </Badge>
                          <Badge variant={followUp.status === 'concluido' ? 'default' : 'secondary'} className="text-xs">
                            {followUp.status}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">
                            {format(new Date(followUp.dataAgendada), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR
                      })}
                          </p>
                          {followUp.observacoes && <p className="text-muted-foreground mt-1 text-xs">{followUp.observacoes}</p>}
                        </div>
                      </div>)}
                  </div>
                </div>}

              {/* Additional Details - Collapsible */}
              <Collapsible open={isContactDetailsOpen} onOpenChange={setIsContactDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      
                    </div>
                    {isContactDetailsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4 mt-4">
                  {/* Lead Scoring */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Lead Scoring
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pontuação Geral</span>
                        <span className="font-medium">{lead.pontuacao}/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{
                        width: `${lead.pontuacao}%`
                      }} />
                      </div>
                    </div>
                  </div>

                  {/* Behavioral Analysis */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trava Emocional:</span>
                        <Badge variant="outline" className="ml-2">
                          {getTravaEmocionalLabel(lead.travaEmocional)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo de Discurso:</span>
                        <Badge variant="outline" className="ml-2">
                          {getTipoDiscursoLabel(lead.tipoDiscurso)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timeline
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data de Contato:</span>
                        <span>{format(new Date(lead.dataContato), "dd/MM/yyyy", {
                          locale: ptBR
                        })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Última Interação:</span>
                        <span>{format(new Date(lead.ultimaInteracao), "dd/MM/yyyy", {
                          locale: ptBR
                        })}</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>;
};