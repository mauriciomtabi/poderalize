import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { LeadInteraction, InteractionType } from "@/types/crm";

interface InteractionHistoryProps {
  interactions: LeadInteraction[];
  loading?: boolean;
  hideCard?: boolean;
}

const interactionIcons: Record<InteractionType, React.ReactNode> = {
  'ligacao': <Phone className="h-4 w-4" />,
  'whatsapp': <MessageCircle className="h-4 w-4" />,
  'email_enviado': <Mail className="h-4 w-4" />,
  'email_recebido': <Mail className="h-4 w-4" />,
  'reuniao': <Users className="h-4 w-4" />,
  'proposta_enviada': <FileText className="h-4 w-4" />,
  'negociacao': <TrendingUp className="h-4 w-4" />,
  'fechamento': <CheckCircle2 className="h-4 w-4" />,
  'contato_inicial': <Phone className="h-4 w-4" />,
  'follow_up': <Clock className="h-4 w-4" />
};

const interactionLabels: Record<InteractionType, string> = {
  'ligacao': 'Ligação',
  'whatsapp': 'WhatsApp',
  'email_enviado': 'E-mail Enviado',
  'email_recebido': 'E-mail Recebido', 
  'reuniao': 'Reunião',
  'proposta_enviada': 'Proposta Enviada',
  'negociacao': 'Negociação',
  'fechamento': 'Fechamento',
  'contato_inicial': 'Contato Inicial',
  'follow_up': 'Follow-up'
};

const interactionColors: Record<InteractionType, string> = {
  'ligacao': 'bg-blue-100 text-blue-800 border-blue-200',
  'whatsapp': 'bg-green-100 text-green-800 border-green-200',
  'email_enviado': 'bg-purple-100 text-purple-800 border-purple-200',
  'email_recebido': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'reuniao': 'bg-orange-100 text-orange-800 border-orange-200',
  'proposta_enviada': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'negociacao': 'bg-teal-100 text-teal-800 border-teal-200',
  'fechamento': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'contato_inicial': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'follow_up': 'bg-gray-100 text-gray-800 border-gray-200'
};

export const InteractionHistory = ({ interactions, loading, hideCard }: InteractionHistoryProps) => {
  if (loading) {
    const spinner = (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
    if (hideCard) return spinner;
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Interações</CardTitle>
        </CardHeader>
        <CardContent>{spinner}</CardContent>
      </Card>
    );
  }

  const listContent = (
    interactions.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground bg-background/30 rounded-xl border border-dashed border-border p-6">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="font-semibold text-sm">Nenhuma interação registrada</p>
        <p className="text-xs text-muted-foreground mt-1">Use o botão "Registrar Contato" para adicionar interações</p>
      </div>
    ) : (
      <ScrollArea className={hideCard ? "h-full pr-2" : "h-[400px]"}>
        <div className="space-y-4">
          {interactions.map((interaction, index) => (
            <div key={interaction.id}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {interactionIcons[interaction.interactionType]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${interactionColors[interaction.interactionType]}`}
                    >
                      {interactionLabels[interaction.interactionType]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(interaction.interactionDate), "dd/MM/yyyy 'às' HH:mm", { 
                        locale: ptBR 
                      })}
                    </span>
                    {interaction.createdByUserName && (
                      <Badge variant="secondary" className="text-xs">
                        {interaction.createdByUserName}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {interaction.description}
                  </p>
                  {interaction.metadata && Object.keys(interaction.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(interaction.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              {index < interactions.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  );

  if (hideCard) {
    return listContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico de Interações
          <Badge variant="secondary" className="ml-auto">
            {interactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>{listContent}</CardContent>
    </Card>
  );
};
