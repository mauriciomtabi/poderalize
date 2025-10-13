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
import { X, Calendar, Users, Tag, Clock, MessageCircle, CheckSquare, Activity, Paperclip, Plus, Edit2, Trash2, Copy, Archive, Move, Building2 } from "lucide-react";
import { ProjectCard, Member, Label as ProjectLabel, ChecklistItem, Checklist, Comment, Attachment, CardStatus, Priority } from "@/types/projects";
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
import { ClientPicker } from "./ClientPicker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useClientes } from "@/hooks/useClientes";
interface CardDetailModalProps {
  card?: ProjectCard;
  listId?: string;
  isOpen: boolean;
  onClose: () => void;
}
export const CardDetailModal = ({
  card,
  listId,
  isOpen,
  onClose
}: CardDetailModalProps) => {
  const { toast } = useToast();
  const {
    actions,
    state
  } = useProjects();
  
  const isCreationMode = !card;
  const { clientes } = useClientes();
  
  const [isEditingTitle, setIsEditingTitle] = useState(isCreationMode);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [selectedMembers, setSelectedMembers] = useState<Member[]>(card?.assignees || []);
  const [selectedLabels, setSelectedLabels] = useState<ProjectLabel[]>(card?.labels || []);
  const [selectedDueDate, setSelectedDueDate] = useState<string | undefined>(card?.dueDate);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(card?.client_id);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Temporary states for creation mode
  const [tempChecklists, setTempChecklists] = useState<Checklist[]>([]);
  const [tempComments, setTempComments] = useState<Comment[]>([]);
  const [tempAttachments, setTempAttachments] = useState<any[]>([]);

  // Dialog states
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showAttachmentManager, setShowAttachmentManager] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showArchiveConfirmation, setShowArchiveConfirmation] = useState(false);
  const availableMembers = state.currentBoard?.members || [];
  const availableLabels = state.currentBoard?.labels || [];

  // Get the latest card data from global state to eliminate delays
  const latestCard = useMemo(() => {
    if (isCreationMode || !card || !state.currentBoard) return null;
    for (const list of state.currentBoard.lists) {
      const foundCard = list.cards.find(c => c.id === card.id);
      if (foundCard) return foundCard;
    }
    return card;
  }, [state.currentBoard, card, isCreationMode]);

  // Sync local state when latestCard changes (edit mode only)
  useEffect(() => {
    if (!isCreationMode && latestCard) {
      setTitle(latestCard.title);
      setDescription(latestCard.description || '');
      setSelectedMembers(latestCard.assignees);
      setSelectedLabels(latestCard.labels);
      setSelectedDueDate(latestCard.dueDate);
      setSelectedClientId(latestCard.client_id);
    }
  }, [latestCard, isCreationMode]);

  // Reset all fields when opening modal in creation mode
  useEffect(() => {
    if (isOpen && isCreationMode) {
      setTitle('');
      setDescription('');
      setSelectedMembers([]);
      setSelectedLabels([]);
      setSelectedDueDate(undefined);
      setSelectedClientId(undefined);
      setTempChecklists([]);
      setTempComments([]);
      setTempAttachments([]);
      setIsEditingTitle(true);
      setIsEditingDescription(false);
    }
  }, [isOpen, isCreationMode]);
  const completedTasks = latestCard?.checklists.reduce((acc, checklist) => acc + checklist.items.filter(item => item.completed).length, 0) || 0;
  const totalTasks = latestCard?.checklists.reduce((acc, checklist) => acc + checklist.items.length, 0) || 0;
  const progress = totalTasks > 0 ? completedTasks / totalTasks * 100 : 0;
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
    if (isCreationMode) {
      setIsEditingTitle(false);
      return;
    }
    
    if (latestCard && title.trim() && title !== latestCard.title) {
      actions.updateCard({
        ...latestCard,
        title: title.trim()
      });
      actions.addActivity(latestCard.id, 'update', `alterou o título para "${title.trim()}"`);
    } else if (latestCard) {
      setTitle(latestCard.title);
    }
    setIsEditingTitle(false);
  };
  const handleSaveDescription = () => {
    if (isCreationMode) {
      setIsEditingDescription(false);
      return;
    }
    
    if (latestCard && description !== (latestCard.description || '')) {
      actions.updateCard({
        ...latestCard,
        description: description.trim()
      });
      actions.addActivity(latestCard.id, 'update', `alterou a descrição`);
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
      if (!isCreationMode && latestCard) {
        setTitle(latestCard.title);
        setDescription(latestCard.description || '');
      }
    }
  };
  const toggleLabel = (labelId: string) => {
    if (isCreationMode) {
      const hasLabel = selectedLabels.some(l => l.id === labelId);
      const label = availableLabels.find(l => l.id === labelId);
      const newLabels = hasLabel 
        ? selectedLabels.filter(l => l.id !== labelId) 
        : [...selectedLabels, label!];
      setSelectedLabels(newLabels);
      return;
    }
    
    if (!latestCard) return;
    const hasLabel = latestCard.labels.some(l => l.id === labelId);
    const label = availableLabels.find(l => l.id === labelId);
    const newLabels = hasLabel ? latestCard.labels.filter(l => l.id !== labelId) : [...latestCard.labels, label!];
    
    actions.updateCard({
      ...latestCard,
      labels: newLabels
    });
    
    if (label) {
      actions.addActivity(
        latestCard.id, 
        'label', 
        hasLabel ? `removeu a etiqueta "${label.name}"` : `adicionou a etiqueta "${label.name}"`
      );
    }
  };
  const toggleMember = (memberId: string) => {
    if (isCreationMode) {
      const hasMember = selectedMembers.some(m => m.id === memberId);
      const member = availableMembers.find(m => m.id === memberId);
      const newAssignees = hasMember 
        ? selectedMembers.filter(m => m.id !== memberId) 
        : [...selectedMembers, member!];
      setSelectedMembers(newAssignees);
      return;
    }
    
    if (!latestCard) return;
    const hasMember = latestCard.assignees.some(m => m.id === memberId);
    const member = availableMembers.find(m => m.id === memberId);
    const newAssignees = hasMember ? latestCard.assignees.filter(m => m.id !== memberId) : [...latestCard.assignees, member!];
    
    actions.updateCard({
      ...latestCard,
      assignees: newAssignees
    });
    
    if (member) {
      actions.addActivity(
        latestCard.id, 
        'assign', 
        hasMember ? `removeu ${member.name}` : `atribuiu a ${member.name}`
      );
    }
  };

  // Sidebar action handlers
  const handleMembersChange = (members: Member[]) => {
    if (isCreationMode) {
      setSelectedMembers(members);
      return;
    }
    
    if (!latestCard) return;
    const addedMembers = members.filter(m => !latestCard.assignees.some(la => la.id === m.id));
    const removedMembers = latestCard.assignees.filter(la => !members.some(m => m.id === la.id));
    actions.updateCard({
      ...latestCard,
      assignees: members
    });
    addedMembers.forEach(member => {
      actions.addActivity(latestCard.id, 'assign', `atribuiu ${member.name}`);
    });
    removedMembers.forEach(member => {
      actions.addActivity(latestCard.id, 'assign', `removeu ${member.name}`);
    });
  };
  const handleLabelsChange = (labels: ProjectLabel[]) => {
    if (isCreationMode) {
      setSelectedLabels(labels);
      return;
    }
    
    if (!latestCard) return;
    actions.updateCard({
      ...latestCard,
      labels
    });
  };
  const handleDueDateChange = (dueDate?: string) => {
    if (isCreationMode) {
      setSelectedDueDate(dueDate);
      return;
    }
    
    if (!latestCard) return;
    actions.updateCard({
      ...latestCard,
      dueDate
    });
    if (dueDate && dueDate !== latestCard.dueDate) {
      actions.addActivity(latestCard.id, 'due_date', `definiu data de vencimento para ${new Date(dueDate).toLocaleDateString('pt-BR')}`);
    } else if (!dueDate && latestCard.dueDate) {
      actions.addActivity(latestCard.id, 'due_date', 'removeu a data de vencimento');
    }
  };

  const handleClientChange = (clientId?: string | null) => {
    if (isCreationMode) {
      setSelectedClientId(clientId ?? undefined);
      return;
    }
    
    if (!latestCard) return;

    // Normalize undefined to null for DB updates
    const newClientId = clientId ?? null;

    // Update local state immediately for visual feedback
    setSelectedClientId(clientId ?? undefined);
    
    actions.updateCard({
      ...latestCard,
      client_id: newClientId as any
    });
    
    const cliente = clientes.find(c => c.id === (clientId ?? undefined));
    if (clientId && clientId !== latestCard.client_id && cliente) {
      actions.addActivity(latestCard.id, 'update', `associou o cliente ${cliente.nome}`);
    } else if (!clientId && latestCard.client_id) {
      actions.addActivity(latestCard.id, 'update', 'removeu a associação com cliente');
    }
  };

  const handleCreateCard = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    if (!listId) return;
    
    const currentUser = actions.getCurrentUser();
    if (!currentUser) return;
    
    const success = await actions.addCard(listId, {
      title: title.trim(),
      description: description.trim(),
      status: 'todo' as CardStatus,
      priority: 'medium' as Priority,
      createdBy: currentUser.id,
      listId: listId,
      assignees: selectedMembers,
      labels: selectedLabels,
      checklists: tempChecklists,
      attachments: tempAttachments,
      comments: tempComments,
      archived: false,
      watching: false,
      dueDate: selectedDueDate,
      client_id: selectedClientId
    });
    
    if (success) {
      toast({
        title: "Sucesso",
        description: "Cartão criado com sucesso!"
      });
      onClose();
    }
  };
  
  const handleDuplicate = () => {
    if (!latestCard) return;
    actions.duplicateCard(latestCard.id);
    onClose();
  };
  const handleArchive = () => {
    if (!latestCard) return;
    actions.archiveCard(latestCard.id);
    onClose();
  };
  const handleDelete = () => {
    if (!latestCard) return;
    actions.deleteCard(latestCard.id);
    onClose();
  };
  const handleMoveCard = (destListId: string) => {
    if (!latestCard) return;
    const currentList = state.currentBoard?.lists.find(l => l.id === latestCard.listId);
    if (currentList) {
      const destList = state.currentBoard?.lists.find(l => l.id === destListId);
      if (destList) {
        actions.moveCard(latestCard.id, latestCard.listId, destListId, destList.cards.length);
      }
    }
  };
  const handleAddChecklist = () => {
    if (isCreationMode || !latestCard) return;
    
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
  const cardLabels = isCreationMode ? selectedLabels : (latestCard?.labels || []);
  const cardAssignees = isCreationMode ? selectedMembers : (latestCard?.assignees || []);
  const cardDueDate = isCreationMode ? selectedDueDate : latestCard?.dueDate;
  
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
        <DialogTitle className="sr-only">
          {isCreationMode ? 'Descrição da Tarefa' : 'Detalhes do cartão'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {isCreationMode ? 'Preencha as informações da nova tarefa' : 'Visualize e edite as informações do cartão.'}
        </DialogDescription>
        <div className="flex h-full min-h-[70vh]">
          {/* Main Content with ScrollArea */}
            <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[80vh] p-6">
              <div className="space-y-6">
                {/* Header with title */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                    {isCreationMode && (
                      <h2 className="text-lg font-semibold text-primary mb-2">
                        Descrição da Tarefa
                      </h2>
                    )}
                    {isEditingTitle ? (
                      <Input 
                        ref={titleInputRef} 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        onBlur={handleSaveTitle} 
                        onKeyDown={e => handleKeyDown(e, handleSaveTitle)} 
                        className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0" 
                        placeholder={isCreationMode ? "Digite o título da tarefa..." : ""}
                      />
                    ) : (
                      <h2 className="text-lg font-semibold cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors" onClick={() => setIsEditingTitle(true)}>
                        {title || (isCreationMode ? "Digite o título da tarefa..." : "")}
                      </h2>
                    )}
                    {!isCreationMode && latestCard && (
                      <p className="text-sm text-muted-foreground mt-1">
                        na lista <span className="font-medium">{state.currentBoard?.lists.find(l => l.id === latestCard.listId)?.title}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Assignees next to title */}
                    {cardAssignees.length > 0 && (
                      <div className="flex -space-x-2">
                        {cardAssignees.slice(0, 4).map(member => (
                          <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                    {/* Label dots next to title */}
                    {cardLabels.length > 0 && (
                      <div className="flex items-center gap-1">
                        {cardLabels.slice(0, 5).map(label => (
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

                {/* Labels */}
                {cardLabels.length > 0 && <div className="space-y-2">
                    <h3 className="text-sm font-medium">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                      {cardLabels.map(label => <Badge key={label.id} style={{
                    backgroundColor: label.color
                  }} className="text-white">
                          {label.name}
                        </Badge>)}
                    </div>
                  </div>}

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Edit2 className="h-4 w-4" />
                    <h3 className="font-medium">Descrição</h3>
                  </div>
                  {isEditingDescription ? <Textarea ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} onBlur={handleSaveDescription} onKeyDown={e => handleKeyDown(e, handleSaveDescription)} placeholder="Adicione uma descrição mais detalhada..." className="min-h-[100px] resize-none" /> : <div className={cn("min-h-[60px] p-2 rounded border border-transparent cursor-pointer hover:border-border hover:bg-muted/50 transition-colors", !description && "text-muted-foreground")} onClick={() => setIsEditingDescription(true)}>
                      {description || "Adicione uma descrição mais detalhada..."}
                    </div>}
                </div>

                {/* Cliente */}
                {selectedClientId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <h3 className="font-medium">Cliente</h3>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {(() => {
                          const cliente = clientes.find(c => c.id === selectedClientId);
                          return cliente ? (
                            <>
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={cliente.avatar_url} alt={cliente.nome} />
                                <AvatarFallback>
                                  <Building2 className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{cliente.nome}</p>
                                <p className="text-xs text-muted-foreground">{cliente.empresa}</p>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Cliente não encontrado</p>
                          );
                        })()}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleClientChange(undefined)}
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress */}
                {!isCreationMode && totalTasks > 0 && <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      <h3 className="font-medium">Progresso</h3>
                      <span className="text-sm text-muted-foreground">
                        {completedTasks}/{totalTasks} tarefas
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>}

                {/* Checklists */}
                {isCreationMode ? (
                  <ChecklistManager 
                    checklists={tempChecklists}
                    onChecklistsChange={setTempChecklists}
                    isCreationMode={true}
                  />
                ) : latestCard ? (
                  <ChecklistManager card={latestCard} />
                ) : null}

                {/* Comments */}
                {isCreationMode ? (
                  <CommentsSection 
                    comments={tempComments}
                    onCommentsChange={setTempComments}
                    isCreationMode={true}
                  />
                ) : latestCard ? (
                  <CommentsSection card={latestCard} />
                ) : null}

                {/* Activity - only in edit mode */}
                {!isCreationMode && latestCard && <ActivityHistory card={latestCard} />}
                
                {/* Create button in creation mode */}
                {isCreationMode && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleCreateCard} className="flex-1">
                      Criar Cartão
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="w-64 border-l bg-muted/30 flex-shrink-0">
            <ScrollArea className="h-[80vh] p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Adicionar ao cartão</h3>
                
                <div className="space-y-2 mb-6">
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setShowMemberPicker(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Membros
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setShowLabelPicker(true)}>
                    <Tag className="h-4 w-4 mr-2" />
                    Etiquetas
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setShowClientPicker(true)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Cliente
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setShowDueDatePicker(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Data de vencimento
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setShowAttachmentManager(true)}>
                    <Paperclip className="h-4 w-4 mr-2" />
                    Anexo
                  </Button>
                </div>

                {!isCreationMode && <h3 className="text-sm font-medium">Ações</h3>}
                
                {!isCreationMode && (
                  <div className="space-y-2 mb-6">
                    <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setShowMoveDialog(true)}>
                      <Move className="h-4 w-4 mr-2" />
                      Mover
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm" onClick={handleDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setShowArchiveConfirmation(true)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivar
                    </Button>
                    <Button variant="destructive" className="w-full justify-start" size="sm" onClick={() => setShowDeleteConfirmation(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                )}

                {/* Current assignees */}
                {cardAssignees.length > 0 && <div>
                    <h4 className="text-sm font-medium mb-2">Membros</h4>
                    <div className="flex flex-wrap gap-2">
                      {cardAssignees.map(member => <div key={member.id} className="flex items-center gap-2 bg-background rounded p-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                        </div>)}
                    </div>
                  </div>}

                {/* Due date */}
                {cardDueDate && <div>
                    <h4 className="text-sm font-medium mb-2">Data de vencimento</h4>
                    <div className="flex items-center gap-2 text-sm bg-background rounded p-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(cardDueDate).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                      </span>
                    </div>
                  </div>}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Dialogs */}
        <MemberPicker isOpen={showMemberPicker} onClose={() => setShowMemberPicker(false)} availableMembers={availableMembers} selectedMembers={cardAssignees} onMembersChange={handleMembersChange} />

        <LabelPicker isOpen={showLabelPicker} onClose={() => setShowLabelPicker(false)} availableLabels={availableLabels} selectedLabels={cardLabels} onLabelsChange={handleLabelsChange} />

        <DueDatePicker isOpen={showDueDatePicker} onClose={() => setShowDueDatePicker(false)} currentDate={cardDueDate} onDateChange={handleDueDateChange} />

        <ClientPicker
          isOpen={showClientPicker}
          onClose={() => setShowClientPicker(false)}
          selectedClientId={selectedClientId}
          onSelectClient={(client) => handleClientChange(client ? client.id : null)}
        />

        {/* Attachment Manager - works in both modes */}
        {isCreationMode ? (
          <AttachmentManager 
            isOpen={showAttachmentManager} 
            onClose={() => setShowAttachmentManager(false)} 
            attachments={tempAttachments}
            onAttachmentsChange={setTempAttachments}
            isCreationMode={true}
          />
        ) : latestCard ? (
          <AttachmentManager 
            isOpen={showAttachmentManager} 
            onClose={() => setShowAttachmentManager(false)} 
            card={latestCard} 
          />
        ) : null}

        {/* Dialogs only for edit mode */}
        {!isCreationMode && latestCard && (
          <>
            <ConfirmationDialog isOpen={showDeleteConfirmation} onClose={() => setShowDeleteConfirmation(false)} onConfirm={handleDelete} title="Excluir Cartão" description="Tem certeza de que deseja excluir este cartão? Esta ação não pode ser desfeita." confirmText="Excluir" variant="destructive" />

            <ConfirmationDialog isOpen={showArchiveConfirmation} onClose={() => setShowArchiveConfirmation(false)} onConfirm={handleArchive} title="Arquivar Cartão" description="Tem certeza de que deseja arquivar este cartão?" confirmText="Arquivar" />

            <MoveCardDialog isOpen={showMoveDialog} onClose={() => setShowMoveDialog(false)} currentListId={latestCard.listId} availableLists={state.currentBoard?.lists || []} onMove={handleMoveCard} />
          </>
        )}
      </DialogContent>
    </Dialog>;
};