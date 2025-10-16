import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageCircle, Paperclip, MoreHorizontal, Clock, AlertCircle, Zap, CheckCircle2, Copy, Trash2, CheckSquare, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProjectCard } from "@/types/projects";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AttachmentSelectorDialog } from "@/components/projects/modal/AttachmentSelectorDialog";
import { cn, getInitials, isDateOverdue, getDueDateColorClass } from "@/lib/utils";
import { useState } from "react";
import { useProjects } from "@/contexts/ProjectsContext";
const priorityConfig = {
  low: {
    icon: Clock,
    className: 'text-blue-500'
  },
  medium: {
    icon: AlertCircle,
    className: 'text-yellow-500'
  },
  high: {
    icon: Zap,
    className: 'text-red-500'
  },
  urgent: {
    icon: Zap,
    className: 'text-red-600'
  }
};
const cardColorStyles = {
  'default': 'bg-card',
  'orange-light': 'bg-[hsl(20_85%_95%)]',
  'blue-light': 'bg-[hsl(222_84%_95%)]',
  'green-light': 'bg-[hsl(142_71%_95%)]',
  'yellow-light': 'bg-[hsl(38_92%_95%)]',
  'purple-light': 'bg-[hsl(260_90%_95%)]'
};
interface EnhancedProjectCardProps {
  card: ProjectCard;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClick?: () => void;
}
export const EnhancedProjectCard = ({
  card,
  onEdit,
  onDelete,
  onDuplicate,
  onClick
}: EnhancedProjectCardProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showAttachmentSelector, setShowAttachmentSelector] = useState(false);
  const [loadedAttachments, setLoadedAttachments] = useState<any[]>([]);
  const {
    state
  } = useProjects();
  const PriorityIcon = priorityConfig[card.priority].icon;
  const completedTasks = card.checklists.reduce((acc, checklist) => acc + checklist.items.filter(item => item.completed).length, 0);
  const totalTasks = card.checklists.reduce((acc, checklist) => acc + checklist.items.length, 0);
  const progress = totalTasks > 0 ? completedTasks / totalTasks * 100 : 0;
  const isOverdue = card.dueDate && isDateOverdue(card.dueDate) && card.status !== 'done';
  const cardColorClass = cardColorStyles[state.currentBoard?.cardColor as keyof typeof cardColorStyles] || cardColorStyles.default;

  // Get first incomplete task
  const firstIncompleteTask = card.checklists.flatMap(checklist => checklist.items).find(item => !item.completed);

  // Get assignee info for the first incomplete task
  const taskAssignee = firstIncompleteTask?.assignee ? card.assignees.find(a => a.id === firstIncompleteTask.assignee) : null;
  const isCompleted = card.status === 'done';
  
  return <Card className={cn("card-kanban group", cardColorClass, isCompleted && "opacity-60 bg-green-50 dark:bg-green-950/20")} onClick={onClick}>
      {/* Header: title + assignees + labels + priority */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {isCompleted && (
            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
          <h3 className={cn("font-medium text-sm cursor-pointer whitespace-normal break-words flex-1 leading-snug", isCompleted && "line-through text-muted-foreground")}>
            {card.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Priority indicator */}
          
          
          {/* Assignees (initials) */}
          {card.assignees.length > 0 && <div className="flex -space-x-1">
              {card.assignees.slice(0, 3).map(assignee => <Avatar key={assignee.id} className="h-5 w-5 border-2 border-background">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>)}
            </div>}
          {/* Label dots */}
          {card.labels.length > 0 && <div className="flex items-center gap-1">
              {card.labels.slice(0, 3).map(label => <span key={label.id} className="h-3 w-3 rounded-full border border-background" style={{
            backgroundColor: label.color
          }} title={label.name} />)}
            </div>}
        </div>
      </div>

      {/* Description */}
      {card.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2 break-words">
          {card.description}
        </p>}

      {/* Current Task - Primeira tarefa incompleta */}
      {firstIncompleteTask && <div className="mb-2 p-2 rounded-md bg-muted/50 border border-border/50">
          <div className="flex items-start gap-2">
            <CheckSquare size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                {firstIncompleteTask.text}
              </p>
            </div>
            {taskAssignee && <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage src={taskAssignee.avatar} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(taskAssignee.name)}
                </AvatarFallback>
              </Avatar>}
          </div>
        </div>}

      {/* Progress Bar */}
      {totalTasks > 0 && <div className="mb-2">
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
        </div>}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Due Date */}
          {card.dueDate && <div className={cn("flex items-center space-x-1 text-xs", getDueDateColorClass(card.dueDate, card.status === 'done'))}>
              <Calendar size={12} />
              <span>
                {new Date(card.dueDate).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short'
            })}
              </span>
            </div>}

          {/* Comments */}
          {card.comments.length > 0 && <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MessageCircle size={12} />
              <span>{card.comments.length}</span>
            </div>}

          {/* Attachments */}
          {(card.attachments_count ?? card.attachments.length) > 0 && <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-primary/10 transition-colors" onClick={async e => {
          e.stopPropagation();

          // Buscar todos os anexos do card
          const {
            data
          } = await (await import("@/integrations/supabase/client")).supabase.from('project_cards').select('custom_fields').eq('id', card.id).single();
          const attachments = (data?.custom_fields as any)?.attachments || [];
          
          // Armazenar os anexos carregados
          setLoadedAttachments(attachments);
          
          // Se houver múltiplos anexos, abrir o seletor
          if (attachments.length > 1) {
            setShowAttachmentSelector(true);
            return;
          }
          
          // Se houver apenas 1 anexo, abrir diretamente
          const firstAttachment = attachments[0];
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
        }} title="Abrir anexo">
              <div className="flex items-center space-x-1 text-xs">
                <Paperclip size={12} />
                <span>{card.attachments_count ?? card.attachments.length}</span>
              </div>
            </Button>}

          {/* No longer showing priority icon here since it's in the header */}
        </div>

        <div className="flex items-center space-x-2">

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <MoreHorizontal size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={e => {
              e.stopPropagation();
              onEdit();
            }}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={e => {
              e.stopPropagation();
              onDuplicate();
            }}>
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={e => {
              e.stopPropagation();
              onDelete();
            }} className="text-red-600">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AttachmentSelectorDialog
        isOpen={showAttachmentSelector}
        onClose={() => setShowAttachmentSelector(false)}
        attachments={loadedAttachments}
      />
    </Card>;
};