import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadAdvanced } from "@/types/crm";
import { useCRM } from "@/contexts/CRMContext";
import { Building2, Mail, Phone, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadCardProps {
  lead: LeadAdvanced;
}

export const LeadCard = ({ lead }: LeadCardProps) => {
  const { setSelectedLead } = useCRM();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quente': return 'bg-red-100 text-red-800 border-red-200';
      case 'morno': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'frio': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleClick = () => {
    setSelectedLead(lead);
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-border"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-medium">
              {getInitials(lead.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate">
              {lead.nome}
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{lead.empresa}</span>
            </div>
          </div>
        </div>
        <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
          {lead.status}
        </Badge>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{lead.telefone}</span>
        </div>
      </div>

      {/* Value and Probability */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-sm">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span className="font-medium text-green-600">
            R$ {lead.valor.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {lead.probabilidade}% prob.
        </div>
      </div>

      {/* Last Contact */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-2">
        <Calendar className="h-3 w-3" />
        <span>
          Últ. contato: {format(new Date(lead.ultimaInteracao), "dd/MM", { locale: ptBR })}
        </span>
      </div>

      {/* Score Indicator */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Score</span>
          <span className="font-medium">{lead.pontuacao}/100</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${lead.pontuacao}%` }}
          />
        </div>
      </div>
    </Card>
  );
};