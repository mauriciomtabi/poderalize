import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageSquare, Mail, Users, CheckCircle, Clock } from "lucide-react";
import { FollowUp } from "@/types/crm";

interface FollowUpCalendarProps {
  followUps: FollowUp[];
  onMarcarConcluido?: (id: string) => void;
  onReagendar?: (id: string) => void;
}

export const FollowUpCalendar = ({ 
  followUps, 
  onMarcarConcluido, 
  onReagendar 
}: FollowUpCalendarProps) => {
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ligacao': return <Phone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'reuniao': return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'default';
      case 'pendente': return 'destructive';
      case 'reagendado': return 'secondary';
      default: return 'outline';
    }
  };

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isVencido = (data: string) => {
    return new Date(data) < new Date() && followUps.find(f => f.dataAgendada === data)?.status === 'pendente';
  };

  const followUpsPendentes = followUps.filter(f => f.status === 'pendente');
  const followUpsVencidos = followUpsPendentes.filter(f => isVencido(f.dataAgendada));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Agenda de Follow-ups
          {followUpsVencidos.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {followUpsVencidos.length} vencidos
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {followUps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum follow-up agendado</p>
            </div>
          ) : (
            followUps
              .sort((a, b) => new Date(a.dataAgendada).getTime() - new Date(b.dataAgendada).getTime())
              .map((followUp) => (
                <div 
                  key={followUp.id} 
                  className={`p-4 border rounded-lg space-y-3 ${
                    isVencido(followUp.dataAgendada) ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getTipoIcon(followUp.tipo)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{followUp.leadNome}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatData(followUp.dataAgendada)}
                          {isVencido(followUp.dataAgendada) && (
                            <Badge variant="destructive" className="text-xs">
                              Vencido
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(followUp.status) as any}>
                      {followUp.status}
                    </Badge>
                  </div>
                  
                  {followUp.observacoes && (
                    <p className="text-sm text-muted-foreground pl-7">
                      {followUp.observacoes}
                    </p>
                  )}
                  
                  {followUp.templateMensagem && (
                    <div className="bg-muted/50 p-3 rounded-md ml-7">
                      <p className="text-sm font-medium mb-1">Template de Mensagem:</p>
                      <p className="text-sm">{followUp.templateMensagem}</p>
                    </div>
                  )}
                  
                  {followUp.status === 'pendente' && (
                    <div className="flex gap-2 ml-7">
                      {onMarcarConcluido && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => onMarcarConcluido(followUp.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Concluído
                        </Button>
                      )}
                      {onReagendar && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onReagendar(followUp.id)}
                        >
                          Reagendar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};