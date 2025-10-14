import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  MessageCircle,
  Paperclip,
  MoreHorizontal,
  Clock,
  AlertCircle,
  Zap,
  CheckCircle2,
  Copy,
  Trash2,
  CheckSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectCard } from "@/types/projects";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn, getInitials, isDateOverdue, getDueDateColorClass } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useProjects } from "@/contexts/ProjectsContext";

const priorityConfig = {
  low: { icon: Clock, className: 'text-blue-500' },
  medium: { icon: AlertCircle, className: 'text-yellow-500' },
  high: { icon: Zap, className: 'text-red-500' },
  urgent: { icon: Zap, className: 'text-red-600' }
};

const cardColorStyles = {
  'default': 'bg-card',
  'orange-light': 'bg-[hsl(20_85%_95%)]',
  'blue-light': 'bg-[hsl(222_84%_95%)]',
  'green-light': 'bg-[hsl(142_71%_95%)]',
  'yellow-light': 'bg-[hsl(38_92%_95%)]',
  'purple-light': 'bg-[hsl(260_90%_95%)]',
};

interface EnhancedProjectCardProps {
  card: ProjectCard;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClick?: () => void;
}

// FASE 4: Componente base
const EnhancedProjectCardComponent = ({ 
  card, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onClick 
}: EnhancedProjectCardProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { state } = useProjects();
  const PriorityIcon = priorityConfig[card.priority].icon;
  
  // FASE 3: Memoizar Cálculos para evitar recalcular em cada render
  const { completedTasks, totalTasks, progress, firstIncompleteTask, taskAssignee } = useMemo(() => {
    const completed = card.checklists.reduce((acc, checklist) => 
      acc + checklist.items.filter(item => item.completed).length, 0
    );
    const total = card.checklists.reduce((acc, checklist) => 
      acc + checklist.items.length, 0
    );
    const prog = total > 0 ? (completed / total) * 100 : 0;
    
    const firstIncomplete = card.checklists
      .flatMap(checklist => checklist.items)
      .find(item => !item.completed);
    
    const assignee = firstIncomplete?.assignee 
      ? card.assignees.find(a => a.id === firstIncomplete.assignee)
      : null;
    
    return {
      completedTasks: completed,
      totalTasks: total,
      progress: prog,
      firstIncompleteTask: firstIncomplete,
      taskAssignee: assignee
    };
  }, [card.checklists, card.assignees]);
  
  const isOverdue = card.dueDate && isDateOverdue(card.dueDate) && card.status !== 'done';
  
  const cardColorClass = cardColorStyles[state.currentBoard?.cardColor as keyof typeof cardColorStyles] || cardColorStyles.default;

  return (
    <Card className={cn("card-kanban group", cardColorClass)} onClick={onClick}>
      {/* Header: title + assignees + labels + priority */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-medium text-sm cursor-pointer line-clamp-1 flex-1">
          {card.title}
        </h3>
        <div className="flex items-center gap-2">
          {/* Priority indicator */}
          <div className={cn("p-1 rounded", priorityConfig[card.priority].className)}>
            <PriorityIcon size={12} />
          </div>
          
          {/* Assignees (initials) */}
          {card.assignees.length > 0 && (
            <div className="flex -space-x-1">
              {card.assignees.slice(0, 3).map((assignee) => (
                <Avatar key={assignee.id} className="h-5 w-5 border-2 border-background">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          {/* Label dots */}
          {card.labels.length > 0 && (
            <div className="flex items-center gap-1">
              {card.labels.slice(0, 3).map((label) => (
                <span
                  key={label.id}
                  className="h-3 w-3 rounded-full border border-background"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Current Task - Primeira tarefa incompleta */}
      {firstIncompleteTask && (
        <div className="mb-2 p-2 rounded-md bg-muted/50 border border-border/50">
          <div className="flex items-start gap-2">
            <CheckSquare size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {firstIncompleteTask.text}
              </p>
            </div>
            {taskAssignee && (
              <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage src={taskAssignee.avatar} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(taskAssignee.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <CheckCircle2 size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Due Date */}
          {card.dueDate && (
            <div className={cn(
              "flex items-center space-x-1 text-xs",
              getDueDateColorClass(card.dueDate, card.status === 'done')
            )}>
              <Calendar size={12} />
              <span>
                {new Date(card.dueDate).toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
            </div>
          )}

          {/* Comments */}
          {card.comments.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MessageCircle size={12} />
              <span>{card.comments.length}</span>
            </div>
          )}

          {/* Attachments */}
          {card.attachments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-primary/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const firstAttachment = card.attachments[0];
                if (firstAttachment) {
                  // Para data URLs (PDFs em base64), criar link temporário
                  if (firstAttachment.url.startsWith('data:')) {
                    const link = document.createElement('a');
                    link.href = firstAttachment.url;
                    link.target = '_blank';
                    link.download = firstAttachment.name || 'anexo';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    // Para URLs normais, usar window.open
                    window.open(firstAttachment.url, '_blank', 'noopener,noreferrer');
                  }
                }
              }}
              title={`Abrir: ${card.attachments[0]?.name || 'anexo'}`}
            >
              <div className="flex items-center space-x-1 text-xs">
                <Paperclip size={12} />
                <span>{card.attachments.length}</span>
              </div>
            </Button>
          )}

          {/* No longer showing priority icon here since it's in the header */}
        </div>

        <div className="flex items-center space-x-2">

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

// FASE 4: Export com memo para evitar re-renders
export const EnhancedProjectCard = memo(EnhancedProjectCardComponent);