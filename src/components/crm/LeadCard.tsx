import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadAdvanced } from "@/types/crm";
import { useCRM } from "@/contexts/CRMContext";
import { Building2, Mail, Phone, DollarSign, Calendar, Thermometer, Bell, MoreVertical, CheckCircle, XCircle, FileText } from "lucide-react";
import { formatCNPJ, formatPhone } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NegotiationTemperature } from "@/types/crm";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LeadActionDialog } from "./LeadActionDialog";
import { useLeads } from "@/hooks/useLeads";
import { LeadStageSelector } from "./LeadStageSelector";
interface LeadCardProps {
  lead: LeadAdvanced;
  onLeadUpdate?: () => void;
}
export const LeadCard = ({
  lead,
  onLeadUpdate
}: LeadCardProps) => {
  const {
    setSelectedLead
  } = useCRM();
  const { user } = useAuth();
  const [hasPendingFollowUp, setHasPendingFollowUp] = useState(false);
  const [followUpState, setFollowUpState] = useState<'overdue' | 'today' | 'scheduled' | null>(null);
  const [actionDialog, setActionDialog] = useState<{ isOpen: boolean; action: 'close' | 'lose' | null }>({
    isOpen: false,
    action: null
  });

  const { markLeadAsClosed, markLeadAsLost } = useLeads();

  useEffect(() => {
    const checkPendingFollowUps = async () => {
      if (!user || !lead.id) return;

      try {
        const { data, error } = await supabase
          .from('follow_ups')
          .select('data_agendada')
          .eq('user_id', user.id)
          .eq('lead_id', lead.id)
          .eq('status', 'pendente');

        if (error) {
          console.error('Error checking follow-ups:', error);
          return;
        }

        if (!data || data.length === 0) {
          setHasPendingFollowUp(false);
          return;
        }

        // Pegar o follow-up mais próximo
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // Encontrar o follow-up mais próximo
        const nextFollowUp = data.reduce((closest, current) => {
          const currentDate = new Date(current.data_agendada);
          const closestDate = new Date(closest.data_agendada);
          
          return Math.abs(currentDate.getTime() - now.getTime()) < Math.abs(closestDate.getTime() - now.getTime()) 
            ? current 
            : closest;
        });

        const followUpDate = new Date(nextFollowUp.data_agendada);
        const followUpDay = new Date(followUpDate.getFullYear(), followUpDate.getMonth(), followUpDate.getDate());
        
        // Determinar o estado do follow-up
        if (followUpDate < now) {
          // Atrasado - vermelho
          setFollowUpState('overdue');
        } else if (followUpDay.getTime() === today.getTime()) {
          // Hoje - piscando
          setFollowUpState('today');
        } else {
          // Agendado para o futuro - azul
          setFollowUpState('scheduled');
        }
        
        setHasPendingFollowUp(true);
      } catch (error) {
        console.error('Error checking follow-ups:', error);
      }
    };

    checkPendingFollowUps();
  }, [user, lead.id]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'morno':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'frio':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTemperatureColor = (temperature: NegotiationTemperature) => {
    const colors = {
      'muito_fraca': 'text-blue-600',
      'fraca': 'text-cyan-600', 
      'mediana': 'text-yellow-600',
      'forte': 'text-orange-600',
      'muito_forte': 'text-red-600'
    };
    return colors[temperature];
  };

  const getTemperatureLabel = (temperature: NegotiationTemperature) => {
    const labels = {
      'muito_fraca': 'Muito Fraca',
      'fraca': 'Fraca',
      'mediana': 'Mediana',
      'forte': 'Forte',
      'muito_forte': 'Muito Forte'
    };
    return labels[temperature];
  };
  const handleClick = () => {
    setSelectedLead(lead);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
  };

  const handleLeadAction = async (motivo?: string) => {
    if (actionDialog.action === 'close') {
      await markLeadAsClosed(lead.id);
    } else if (actionDialog.action === 'lose' && motivo) {
      await markLeadAsLost(lead.id, motivo);
    }
  };
  return <Card className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-border" onClick={handleClick}>
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
        
        <div className="flex items-center gap-2">
          {/* Follow-up Indicator */}
          {hasPendingFollowUp && followUpState && (
            <div className="flex items-center" title={
              followUpState === 'overdue' ? 'Follow-up atrasado' :
              followUpState === 'today' ? 'Follow-up hoje' :
              'Follow-up agendado'
            }>
              <Bell className={`h-4 w-4 ${
                followUpState === 'overdue' ? 'text-red-500' :
                followUpState === 'today' ? 'text-orange-500 animate-pulse' :
                'text-blue-500'
              }`} />
            </div>
          )}

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setActionDialog({ isOpen: true, action: 'close' })}
                className="text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Fechado
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setActionDialog({ isOpen: true, action: 'lose' })}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Marcar como Perdido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.cnpj && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>{formatCNPJ(lead.cnpj)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{formatPhone(lead.telefone)}</span>
        </div>
      </div>

      {/* Value and Temperature */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-sm">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span className="font-medium text-green-600">
            R$ {lead.valor.toLocaleString()}
          </span>
        </div>
        
        {/* Negotiation Temperature */}
        {lead.temperaturaNegociacao && (
          <div className="flex items-center gap-1 text-xs">
            <Thermometer className={`h-3 w-3 ${getTemperatureColor(lead.temperaturaNegociacao)}`} />
            <span className={`font-medium ${getTemperatureColor(lead.temperaturaNegociacao)}`}>
              {getTemperatureLabel(lead.temperaturaNegociacao)}
            </span>
          </div>
        )}
      </div>

      {/* Last Contact and Stage Selector */}
      <div className="flex items-center justify-between border-t pt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            Últ. contato: {format(new Date(lead.ultimaInteracao), "dd/MM", {
            locale: ptBR
          })}
          </span>
        </div>
        
        <LeadStageSelector
          leadId={lead.id}
          currentStageId={lead.funnelStageId}
          currentStageTitle={lead.etapaFunil}
          funnelId={lead.funnelId}
          onStageChange={onLeadUpdate}
        />
      </div>

      {/* Score Indicator */}
      <div className="mt-2">
        
        
      </div>

      {/* Lead Action Dialog */}
      <LeadActionDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, action: null })}
        onConfirm={handleLeadAction}
        action={actionDialog.action!}
        leadName={lead.nome}
      />
    </Card>;
};