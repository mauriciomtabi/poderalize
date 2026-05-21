import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadAdvanced } from "@/types/crm";
import { useCRM } from "@/contexts/CRMContext";
import { Building2, Mail, Phone, DollarSign, Calendar, Thermometer, Bell, MoreVertical, CheckCircle, XCircle, FileText, LogOut } from "lucide-react";
import { formatCNPJ, formatPhone } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NegotiationTemperature } from "@/types/crm";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

  const handleRemoveFromFunnel = async () => {
    setIsRemoving(true);
    try {
      const success = await funnelLeadHooks.removeLeadFromFunnel(lead.id);
      if (success) {
        await leadHooks.refreshLeads();
        await funnelLeadHooks.refreshFunnelLeads();
        toast.success('Lead removido do funil com sucesso!');
      } else {
        toast.error('Erro ao remover lead do funil');
      }
    } catch (error) {
      console.error('Error removing lead from funnel:', error);
      toast.error('Erro ao remover lead do funil');
    } finally {
      setIsRemoving(false);
      setRemoveConfirmOpen(false);
    }
  };

  return (
    <Card 
      className="group relative p-3.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-300 border border-border bg-surface-elevated rounded-xl overflow-hidden" 
      onClick={handleClick}
    >
      {/* Indicador visual lateral baseado na temperatura */}
      {lead.temperaturaNegociacao && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getTemperatureColor(lead.temperaturaNegociacao).replace('text-', 'bg-')} opacity-60`} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-[10px] font-semibold bg-secondary/5 text-secondary">
              {getInitials(lead.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-sm text-secondary truncate tracking-tight">
              {lead.nome}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{lead.empresa}</span>
            </div>
            {lead.telefone && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formatPhone(lead.telefone)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {hasPendingFollowUp && followUpState && (
            <div title={followUpState === 'overdue' ? 'Follow-up atrasado' : followUpState === 'today' ? 'Follow-up hoje' : 'Follow-up agendado'}>
              <Bell className={`h-3.5 w-3.5 ${followUpState === 'overdue' ? 'text-red-500' : followUpState === 'today' ? 'text-primary animate-pulse' : 'text-blue-500'}`} />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={handleMenuClick}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActionDialog({ isOpen: true, action: 'close' })} className="text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" /> Fechado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionDialog({ isOpen: true, action: 'lose' })} className="text-red-600">
                <XCircle className="h-4 w-4 mr-2" /> Perdido
              </DropdownMenuItem>
              {currentFunnel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); setRemoveConfirmOpen(true); }}
                    className="text-orange-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Remover do funil
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Value and Temperature */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="font-display font-bold text-sm text-secondary tabular-nums">
            {lead.valor.toLocaleString('pt-BR')}
          </span>
        </div>
        
        {lead.temperaturaNegociacao && (
          <Badge variant="outline" className={`text-[10px] h-5 px-1.5 border-transparent bg-secondary/5 ${getTemperatureColor(lead.temperaturaNegociacao)}`}>
            {getTemperatureLabel(lead.temperaturaNegociacao)}
          </Badge>
        )}
      </div>

      {/* Hidden Info revealed on Hover */}
      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
        <div className="overflow-hidden">
          <div className="space-y-1.5 pt-2 border-t border-border/50 pb-1">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span>{formatPhone(lead.telefone)}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>Últ. contato: {format(new Date(lead.ultimaInteracao), "dd/MM", { locale: ptBR })}</span>
            </div>
          </div>
        </div>
      </div>

      <LeadActionDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, action: null })}
        onConfirm={handleLeadAction}
        action={actionDialog.action!}
        leadName={lead.nome}
      />

      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover lead do funil?</AlertDialogTitle>
            <AlertDialogDescription>
              O lead <strong>{lead.nome}</strong> será removido do funil atual. Ele continuará disponível na lista de leads e pode ser adicionado a qualquer funil novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromFunnel}
              disabled={isRemoving}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isRemoving ? 'Removendo...' : 'Remover do funil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
