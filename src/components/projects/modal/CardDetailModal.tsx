import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Calendar, 
  Users, 
  Tag, 
  Clock,
  MessageCircle,
  CheckSquare,
  Activity,
  Paperclip,
  Plus,
  Edit2,
  Trash2
} from "lucide-react";
import { ProjectCard, Member, Label as ProjectLabel, ChecklistItem, Checklist, Comment } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { ChecklistManager } from "./ChecklistManager";
import { CommentsSection } from "./CommentsSection";
import { ActivityHistory } from "./ActivityHistory";
import { cn } from "@/lib/utils";

interface CardDetailModalProps {
  card: ProjectCard;
  isOpen: boolean;
  onClose: () => void;
}

export const CardDetailModal = ({ card, isOpen, onClose }: CardDetailModalProps) => {
  const { actions, state } = useProjects();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const availableMembers = state.currentBoard?.members || [];
  const availableLabels = state.currentBoard?.labels || [];

  const completedTasks = card.checklists.reduce((acc, checklist) => 
    acc + checklist.items.filter(item => item.completed).length, 0
  );
  const totalTasks = card.checklists.reduce((acc, checklist) => 
    acc + checklist.items.length, 0
  );
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isEditingDescription]);

  const handleSaveTitle = () => {
    if (title.trim() && title !== card.title) {
      actions.updateCard({ ...card, title: title.trim() });
    } else {
      setTitle(card.title);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (description !== (card.description || '')) {
      actions.updateCard({ ...card, description: description.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setTitle(card.title);
      setDescription(card.description || '');
    }
  };

  const toggleLabel = (labelId: string) => {
    const hasLabel = card.labels.some(l => l.id === labelId);
    const newLabels = hasLabel 
      ? card.labels.filter(l => l.id !== labelId)
      : [...card.labels, availableLabels.find(l => l.id === labelId)!];
    
    actions.updateCard({ ...card, labels: newLabels });
  };

  const toggleMember = (memberId: string) => {
    const hasMember = card.assignees.some(m => m.id === memberId);
    const newAssignees = hasMember
      ? card.assignees.filter(m => m.id !== memberId)
      : [...card.assignees, availableMembers.find(m => m.id === memberId)!];
    
    actions.updateCard({ ...card, assignees: newAssignees });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header with title */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {isEditingTitle ? (
                  <Input
                    ref={titleInputRef}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => handleKeyDown(e, handleSaveTitle)}
                    className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                  />
                ) : (
                  <h2 
                    className="text-lg font-semibold cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {card.title}
                  </h2>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  na lista <span className="font-medium">{state.currentBoard?.lists.find(l => l.id === card.listId)?.title}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Labels */}
            {card.labels.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {card.labels.map(label => (
                    <Badge key={label.id} style={{ backgroundColor: label.color }} className="text-white">
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Edit2 className="h-4 w-4" />
                <h3 className="font-medium">Descrição</h3>
              </div>
              {isEditingDescription ? (
                <Textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  onKeyDown={(e) => handleKeyDown(e, handleSaveDescription)}
                  placeholder="Adicione uma descrição mais detalhada..."
                  className="min-h-[100px] resize-none"
                />
              ) : (
                <div 
                  className={cn(
                    "min-h-[60px] p-2 rounded border border-transparent cursor-pointer hover:border-border hover:bg-muted/50 transition-colors",
                    !card.description && "text-muted-foreground"
                  )}
                  onClick={() => setIsEditingDescription(true)}
                >
                  {card.description || "Adicione uma descrição mais detalhada..."}
                </div>
              )}
            </div>

            {/* Progress */}
            {totalTasks > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4" />
                  <h3 className="font-medium">Progresso</h3>
                  <span className="text-sm text-muted-foreground">
                    {completedTasks}/{totalTasks} tarefas
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Checklists */}
            <ChecklistManager card={card} />

            <Separator className="my-6" />

            {/* Comments */}
            <CommentsSection card={card} />

            <Separator className="my-6" />

            {/* Activity */}
            <ActivityHistory card={card} />
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-muted/30 p-4">
            <h3 className="font-medium mb-4">Adicionar ao cartão</h3>
            
            <div className="space-y-2 mb-6">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Membros
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Etiquetas
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <CheckSquare className="h-4 w-4 mr-2" />
                Lista de verificação
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Data de vencimento
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Anexo
              </Button>
            </div>

            <h3 className="font-medium mb-4">Ações</h3>
            
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Mover
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Copiar
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                Arquivar
              </Button>
              <Button variant="destructive" className="w-full justify-start" size="sm">
                Excluir
              </Button>
            </div>

            {/* Current assignees */}
            {card.assignees.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Membros</h4>
                <div className="flex flex-wrap gap-2">
                  {card.assignees.map(member => (
                    <div key={member.id} className="flex items-center gap-2 bg-background rounded p-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due date */}
            {card.dueDate && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Data de vencimento</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(card.dueDate).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};