import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Star
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadDetailPanelProps {
  lead: LeadAdvanced;
}

export const LeadDetailPanel = ({ lead }: LeadDetailPanelProps) => {
  const { setSelectedLead } = useCRM();

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

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
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
            {lead.etapaFunil}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contatar
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações de Contato
            </h4>
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

          <Separator />

          {/* Financial Information */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Informações Financeiras
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor do Deal:</span>
                <span className="font-medium text-green-600">
                  R$ {lead.valor.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Probabilidade:</span>
                <span className="font-medium">{lead.probabilidade}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lead Scoring */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Lead Scoring
            </h4>
            <div className="space-y-3">
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

          <Separator />

          {/* Behavioral Analysis */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análise Comportamental
            </h4>
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

          <Separator />

          {/* Hidden Needs */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Necessidades Ocultas
            </h4>
            <div className="flex flex-wrap gap-2">
              {lead.necessidadeOculta?.map((necessidade, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {necessidade}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Product Interest */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Interesse em Produto</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Produto:</span>
                <span className="ml-2 font-medium">{lead.produtoInteresse}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Oferta Atrativa:</span>
                <span className="ml-2">{lead.ofertaAtrativa}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Functional Triggers */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Gatilhos Funcionais</h4>
            <div className="flex flex-wrap gap-2">
              {lead.gatilhosFuncionais?.map((gatilho, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {gatilho}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="space-y-2 text-sm">
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

          <Separator />

          {/* Observations */}
          {lead.observacoes && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Observações</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {lead.observacoes}
              </p>
            </div>
          )}

          {/* Responsible */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Responsável</h4>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(lead.vendedorNome)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{lead.vendedorNome}</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};