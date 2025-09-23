import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  AlertCircle,
  Clock
} from "lucide-react";
import { InlineEdit } from "./InlineEdit";
import { Task } from "./KanbanBoard";

interface KanbanCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onUpdateTitle?: (taskId: string, newTitle: string) => void;
}

export const KanbanCard = ({ task, onEdit, onDelete, onDuplicate, onUpdateTitle }: KanbanCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle size={12} />;
      case "medium": return <Clock size={12} />;
      case "low": return <CheckCircle size={12} />;
      default: return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <div className="card-kanban group">
      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs px-2 py-0 bg-primary/10 text-primary"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <div className="mb-2">
        {onUpdateTitle ? (
          <InlineEdit
            value={task.title}
            onSave={(newTitle) => onUpdateTitle(task.id, newTitle)}
            className="font-medium text-sm text-foreground leading-tight"
            placeholder="Título do cartão"
          />
        ) : (
          <h3 className="font-medium text-sm text-foreground leading-tight">
            {task.title}
          </h3>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Checklist Progress */}
      {task.checklist && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{task.checklist.completed}/{task.checklist.total} tarefas</span>
            <span>{Math.round((task.checklist.completed / task.checklist.total) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ 
                width: `${(task.checklist.completed / task.checklist.total) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Due Date */}
      {task.dueDate && (
        <div className={`flex items-center space-x-1 mb-3 text-xs px-2 py-1 rounded-md ${
          isOverdue(task.dueDate) 
            ? "bg-red-100 text-red-800" 
            : "bg-muted text-muted-foreground"
        }`}>
          <Calendar size={12} />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      )}

      {/* Bottom section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Priority */}
          <Badge className={`text-xs px-1.5 py-0.5 ${getPriorityColor(task.priority)}`}>
            <div className="flex items-center space-x-1">
              {getPriorityIcon(task.priority)}
              <span className="capitalize">{task.priority}</span>
            </div>
          </Badge>

          {/* Comments */}
          {task.comments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <MessageSquare size={12} />
              <span>{task.comments}</span>
            </div>
          )}

          {/* Attachments */}
          {task.attachments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Paperclip size={12} />
              <span>{task.attachments}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Assignee */}
          {task.assignee && (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(task.assignee)}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit size={14} className="mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy size={14} className="mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 size={14} className="mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};