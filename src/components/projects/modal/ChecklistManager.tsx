import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  GripVertical,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectCard, Checklist, ChecklistItem } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { generateId } from "@/hooks/useUuid";

interface ChecklistManagerProps {
  card: ProjectCard;
}

export const ChecklistManager = ({ card }: ChecklistManagerProps) => {
  const { actions } = useProjects();
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showNewChecklistForm, setShowNewChecklistForm] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [showNewItemForms, setShowNewItemForms] = useState<Record<string, boolean>>({});

  const handleAddChecklist = () => {
    if (newChecklistTitle.trim()) {
      const newChecklist: Checklist = {
        id: generateId(),
        title: newChecklistTitle.trim(),
        items: []
      };
      
      actions.updateCard({
        ...card,
        checklists: [...card.checklists, newChecklist]
      });
      
      setNewChecklistTitle('');
      setShowNewChecklistForm(false);
    }
  };

  const handleDeleteChecklist = (checklistId: string) => {
    actions.updateCard({
      ...card,
      checklists: card.checklists.filter(cl => cl.id !== checklistId)
    });
  };

  const handleAddItem = (checklistId: string) => {
    const itemText = newItemTexts[checklistId];
    if (itemText?.trim()) {
      const newItem: ChecklistItem = {
        id: generateId(),
        text: itemText.trim(),
        completed: false
      };

      const updatedChecklists = card.checklists.map(cl => 
        cl.id === checklistId 
          ? { ...cl, items: [...cl.items, newItem] }
          : cl
      );

      actions.updateCard({
        ...card,
        checklists: updatedChecklists
      });

      setNewItemTexts(prev => ({ ...prev, [checklistId]: '' }));
      setShowNewItemForms(prev => ({ ...prev, [checklistId]: false }));
    }
  };

  const handleToggleItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = card.checklists.map(cl => 
      cl.id === checklistId 
        ? {
            ...cl,
            items: cl.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            )
          }
        : cl
    );

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
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    const updatedChecklists = card.checklists.map(cl => 
      cl.id === checklistId 
        ? { ...cl, items: cl.items.filter(item => item.id !== itemId) }
        : cl
    );

    actions.updateCard({
      ...card,
      checklists: updatedChecklists
    });
  };

  const getChecklistProgress = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return (completed / checklist.items.length) * 100;
  };

  return (
    <div className="space-y-4">
      {card.checklists.map(checklist => (
        <div key={checklist.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <h3 className="font-medium">{checklist.title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  onClick={() => handleDeleteChecklist(checklist.id)}
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
            {checklist.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 group">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggleItem(checklist.id, item.id)}
                />
                <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {item.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteItem(checklist.id, item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {showNewItemForms[checklist.id] ? (
              <div className="flex gap-2">
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
                <Button onClick={() => handleAddItem(checklist.id)}>
                  Adicionar
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => {
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
                onClick={() => setShowNewItemForms(prev => ({ ...prev, [checklist.id]: true }))}
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
        <div className="space-y-2">
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
            <Button onClick={handleAddChecklist}>
              Adicionar
            </Button>
            <Button 
              variant="ghost"
              onClick={() => {
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
          onClick={() => setShowNewChecklistForm(true)}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Lista de verificação
        </Button>
      )}
    </div>
  );
};