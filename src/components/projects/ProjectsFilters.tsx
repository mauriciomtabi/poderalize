import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  User, 
  Tag, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Archive
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { Priority, CardStatus } from "@/types/projects";
import { cn } from "@/lib/utils";

const priorityIcons = {
  low: <Clock size={14} className="text-blue-500" />,
  medium: <AlertCircle size={14} className="text-yellow-500" />,
  high: <Zap size={14} className="text-red-500" />,
  urgent: <Zap size={14} className="text-red-600" />
};

const statusIcons = {
  'todo': <Circle size={14} className="text-gray-500" />,
  'in-progress': <Clock size={14} className="text-blue-500" />,
  'review': <AlertCircle size={14} className="text-yellow-500" />,
  'blocked': <X size={14} className="text-red-500" />,
  'done': <CheckCircle2 size={14} className="text-green-500" />
};

function Circle({ size, className }: { size: number; className: string }) {
  return (
    <div 
      className={cn("rounded-full border-2", className)} 
      style={{ width: size, height: size }} 
    />
  );
}

export const ProjectsFilters = () => {
  const { state, actions } = useProjects();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleMemberToggle = (memberId: string) => {
    const currentMembers = state.filters.members;
    const newMembers = currentMembers.includes(memberId)
      ? currentMembers.filter(id => id !== memberId)
      : [...currentMembers, memberId];
    
    actions.setFilters({ members: newMembers });
  };

  const handleLabelToggle = (labelId: string) => {
    const currentLabels = state.filters.labels;
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter(id => id !== labelId)
      : [...currentLabels, labelId];
    
    actions.setFilters({ labels: newLabels });
  };

  const handlePriorityToggle = (priority: Priority) => {
    const currentPriorities = state.filters.priority;
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    actions.setFilters({ priority: newPriorities });
  };

  const handleStatusToggle = (status: CardStatus) => {
    const currentStatuses = state.filters.cardStatus;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    actions.setFilters({ cardStatus: newStatuses });
  };

  const handleDueDateFilter = (dueDate: typeof state.filters.dueDate) => {
    actions.setFilters({ dueDate: state.filters.dueDate === dueDate ? null : dueDate });
  };

  const clearAllFilters = () => {
    actions.resetFilters();
  };

  const activeFiltersCount = Object.values(state.filters).filter(filter => {
    if (Array.isArray(filter)) return filter.length > 0;
    if (typeof filter === 'boolean') return filter;
    if (typeof filter === 'string') return filter.length > 0;
    return filter !== null;
  }).length;

  if (!isExpanded && activeFiltersCount === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="text-muted-foreground"
      >
        Mostrar filtros
      </Button>
    );
  }

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Filtros</CardTitle>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar tudo
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0"
            >
              <X size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ScrollArea className="h-96">
          {/* Members Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User size={16} className="text-muted-foreground" />
              <h4 className="font-medium text-sm">Membros</h4>
            </div>
            
            <div className="space-y-2">
              {state.currentBoard?.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={state.filters.members.includes(member.id)}
                    onCheckedChange={() => handleMemberToggle(member.id)}
                  />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor={`member-${member.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Labels Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Tag size={16} className="text-muted-foreground" />
              <h4 className="font-medium text-sm">Etiquetas</h4>
            </div>
            
            <div className="space-y-2">
              {state.currentBoard?.labels.map((label) => (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={state.filters.labels.includes(label.id)}
                    onCheckedChange={() => handleLabelToggle(label.id)}
                  />
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                  <label
                    htmlFor={`label-${label.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {label.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Due Date Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-muted-foreground" />
              <h4 className="font-medium text-sm">Data de Entrega</h4>
            </div>
            
            <div className="space-y-1">
              {[
                { key: 'no-date', label: 'Sem data' },
                { key: 'overdue', label: 'Em atraso' },
                { key: 'today', label: 'Hoje' },
                { key: 'week', label: 'Esta semana' },
                { key: 'month', label: 'Este mês' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={state.filters.dueDate === key ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleDueDateFilter(key as any)}
                  className="w-full justify-start h-8"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Priority Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-muted-foreground" />
              <h4 className="font-medium text-sm">Prioridade</h4>
            </div>
            
            <div className="space-y-2">
              {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={state.filters.priority.includes(priority)}
                    onCheckedChange={() => handlePriorityToggle(priority)}
                  />
                  <div className="flex items-center space-x-2">
                    {priorityIcons[priority]}
                    <label
                      htmlFor={`priority-${priority}`}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {priority === 'urgent' ? 'Urgente' : 
                       priority === 'high' ? 'Alta' :
                       priority === 'medium' ? 'Média' : 'Baixa'}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Status Filter */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-muted-foreground" />
              <h4 className="font-medium text-sm">Status</h4>
            </div>
            
            <div className="space-y-2">
              {([
                { key: 'todo', label: 'A fazer' },
                { key: 'in-progress', label: 'Em andamento' },
                { key: 'review', label: 'Revisão' },
                { key: 'blocked', label: 'Bloqueado' },
                { key: 'done', label: 'Concluído' }
              ] as { key: CardStatus; label: string }[]).map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${key}`}
                    checked={state.filters.cardStatus.includes(key)}
                    onCheckedChange={() => handleStatusToggle(key)}
                  />
                  <div className="flex items-center space-x-2">
                    {statusIcons[key]}
                    <label
                      htmlFor={`status-${key}`}
                      className="text-sm cursor-pointer"
                    >
                      {label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Other Filters */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Archive size={16} className="text-muted-foreground" />
              <h4 className="font-medium text-sm">Outros</h4>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-my-cards"
                checked={state.filters.showMyCards}
                onCheckedChange={(checked) => actions.setFilters({ showMyCards: !!checked })}
              />
              <label htmlFor="show-my-cards" className="text-sm cursor-pointer">
                Apenas meus cartões
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-archived"
                checked={state.filters.archived}
                onCheckedChange={(checked) => actions.setFilters({ archived: !!checked })}
              />
              <label htmlFor="show-archived" className="text-sm cursor-pointer">
                Mostrar arquivados
              </label>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
