import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus,
  Clock
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/contexts/ProjectsContext";
import { useState, useRef, useEffect } from "react";
import { EnhancedProjectCard } from "../cards/EnhancedProjectCard";
import { AddListDialog } from "../dialogs/AddListDialog";
import { ListActionsDialog } from "../dialogs/ListActionsDialog";
import { CardDetailModal } from "../modal/CardDetailModal";
import { InlineEdit } from "@/components/kanban/InlineEdit";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { ProjectList, CardStatus, Priority } from "@/types/projects";
import { BoardAccessBanner } from "../BoardAccessBanner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";

// Helper to disable drop animation and prevent style artifacts
const getDropStyle = (style: any, snapshot: any) => {
  if (!style) return style;
  if (!snapshot.isDropAnimating) return style;
  return { ...style, transitionDuration: '0.001s' };
};

export const KanbanView = () => {
  const { state, actions } = useProjects();
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showAddListDialog, setShowAddListDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<ProjectList | null>(null);
  const [showListActionsDialog, setShowListActionsDialog] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isAdmin } = useAuthContext();
  const [hasBoardAccess, setHasBoardAccess] = useState<boolean | null>(null);
  const [dndKey, setDndKey] = useState(0);

  // Reset scroll to left when component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, []);

  // Check board access to show banner/prevent confusion
  useEffect(() => {
    const checkAccess = async () => {
      if (!state.currentBoard || !user) {
        setHasBoardAccess(null);
        return;
      }
      const { data, error } = await supabase.rpc('user_has_board_access', {
        _user_id: user.id,
        _board_id: state.currentBoard.id,
      });
      if (error) {
        console.warn('Erro ao verificar acesso ao board:', error);
        setHasBoardAccess(null);
      } else {
        setHasBoardAccess(Boolean(data));
      }
    };
    checkAccess();
  }, [state.currentBoard?.id, user?.id]);

  // Ensure real repaint even at scroll edges
  const directionAwareMicroScroll = (sc: HTMLDivElement | null) => {
    if (!sc) return;
    const atStart = sc.scrollLeft <= 0;
    const atEnd = sc.scrollLeft >= sc.scrollWidth - sc.clientWidth - 1;
    const delta = atEnd ? -1 : 1;
    sc.scrollBy({ left: delta, behavior: 'auto' });
    requestAnimationFrame(() => sc.scrollBy({ left: -delta, behavior: 'auto' }));
  };

  const forcePaint = (sc: HTMLDivElement | null) => {
    if (!sc) return;
    const prev = sc.style.transform;
    sc.style.transform = 'translateZ(0)';
    void sc.offsetHeight; // reflow
    sc.style.transform = prev;
  };

  const onDragStart = (start: any) => {
    actions.setDraggedItem({ 
      type: start.type?.startsWith('list') ? 'list' : 'card', 
      id: start.draggableId 
    });
  };
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    
    // Clear dragged item with a slight delay to prevent visual glitches
    setTimeout(() => {
      actions.setDraggedItem(null);
    }, 100);

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Global cleanup function to remove ALL DnD artifacts
    const cleanupGlobalDnD = () => {
      // Clean all draggable elements globally
      const selectors = '[data-rbd-draggable-id], [data-rbd-drag-handle-draggable-id], [data-rbd-droppable-id]';
      document.querySelectorAll(selectors).forEach((el) => {
        const node = el as HTMLElement;
        node.style.transform = '';
        node.style.transition = '';
        node.style.willChange = '';
      });
      
      // Clean placeholder artifacts
      document.querySelectorAll('[data-rbd-placeholder-context-id]').forEach((el) => {
        const node = el as HTMLElement;
        node.style.transform = '';
        node.style.height = '';
        node.style.width = '';
      });
    };

    // Handle list drag and drop
    if (type === 'LIST') {
      actions.moveList(draggableId, destination.index);
      
      requestAnimationFrame(() => {
        cleanupGlobalDnD();
        void document.body.offsetHeight; // Global reflow
        const sc = scrollContainerRef.current;
        directionAwareMicroScroll(sc);
        forcePaint(sc);
        window.dispatchEvent(new Event('resize'));
        setTimeout(() => setDndKey(k => k + 1), 0);
      });
      return;
    }

    // Handle card drag and drop
    actions.moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
    
    // Cleanup global após mover card
    requestAnimationFrame(() => {
      cleanupGlobalDnD();
      void document.body.offsetHeight; // Global reflow
      
      const sc = scrollContainerRef.current;
      directionAwareMicroScroll(sc);
      forcePaint(sc);
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => setDndKey(k => k + 1), 0);
      
      // Auto-scroll para lista de destino DEPOIS do cleanup
      setTimeout(() => {
        const targetEl = sc?.querySelector(`[data-list-id="${destination.droppableId}"]`) as HTMLElement | null;
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }, 100);
    });
  };

  const handleAddCard = async (listId: string) => {
    setSelectedListId(listId);
    setSelectedCard(undefined);
    setShowCardModal(true);
  };

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleEditCard = (card: any) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleAddList = () => {
    setShowAddListDialog(true);
  };

  const handleListActions = (list: ProjectList) => {
    setSelectedList(list);
    setShowListActionsDialog(true);
  };

  if (!state.currentBoard) {
    return <div className="flex items-center justify-center h-full">Nenhum projeto selecionado</div>;
  }

  return (
    <LoadingOverlay isLoading={state.isLoading}>
      {hasBoardAccess === false && (
        <BoardAccessBanner
          boardId={state.currentBoard.id}
          boardTitle={state.currentBoard.title}
          boardOwnerId={state.currentBoard.createdBy}
          isUserAdmin={isAdmin}
        />
      )}
      <div className="flex h-full min-w-0 min-h-0">
        <div 
          className="flex-1 min-w-0"
        >
          <div ref={scrollContainerRef} className="h-full overflow-x-auto overflow-y-hidden">
            <DragDropContext key={dndKey} onDragEnd={onDragEnd} onDragStart={onDragStart}>
              <Droppable droppableId="board" type="LIST" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="inline-flex gap-6 h-full w-max pl-6 pr-20 pb-8"
                  >
                    {state.currentBoard.lists
                      .filter(list => !list.archived)
                      .map((list, index) => {
                        // Apply filters to cards in this list (respect admin aggregated grouping)
                        const allowedIds = new Set(actions.getFilteredCards().map(c => c.id));
                        const filteredCards = (list.cards || []).filter(c => allowedIds.has(c.id));
                        
                        return (
                          <Draggable key={list.id} draggableId={list.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={getDropStyle(provided.draggableProps.style, snapshot)}
                                className={`flex-shrink-0 w-[336px] landscape:w-64 ${snapshot.isDragging ? 'rotate-2' : ''}`}
                                data-list-id={list.id}
                              >
                                <Card 
                                  className="flex flex-col kanban-column h-[calc(100vh-12rem)] landscape:h-[calc(100vh-8rem)]"
                                  style={{ backgroundColor: list.color }}
                                >
                                  <CardHeader 
                                    {...provided.dragHandleProps}
                                    className="pb-3 cursor-grab active:cursor-grabbing flex-shrink-0"
                                  >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <InlineEdit
                                            value={list.title}
                                            onSave={(newTitle) => actions.updateList(list.id, { title: newTitle })}
                                            className="text-sm font-semibold text-white drop-shadow-sm"
                                            placeholder="Título da lista"
                                          />
                                          <Badge variant="secondary" className="text-xs bg-black/20 text-white border-white/20 shadow-none">
                                            {filteredCards.length}
                                          </Badge>
                                          {(() => {
                                            const rules = typeof list.rules === 'string' 
                                              ? JSON.parse(list.rules || '{}') 
                                              : (list.rules || {});
                                            const autoArchiveDays = rules?.auto_archive_after_days;
                                            if (autoArchiveDays) {
                                              return (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Clock className="h-3.5 w-3.5 text-white/80 drop-shadow-sm" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>Arquivamento automático após {autoArchiveDays} dias</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              );
                                            }
                                            return null;
                                          })()}
                                        </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="text-white hover:bg-black/10">
                                            <MoreHorizontal size={16} />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                          <DropdownMenuItem onClick={() => handleAddCard(list.id)}>
                                            <Plus size={14} className="mr-2" />
                                            Adicionar cartão
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleListActions(list)}>
                                            ⚙️ Configurações da lista
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </CardHeader>

                                  <Droppable droppableId={list.id}>
                                    {(provided, snapshot) => (
                                      <CardContent
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 space-y-3 min-h-24 overflow-y-auto overflow-x-hidden px-2 ${
                                          snapshot.isDraggingOver ? "kanban-drop-zone" : ""
                                        }`}
                                      >
                        {filteredCards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getDropStyle(provided.draggableProps.style, snapshot)}
                                className={snapshot.isDragging ? "kanban-drag-preview" : ""}
                              >
                                                <EnhancedProjectCard
                                                  card={card}
                                                  onEdit={() => handleEditCard(card)}
                                                  onDelete={() => actions.deleteCard(card.id)}
                                                  onDuplicate={() => actions.duplicateCard(card.id)}
                                                  onClick={() => handleCardClick(card)}
                                                />
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        
                                        <Button
                                          variant="ghost"
                                          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
                                          onClick={() => handleAddCard(list.id)}
                                        >
                                          <Plus size={16} className="mr-2" />
                                          Adicionar cartão
                                        </Button>
                                      </CardContent>
                                    )}
                                  </Droppable>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}

                    {/* Add List Button */}
                    <div className="flex-shrink-0 w-[336px] landscape:w-64">
                      <Button
                        variant="ghost"
                        className="w-full h-20 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                        onClick={handleAddList}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Adicionar lista
                      </Button>
                    </div>
                    <div className="flex-shrink-0 w-6" />
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <CardDetailModal
          card={selectedCard}
          listId={selectedListId}
          isOpen={showCardModal}
          onClose={() => {
            setShowCardModal(false);
            setSelectedCard(null);
            setSelectedListId("");
          }}
        />

        <AddListDialog
          isOpen={showAddListDialog}
          onClose={() => setShowAddListDialog(false)}
          onCreateList={(title, color) => {
            actions.addList(title, color);
            setShowAddListDialog(false);
          }}
        />

        <ListActionsDialog
          list={selectedList}
          isOpen={showListActionsDialog}
          onClose={() => {
            setShowListActionsDialog(false);
            setSelectedList(null);
          }}
          onUpdateList={actions.updateList}
          onArchiveList={actions.archiveList}
          onDeleteList={actions.deleteList}
          onArchiveAllCards={actions.archiveAllCardsInList}
        />
      </div>
    </LoadingOverlay>
  );
};