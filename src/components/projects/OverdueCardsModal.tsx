import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, AlertTriangle } from "lucide-react";
import { ProjectCard } from "@/types/projects";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OverdueCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ProjectCard[];
  onCardClick: (card: ProjectCard) => void;
}

export const OverdueCardsModal = ({ isOpen, onClose, cards, onCardClick }: OverdueCardsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Cartões em Atraso ({cards.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {cards.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhum cartão em atraso
              </div>
            ) : (
              cards.map((card) => {
                const daysOverdue = card.dueDate 
                  ? Math.floor((Date.now() - new Date(card.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <div
                    key={card.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      onCardClick(card);
                      onClose();
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-2 truncate">{card.title}</h4>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                          {card.dueDate && (
                            <div className="flex items-center gap-1 text-red-600">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium">
                                {format(new Date(card.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                              </span>
                              <span className="text-xs text-red-500">
                                ({daysOverdue} dia{daysOverdue !== 1 ? 's' : ''} de atraso)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {card.labels.slice(0, 3).map((label) => (
                            <Badge
                              key={label.id}
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: label.color,
                                color: label.color
                              }}
                            >
                              {label.name}
                            </Badge>
                          ))}
                          {card.labels.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{card.labels.length - 3}
                            </Badge>
                          )}
                        </div>

                        {card.assignees.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex -space-x-2">
                              {card.assignees.slice(0, 3).map((assignee) => (
                                <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={assignee.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {card.assignees.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-[10px] font-medium">
                                    +{card.assignees.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <Badge
                        variant={card.priority === 'urgent' ? 'destructive' : 'secondary'}
                        className="whitespace-nowrap"
                      >
                        {card.priority === 'urgent' && 'Urgente'}
                        {card.priority === 'high' && 'Alta'}
                        {card.priority === 'medium' && 'Média'}
                        {card.priority === 'low' && 'Baixa'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
