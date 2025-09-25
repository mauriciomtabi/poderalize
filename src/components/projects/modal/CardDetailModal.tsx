import { useState, useRef, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  Trash2,
  Copy,
  Archive,
  Move
} from "lucide-react";
import { ProjectCard, Member, Label as ProjectLabel, ChecklistItem, Checklist, Comment } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { ChecklistManager } from "./ChecklistManager";
import { CommentsSection } from "./CommentsSection";
import { ActivityHistory } from "./ActivityHistory";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { MemberPicker } from "./MemberPicker";
import { LabelPicker } from "./LabelPicker";
import { DueDatePicker } from "./DueDatePicker";
import { MoveCardDialog } from "./MoveCardDialog";
import { AttachmentManager } from "./AttachmentManager";
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

  // Dialog states
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showAttachmentManager, setShowAttachmentManager] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showArchiveConfirmation, setShowArchiveConfirmation] = useState(false);

  const availableMembers = state.currentBoard?.members || [];
  const availableLabels = state.currentBoard?.labels || [];

  // Get the latest card data from global state to eliminate delays
  const latestCard = useMemo(() => {
    if (!state.currentBoard) return card;
    
    for (const list of state.currentBoard.lists) {
      const foundCard = list.cards.find(c => c.id === card.id);
      if (foundCard) return foundCard;
    }
    return card;
  }, [state.currentBoard, card.id, card]);

  // Sync local state when latestCard changes
  useEffect(() => {
    setTitle(latestCard.title);
    setDescription(latestCard.description || '');
  }, [latestCard.title, latestCard.description, latestCard.id]);

  const completedTasks = latestCard.checklists.reduce((acc, checklist) => 
    acc + checklist.items.filter(item => item.completed).length, 0
  );
  const totalTasks = latestCard.checklists.reduce((acc, checklist) => 
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
    if (title.trim() && title !== latestCard.title) {
      actions.updateCard({ ...latestCard, title: title.trim() });
    } else {
      setTitle(latestCard.title);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (description !== (latestCard.description || '')) {
      actions.updateCard({ ...latestCard, description: description.trim() });
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
      setTitle(latestCard.title);
      setDescription(latestCard.description || '');
    }
  };

  const toggleLabel = (labelId: string) => {
    const hasLabel = latestCard.labels.some(l => l.id === labelId);
    const newLabels = hasLabel 
      ? latestCard.labels.filter(l => l.id !== labelId)
      : [...latestCard.labels, availableLabels.find(l => l.id === labelId)!];
    
    actions.updateCard({ ...latestCard, labels: newLabels });
  };

  const toggleMember = (memberId: string) => {
    const hasMember = latestCard.assignees.some(m => m.id === memberId);
    const newAssignees = hasMember
      ? latestCard.assignees.filter(m => m.id !== memberId)
      : [...latestCard.assignees, availableMembers.find(m => m.id === memberId)!];
    
    actions.updateCard({ ...latestCard, assignees: newAssignees });
  };

  // Sidebar action handlers
  const handleMembersChange = (members: Member[]) => {
    const addedMembers = members.filter(m => !latestCard.assignees.some(la => la.id === m.id));
    const removedMembers = latestCard.assignees.filter(la => !members.some(m => m.id === la.id));
    
    actions.updateCard({ ...latestCard, assignees: members });
    
    addedMembers.forEach(member => {
      actions.addActivity(latestCard.id, 'assign', `atribuiu ${member.name}`);
    });
    removedMembers.forEach(member => {
      actions.addActivity(latestCard.id, 'assign', `removeu ${member.name}`);
    });
  };

  const handleLabelsChange = (labels: ProjectLabel[]) => {
    actions.updateCard({ ...latestCard, labels });
  };

  const handleDueDateChange = (dueDate?: string) => {
    actions.updateCard({ ...latestCard, dueDate });
    
    if (dueDate && dueDate !== latestCard.dueDate) {
      actions.addActivity(latestCard.id, 'due_date', `definiu data de vencimento para ${new Date(dueDate).toLocaleDateString('pt-BR')}`);
    } else if (!dueDate && latestCard.dueDate) {
      actions.addActivity(latestCard.id, 'due_date', 'removeu a data de vencimento');
    }
  };

  const handleDuplicate = () => {
    actions.duplicateCard(latestCard.id);
    onClose();
  };

  const handleArchive = () => {
    actions.archiveCard(latestCard.id);
    onClose();
  };

  const handleDelete = () => {
    actions.deleteCard(latestCard.id);
    onClose();
  };

  const handleMoveCard = (destListId: string) => {
    const currentList = state.currentBoard?.lists.find(l => l.id === latestCard.listId);
    if (currentList) {
      const destList = state.currentBoard?.lists.find(l => l.id === destListId);
      if (destList) {
        actions.moveCard(latestCard.id, latestCard.listId, destListId, destList.cards.length);
      }
    }
  };

  const handleAddChecklist = () => {
    const newChecklist = {
      id: `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: "Lista de verificação",
      items: []
    };
    
    const updatedCard = {
      ...latestCard,
      checklists: [...latestCard.checklists, newChecklist]
    };
    
    actions.updateCard(updatedCard);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">Detalhes do cartão</DialogTitle>
        <DialogDescription className="sr-only">Visualize e edite as informações do cartão.</DialogDescription>
        <div className="flex h-full min-h-[70vh]">
          {/* Main Content with ScrollArea */}
          <div className="flex-1">
            <ScrollArea className="h-[80vh] p-6">
              <div className="space-y-6">
                {/* Header with title */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
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
                        {latestCard.title}
                      </h2>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      na lista <span className="font-medium">{state.currentBoard?.lists.find(l => l.id === latestCard.listId)?.title}</span>
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Labels */}
                {latestCard.labels.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                      {latestCard.labels.map(label => (
                        <Badge key={label.id} style={{ backgroundColor: label.color }} className="text-white">
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
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
                        !latestCard.description && "text-muted-foreground"
                      )}
                      onClick={() => setIsEditingDescription(true)}
                    >
                      {latestCard.description || "Adicione uma descrição mais detalhada..."}
                    </div>
                  )}
                </div>

                {/* Progress */}
                {totalTasks > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
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
                <ChecklistManager card={latestCard} />

                {/* Comments */}
                <CommentsSection card={latestCard} />

                {/* Activity */}
                <ActivityHistory card={latestCard} />
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l bg-muted/30 flex-shrink-0">
            <ScrollArea className="h-[80vh] p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Adicionar ao cartão</h3>
                
                <div className="space-y-2 mb-6">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setShowMemberPicker(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Membros
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setShowLabelPicker(true)}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Etiquetas
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={handleAddChecklist}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Lista de verificação
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setShowDueDatePicker(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Data de vencimento
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setShowAttachmentManager(true)}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Anexo
                  </Button>
                </div>

                <h3 className="text-sm font-medium">Ações</h3>
                
                <div className="space-y-2 mb-6">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setShowMoveDialog(true)}
                  >
                    <Move className="h-4 w-4 mr-2" />
                    Mover
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={handleDuplicate}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setShowArchiveConfirmation(true)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>

                {/* Current assignees */}
                {latestCard.assignees.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Membros</h4>
                    <div className="flex flex-wrap gap-2">
                      {latestCard.assignees.map(member => (
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
                {latestCard.dueDate && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Data de vencimento</h4>
                    <div className="flex items-center gap-2 text-sm bg-background rounded p-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(latestCard.dueDate).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Dialogs */}
        <MemberPicker
          isOpen={showMemberPicker}
          onClose={() => setShowMemberPicker(false)}
          availableMembers={availableMembers}
          selectedMembers={latestCard.assignees}
          onMembersChange={handleMembersChange}
        />

        <LabelPicker
          isOpen={showLabelPicker}
          onClose={() => setShowLabelPicker(false)}
          availableLabels={availableLabels}
          selectedLabels={latestCard.labels}
          onLabelsChange={handleLabelsChange}
        />

        <DueDatePicker
          isOpen={showDueDatePicker}
          onClose={() => setShowDueDatePicker(false)}
          currentDate={latestCard.dueDate}
          onDateChange={handleDueDateChange}
        />

        <ConfirmationDialog
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDelete}
          title="Excluir Cartão"
          description="Tem certeza de que deseja excluir este cartão? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          variant="destructive"
        />

        <ConfirmationDialog
          isOpen={showArchiveConfirmation}
          onClose={() => setShowArchiveConfirmation(false)}
          onConfirm={handleArchive}
          title="Arquivar Cartão"
          description="Tem certeza de que deseja arquivar este cartão?"
          confirmText="Arquivar"
        />

        <MoveCardDialog
          isOpen={showMoveDialog}
          onClose={() => setShowMoveDialog(false)}
          currentListId={latestCard.listId}
          availableLists={state.currentBoard?.lists || []}
          onMove={handleMoveCard}
        />

        <AttachmentManager
          isOpen={showAttachmentManager}
          onClose={() => setShowAttachmentManager(false)}
          card={latestCard}
        />
      </DialogContent>
    </Dialog>
  );
};