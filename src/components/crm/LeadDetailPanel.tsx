import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LeadAdvanced } from "@/types/crm";
import { useCRM } from "@/contexts/CRMContext";
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  DollarSign, 
  Calendar,
  Target,
  TrendingUp,
  User,
  MessageCircle,
  Edit,
  Star,
  ChevronDown,
  ChevronRight,
  Save,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface LeadDetailPanelProps {
  lead: LeadAdvanced;
}

export const LeadDetailPanel = ({ lead }: LeadDetailPanelProps) => {
  const { setSelectedLead, currentFunnel } = useCRM();
  const [isContactDetailsOpen, setIsContactDetailsOpen] = useState(false);
  const [negotiationData, setNegotiationData] = useState({
    valor: lead.valor,
    produtoInteresse: lead.produtoInteresse,
    dorAtual: lead.necessidadeOculta?.[0] || '',
    oportunidadeIdentificada: lead.observacoes || ''
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quente': return 'bg-red-100 text-red-800 border-red-200';
      case 'morno': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'frio': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const currentStage = currentFunnel?.stages.find(stage => 
    stage.leads.some(l => l.id === lead.id)
  );

  const handleNegotiationUpdate = (field: string, value: string | number) => {
    setNegotiationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveNegotiation = () => {
    // Aqui você pode implementar a lógica para salvar as informações
    console.log('Salvando dados da negociação:', negotiationData);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm font-medium">
                {getInitials(lead.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{lead.nome}</h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{lead.empresa}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedLead(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge className={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {currentStage?.title || lead.etapaFunil}
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-6 pr-4">
            {/* Informações da Negociação - Destacadas */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Status da Negociação</h4>
              </div>
              
              <div className="space-y-4">
                {/* Status da Negociação */}
                <div>
                  <Label className="text-sm font-medium">Status Atual</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {currentStage?.title || 'Não definido'}
                    </Badge>
                  </div>
                </div>

                {/* Valor */}
                <div>
                  <Label htmlFor="valor" className="text-sm font-medium">Valor da Negociação</Label>
                  <div className="mt-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="valor"
                      type="number"
                      placeholder="0,00"
                      value={negotiationData.valor}
                      onChange={(e) => handleNegotiationUpdate('valor', parseFloat(e.target.value) || 0)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Produto de Interesse */}
                <div>
                  <Label htmlFor="produto" className="text-sm font-medium">Produto de Interesse</Label>
                  <Input
                    id="produto"
                    placeholder="Digite o produto de interesse..."
                    value={negotiationData.produtoInteresse}
                    onChange={(e) => handleNegotiationUpdate('produtoInteresse', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Dor Atual */}
                <div>
                  <Label htmlFor="dor" className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Dor Atual do Cliente
                  </Label>
                  <Textarea
                    id="dor"
                    placeholder="Descreva a principal dor ou problema do cliente..."
                    value={negotiationData.dorAtual}
                    onChange={(e) => handleNegotiationUpdate('dorAtual', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Oportunidade Identificada */}
                <div>
                  <Label htmlFor="oportunidade" className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Oportunidade Identificada
                  </Label>
                  <Textarea
                    id="oportunidade"
                    placeholder="Descreva a oportunidade identificada..."
                    value={negotiationData.oportunidadeIdentificada}
                    onChange={(e) => handleNegotiationUpdate('oportunidadeIdentificada', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveNegotiation} size="sm" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contatar
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detalhes do Cadastro - Recolhível */}
            <Collapsible open={isContactDetailsOpen} onOpenChange={setIsContactDetailsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Detalhes do Cadastro</span>
                  </div>
                  {isContactDetailsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-6 mt-4">
                {/* Contact Information */}
                <div>
                  <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Informações de Contato
                  </h5>
                  <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-lg">
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

                {/* Lead Scoring */}
                <div>
                  <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Lead Scoring
                  </h5>
                  <div className="space-y-3 bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pontuação Geral</span>
                      <span className="font-medium">{lead.pontuacao}/100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${lead.pontuacao}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Behavioral Analysis */}
                <div>
                  <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Análise Comportamental
                  </h5>
                  <div className="space-y-3 text-sm bg-muted/50 p-3 rounded-lg">
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

                {/* Hidden Needs */}
                <div>
                  <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Necessidades Ocultas
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {lead.necessidadeOculta?.map((necessidade, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {necessidade}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </h5>
                  <div className="space-y-2 text-sm bg-muted/50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data de Contato:</span>
                      <span>{format(new Date(lead.dataContato), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última Interação:</span>
                      <span>{format(new Date(lead.ultimaInteracao), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>

                {/* Responsible */}
                <div>
                  <h5 className="font-medium text-foreground mb-3">Responsável</h5>
                  <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(lead.vendedorNome)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{lead.vendedorNome}</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};