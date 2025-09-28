import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Zap
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ProjectCard, Priority } from "@/types/projects";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CardDetailModal } from "../modal/CardDetailModal";

const priorityConfig = {
  low: { icon: Clock, className: 'text-blue-500' },
  medium: { icon: AlertCircle, className: 'text-yellow-500' },
  high: { icon: Zap, className: 'text-red-500' },
  urgent: { icon: Zap, className: 'text-red-600' }
};

export const CalendarView = () => {
  const { state, actions } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCard, setSelectedCard] = useState<ProjectCard | null>(null);

  const filteredCards = actions.getFilteredCards();
  const cardsWithDates = filteredCards.filter(card => card.dueDate);

  const getCardsForDate = (date: Date) => {
    return cardsWithDates.filter(card => 
      card.dueDate && isSameDay(new Date(card.dueDate), date)
    );
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const CardItem = ({ card }: { card: ProjectCard }) => {
    const PriorityIcon = priorityConfig[card.priority].icon;
    
    return (
      <div 
        className="p-2 mb-2 bg-card border border-border rounded cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => actions.setSelectedCard(card)}
      >
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-sm font-medium line-clamp-2 flex-1">{card.title}</h4>
          <div className={cn("ml-2", priorityConfig[card.priority].className)}>
            <PriorityIcon size={12} />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1">
            {card.assignees.slice(0, 2).map((assignee) => (
              <Avatar key={assignee.id} className="h-4 w-4 border border-background">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {assignee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {card.assignees.length > 2 && (
              <div className="h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{card.assignees.length - 2}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-1">
            {card.labels.slice(0, 2).map((label) => (
              <div
                key={label.id}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: label.color }}
                title={label.name}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Calendar Grid */}
      <div className="flex-1 p-6">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="h-full">
            <div className="grid grid-cols-7 gap-2 h-full">
              {/* Week Headers */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {monthDays.map((day) => {
                const dayCards = getCardsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-2 border border-border rounded cursor-pointer transition-colors min-h-[120px] max-h-[120px] overflow-hidden",
                      isToday && "bg-primary/10 border-primary/30",
                      isSelected && "bg-accent",
                      "hover:bg-muted/30"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayCards.slice(0, 3).map((card) => (
                        <div
                          key={card.id}
                          className="text-xs p-1 bg-card border rounded truncate cursor-pointer hover:bg-muted/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCard(card);
                          }}
                          style={{
                            borderLeftColor: priorityConfig[card.priority].className.includes('blue') ? '#3b82f6' :
                                           priorityConfig[card.priority].className.includes('yellow') ? '#f59e0b' :
                                           priorityConfig[card.priority].className.includes('red') ? '#ef4444' : '#6b7280',
                            borderLeftWidth: '3px'
                          }}
                        >
                          {card.title}
                        </div>
                      ))}
                      
                      {dayCards.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayCards.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="w-80 border-l border-border bg-card p-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">
              {format(selectedDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
            </h3>
            <div className="text-sm text-muted-foreground">
              {getCardsForDate(selectedDate).length} cartão(s) com prazo
            </div>
          </div>

          <div className="space-y-3">
            {getCardsForDate(selectedDate).map((card) => (
              <div
                key={card.id}
                className="cursor-pointer"
                onClick={() => setSelectedCard(card)}
              >
                <CardItem card={card} />
              </div>
            ))}
            
            {getCardsForDate(selectedDate).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                <div className="text-sm">Nenhum cartão nesta data</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};