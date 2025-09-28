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
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectCard } from "@/types/projects";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

export const EnhancedProjectCard = ({ 
  card, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onClick 
}: EnhancedProjectCardProps) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const { state } = useProjects();
  const PriorityIcon = priorityConfig[card.priority].icon;
  
  const completedTasks = card.checklists.reduce((acc, checklist) => 
    acc + checklist.items.filter(item => item.completed).length, 0
  );
  const totalTasks = card.checklists.reduce((acc, checklist) => 
    acc + checklist.items.length, 0
  );
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'done';
  
  const cardColorClass = cardColorStyles[state.currentBoard?.cardColor as keyof typeof cardColorStyles] || cardColorStyles.default;

  return (
    <Card className={cn("card-kanban group", cardColorClass)} onClick={onClick}>
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <div
              key={label.id}
              className="h-2 min-w-8 rounded flex-1 max-w-16"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="font-medium text-sm mb-2 cursor-pointer">
        {card.title}
      </h3>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {card.description}
        </p>
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
              isOverdue ? "text-red-500" : "text-muted-foreground"
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
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Paperclip size={12} />
              <span>{card.attachments.length}</span>
            </div>
          )}

          {/* Priority Icon */}
          <div className={priorityConfig[card.priority].className}>
            <PriorityIcon size={12} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Assignees */}
          <div className="flex -space-x-1">
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
                <span className="text-xs text-muted-foreground">
                  +{card.assignees.length - 3}
                </span>
              </div>
            )}
          </div>

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