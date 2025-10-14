import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  GripVertical,
  MoreHorizontal,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProjectCard, Checklist, ChecklistItem } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { generateId } from "@/hooks/useUuid";
import { ChecklistTemplateDialog } from "@/components/projects/ChecklistTemplateDialog";
import { getInitials } from "@/lib/utils";

interface ChecklistManagerProps {
  card?: ProjectCard;
  checklists?: Checklist[];
  onChecklistsChange?: (checklists: Checklist[]) => void;
  isCreationMode?: boolean;
}

export const ChecklistManager = ({ 
  card, 
  checklists, 
  onChecklistsChange,
  isCreationMode = false 
}: ChecklistManagerProps) => {
  const { actions, state } = useProjects();
  
  // Use either card checklists or provided checklists
  const currentChecklists = isCreationMode ? (checklists || []) : (card?.checklists || []);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showNewChecklistForm, setShowNewChecklistForm] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [showNewItemForms, setShowNewItemForms] = useState<Record<string, boolean>>({});
  const [openAssigneePopovers, setOpenAssigneePopovers] = useState<Record<string, boolean>>({});
  
  // FASE 6: Ref para debounce de updates
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const handleAddChecklist = (title?: string, items?: string[]) => {
    const checklistTitle = title || newChecklistTitle.trim();
    if (checklistTitle) {
      const checklistItems: ChecklistItem[] = items
        ? items.map(text => ({
            id: generateId(),
            text,
            completed: false
          }))
        : [];

      const newChecklist: Checklist = {
        id: generateId(),
        title: checklistTitle,
        items: checklistItems
      };
      
      if (isCreationMode && onChecklistsChange) {
        onChecklistsChange([...currentChecklists, newChecklist]);
      } else if (card) {
        actions.updateCard({
          ...card,
          checklists: [...card.checklists, newChecklist]
        });
      }
      
      setNewChecklistTitle('');
      setShowNewChecklistForm(false);
    }
  };

  const handleSelectTemplate = (templateId: string, title: string, items: string[]) => {
    handleAddChecklist(title, items);
  };

  const handleDeleteChecklist = (checklistId: string) => {
    if (isCreationMode && onChecklistsChange) {
      onChecklistsChange(currentChecklists.filter(cl => cl.id !== checklistId));
    } else if (card) {
      actions.updateCard({
        ...card,
        checklists: card.checklists.filter(cl => cl.id !== checklistId)
      });
    }
  };

  const handleAddItem = (checklistId: string) => {
    const itemText = newItemTexts[checklistId];
    if (itemText?.trim()) {
      const newItem: ChecklistItem = {
        id: generateId(),
        text: itemText.trim(),
        completed: false
      };

      const updatedChecklists = currentChecklists.map(cl => 
        cl.id === checklistId 
          ? { ...cl, items: [...cl.items, newItem] }
          : cl
      );

      if (isCreationMode && onChecklistsChange) {
        onChecklistsChange(updatedChecklists);
      } else if (card) {
        actions.updateCard({
          ...card,
          checklists: updatedChecklists
        });
        // Add activity for new checklist item
        actions.addActivity(card.id, 'checklist', `adicionou "${itemText.trim()}" à lista`);
      }

      setNewItemTexts(prev => ({ ...prev, [checklistId]: '' }));
      setShowNewItemForms(prev => ({ ...prev, [checklistId]: false }));
    }
  };

  const handleToggleItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = currentChecklists.map(cl => 
      cl.id === checklistId 
        ? {
            ...cl,
            items: cl.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : cl
    );

    if (isCreationMode && onChecklistsChange) {
      onChecklistsChange(updatedChecklists);
    } else if (card) {
      actions.updateCard({
        ...card,
        checklists: updatedChecklists
      });
      
      // Add activity for checklist completion
      const checklistItem = card.checklists
        .find(cl => cl.id === checklistId)?.items
        .find(item => item.id === itemId);
      
      if (checklistItem) {
        actions.addActivity(
          card.id, 
          'checklist', 
          checklistItem.completed 
            ? `desmarcou "${checklistItem.text}"` 
            : `completou "${checklistItem.text}"`
        );
      }
    }
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = currentChecklists.map(cl => 
      cl.id === checklistId 
        ? { ...cl, items: cl.items.filter(item => item.id !== itemId) }
        : cl
    );

    if (isCreationMode && onChecklistsChange) {
      onChecklistsChange(updatedChecklists);
    } else if (card) {
      actions.updateCard({
        ...card,
        checklists: updatedChecklists
      });
    }
  };

  const getChecklistProgress = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return (completed / checklist.items.length) * 100;
  };

  const handleAssigneeChange = (checklistId: string, itemId: string, assigneeId: string | null) => {
    // Close popover immediately for better UX
    const popoverKey = `${checklistId}-${itemId}`;
    setOpenAssigneePopovers(prev => ({ ...prev, [popoverKey]: false }));

    const updatedChecklists = currentChecklists.map(cl => 
      cl.id === checklistId 
        ? {
            ...cl,
            items: cl.items.map(item =>
              item.id === itemId ? { ...item, assignee: assigneeId || undefined } : item
            )
          }
        : cl
    );

    if (isCreationMode && onChecklistsChange) {
      onChecklistsChange(updatedChecklists);
    } else if (card) {
      // FASE 6: Debounce database update para reduzir chamadas
      // Clear timeout anterior
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Update com debounce de 300ms
      updateTimeoutRef.current = setTimeout(() => {
        actions.updateCard({
          ...card,
          checklists: updatedChecklists
        });
      }, 300);
    }
  };

  const getAssigneeInfo = (assigneeId?: string) => {
    if (!assigneeId || !card) return null;
    return card.assignees.find(a => a.id === assigneeId);
  };

  return (
    <div className="space-y-4">
      {currentChecklists.length === 0 && !showNewChecklistForm && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma lista de verificação ainda</p>
          <p className="text-xs">Adicione uma lista para organizar suas tarefas</p>
        </div>
      )}
      
      {currentChecklists.map(checklist => (
        <div key={checklist.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <h3 className="font-medium">{checklist.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); handleDeleteChecklist(checklist.id); }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {checklist.items.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {checklist.items.filter(item => item.completed).length} de {checklist.items.length}
                </span>
                <span>{Math.round(getChecklistProgress(checklist))}%</span>
              </div>
              <Progress value={getChecklistProgress(checklist)} className="h-1" />
            </div>
          )}

          <div className="space-y-2 pl-6">
            {checklist.items.map(item => {
              const assignee = getAssigneeInfo(item.assignee);
              const popoverKey = `${checklist.id}-${item.id}`;
              return (
                <div key={item.id} className="flex items-center gap-2 group" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => handleToggleItem(checklist.id, item.id)}
                  />
                  <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.text}
                  </span>
                  
                  {/* Avatar sempre visível do responsável */}
                  {assignee ? (
                    <Avatar className="h-5 w-5 flex-shrink-0">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-5 w-5 flex-shrink-0" />
                  )}
                  
                  {/* Assignee selector - aparece no hover */}
                  <Popover 
                    open={openAssigneePopovers[popoverKey]}
                    onOpenChange={(open) => setOpenAssigneePopovers(prev => ({ ...prev, [popoverKey]: open }))}
                  >
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <User className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <div className="text-sm font-medium mb-2">Atribuir a</div>
                        {card?.assignees && card.assignees.length > 0 ? (
                          <>
                            {card.assignees.map(member => (
                              <Button
                                key={member.id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssigneeChange(checklist.id, item.id, member.id);
                                }}
                              >
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{member.name}</span>
                              </Button>
                            ))}
                            {assignee && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssigneeChange(checklist.id, item.id, null);
                                }}
                              >
                                Remover responsável
                              </Button>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground py-2">
                            Nenhum membro atribuído ao card
                          </p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); handleDeleteItem(checklist.id, item.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}

            {showNewItemForms[checklist.id] ? (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={newItemTexts[checklist.id] || ''}
                  onChange={(e) => setNewItemTexts(prev => ({ 
                    ...prev, 
                    [checklist.id]: e.target.value 
                  }))}
                  placeholder="Adicionar item..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItem(checklist.id);
                    } else if (e.key === 'Escape') {
                      setShowNewItemForms(prev => ({ ...prev, [checklist.id]: false }));
                      setNewItemTexts(prev => ({ ...prev, [checklist.id]: '' }));
                    }
                  }}
                  autoFocus
                />
                <Button onClick={(e) => { e.stopPropagation(); handleAddItem(checklist.id); }}>
                  Adicionar
                </Button>
                <Button 
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewItemForms(prev => ({ ...prev, [checklist.id]: false }));
                    setNewItemTexts(prev => ({ ...prev, [checklist.id]: '' }));
                  }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={(e) => { e.stopPropagation(); setShowNewItemForms(prev => ({ ...prev, [checklist.id]: true })); }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar item
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Add new checklist */}
      {showNewChecklistForm ? (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <Input
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="Título da lista de verificação"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddChecklist();
              } else if (e.key === 'Escape') {
                setShowNewChecklistForm(false);
                setNewChecklistTitle('');
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={(e) => { e.stopPropagation(); handleAddChecklist(); }}>
              Adicionar
            </Button>
            <Button 
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewChecklistForm(false);
                setNewChecklistTitle('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={(e) => { 
            e.stopPropagation(); 
            setShowTemplateDialog(true);
          }}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Lista de verificação
        </Button>
      )}

      {/* Template Dialog */}
      <ChecklistTemplateDialog
        isOpen={showTemplateDialog}
        onClose={() => setShowTemplateDialog(false)}
        onSelectTemplate={handleSelectTemplate}
        onCreateEmpty={() => setShowNewChecklistForm(true)}
        boardId={state.currentBoard?.id}
      />
    </div>
  );
};