import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
  Zap
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ProjectCard, Priority } from "@/types/projects";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  isSameDay,
  differenceInDays,
  parseISO
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const priorityConfig = {
  low: { icon: Clock, className: 'bg-blue-500' },
  medium: { icon: AlertCircle, className: 'bg-yellow-500' },
  high: { icon: Zap, className: 'bg-red-500' },
  urgent: { icon: Zap, className: 'bg-red-600' }
};

export const TimelineView = () => {
  const { state, actions } = useProjects();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const filteredCards = actions.getFilteredCards();
  const cardsWithDates = filteredCards.filter(card => card.dueDate || card.startDate);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });  
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'prev' ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1));
  };

  const getCardPosition = (card: ProjectCard) => {
    const startDate = card.startDate ? parseISO(card.startDate) : parseISO(card.dueDate!);
    const endDate = card.dueDate ? parseISO(card.dueDate) : startDate;
    
    const startOffset = differenceInDays(startDate, weekStart);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: Math.max(0, (startOffset / 7) * 100),
      width: Math.min(100 - Math.max(0, (startOffset / 7) * 100), (duration / 7) * 100)
    };
  };

  const getCardsForDay = (date: Date) => {
    return cardsWithDates.filter(card => {
      const startDate = card.startDate ? parseISO(card.startDate) : null;
      const dueDate = card.dueDate ? parseISO(card.dueDate) : null;
      
      if (startDate && dueDate) {
        return date >= startDate && date <= dueDate;
      } else if (dueDate) {
        return isSameDay(date, dueDate);
      } else if (startDate) {
        return isSameDay(date, startDate);
      }
      
      return false;
    });
  };

  return (
    <div className="h-full p-6">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Cronograma - {format(weekStart, 'd MMM', { locale: ptBR })} a {format(weekEnd, 'd MMM yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
                Esta semana
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="h-full">
          <div className="h-full flex flex-col">
            {/* Week Header */}
            <div className="grid grid-cols-8 gap-2 mb-4 pb-2 border-b">
              <div className="font-medium text-sm">Cartões</div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center">
                  <div className="font-medium text-sm">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={cn(
                    "text-lg",
                    isSameDay(day, new Date()) && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-auto">
              <div className="space-y-4">
                {/* Cards with date ranges */}
                {cardsWithDates
                  .filter(card => {
                    const startDate = card.startDate ? parseISO(card.startDate) : parseISO(card.dueDate!);
                    const endDate = card.dueDate ? parseISO(card.dueDate) : startDate;
                    return startDate <= weekEnd && endDate >= weekStart;
                  })
                  .map((card) => {
                    const position = getCardPosition(card);
                    const PriorityIcon = priorityConfig[card.priority].icon;
                    
                    return (
                      <div key={card.id} className="grid grid-cols-8 gap-2 items-center min-h-[60px]">
                        {/* Card Info */}
                        <div 
                          className="p-2 border rounded cursor-pointer hover:bg-muted/50"
                          onClick={() => actions.setSelectedCard(card)}
                        >
                          <div className="font-medium text-sm line-clamp-1 mb-1">
                            {card.title}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-1">
                              {card.assignees.slice(0, 2).map((assignee) => (
                                <Avatar key={assignee.id} className="h-4 w-4 border border-background">
                                  <AvatarImage src={assignee.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <div className={cn("p-1 rounded", priorityConfig[card.priority].className)}>
                              <PriorityIcon size={10} className="text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Timeline Bar */}
                        <div className="col-span-7 relative h-8">
                          <div 
                            className={cn(
                              "absolute h-6 rounded flex items-center px-2 text-white text-xs font-medium cursor-pointer",
                              priorityConfig[card.priority].className,
                              "hover:opacity-80 transition-opacity"
                            )}
                            style={{
                              left: `${position.left}%`,
                              width: `${position.width}%`
                            }}
                            onClick={() => actions.setSelectedCard(card)}
                          >
                            <span className="truncate">{card.title}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Empty state */}
                {cardsWithDates.length === 0 && (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <div className="text-center">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                      <div className="text-lg font-medium mb-2">Nenhum cartão com datas</div>
                      <div className="text-sm">
                        Adicione datas de início e fim aos cartões para visualizá-los no cronograma
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Baixa Prioridade</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Média Prioridade</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Alta Prioridade</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>Urgente</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};