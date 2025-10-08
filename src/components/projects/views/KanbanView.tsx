import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus
} from "lucide-react";
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

  const onDragStart = (start: any) => {
    actions.setDraggedItem({ 
      type: start.type?.startsWith('list') ? 'list' : 'card', 
      id: start.draggableId 
    });
  };
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    
    // Clear dragged item immediately
    actions.setDraggedItem(null);

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle list drag and drop
    if (type === 'LIST') {
      actions.moveList(draggableId, destination.index);
      return;
    }

    // Handle card drag and drop
    actions.moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
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
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden min-w-0"
        >
          <div className="h-full">
            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
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
                        // Apply filters to cards in this list
                        const filteredCards = actions.getFilteredCards().filter(card => card.listId === list.id);
                        
                        return (
                          <Draggable key={list.id} draggableId={list.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex-shrink-0 w-80 ${snapshot.isDragging ? 'rotate-2' : ''}`}
                              >
                                <Card 
                                  className="flex flex-col kanban-column max-h-[calc(100vh-12rem)]"
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
                                          className="text-sm font-semibold text-white"
                                          placeholder="Título da lista"
                                        />
                                        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                                          {filteredCards.length}
                                        </Badge>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
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
                                        className={`flex-1 space-y-3 min-h-24 overflow-y-auto overflow-x-hidden ${
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
                    <div className="flex-shrink-0 w-80">
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
        />
      </div>
    </LoadingOverlay>
  );
};