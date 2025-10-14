import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Calendar,
  User,
  Tag,
  MessageCircle,
  Paperclip,
  CheckSquare
} from "lucide-react";
import { ProjectCard } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn, getDueDateColorClass } from "@/lib/utils";

export const ArchivedView = () => {
  const { state, actions } = useProjects();
  const [showRestoreConfirmation, setShowRestoreConfirmation] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);

  const archivedCards = state.currentBoard?.lists
    .flatMap(list => list.cards)
    .filter(card => card.archived) || [];

  const archivedLists = state.currentBoard?.lists.filter(list => list.archived) || [];

  const handleRestoreCard = (cardId: string) => {
    // Implementation needed in context
    const card = archivedCards.find(c => c.id === cardId);
    if (card) {
      const updatedCard = { ...card, archived: false };
      actions.updateCard(updatedCard);
    }
    setShowRestoreConfirmation(null);
  };

  const handleDeleteCard = (cardId: string) => {
    actions.deleteCard(cardId);
    setShowDeleteConfirmation(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (archivedCards.length === 0 && archivedLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Archive className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Nenhum item arquivado</h2>
        <p className="text-muted-foreground">
          Os cartões e listas arquivados aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Archive className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Itens Arquivados</h1>
        <Badge variant="secondary">
          {archivedCards.length + archivedLists.length} itens
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Archived Cards */}
          {archivedCards.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Cartões Arquivados ({archivedCards.length})
              </h2>
              
              <div className="grid gap-4">
                {archivedCards.map((card) => (
                  <Card key={card.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">{card.title}</h3>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowRestoreConfirmation(card.id)}
                                className="h-8"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Restaurar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setShowDeleteConfirmation(card.id)}
                                className="h-8"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>

                          {card.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {card.description}
                            </p>
                          )}

                          {/* Card Info */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Lista: {state.currentBoard?.lists.find(l => l.id === card.listId)?.title}</span>
                            <span>Arquivado em: {formatDate(card.updatedAt)}</span>
                          </div>

                          {/* Labels */}
                          {card.labels.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Tag className="h-3 w-3" />
                              <div className="flex flex-wrap gap-1">
                                {card.labels.map(label => (
                                  <Badge 
                                    key={label.id} 
                                    style={{ backgroundColor: label.color }}
                                    className="text-white text-xs"
                                  >
                                    {label.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Assignees */}
                          {card.assignees.length > 0 && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <div className="flex -space-x-2">
                                {card.assignees.slice(0, 3).map(member => (
                                  <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {card.assignees.length > 3 && (
                                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                    +{card.assignees.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Due Date */}
                          {card.dueDate && (
                            <div className="flex items-center gap-2 text-xs">
                              <Calendar className="h-3 w-3" />
                              <span className={getDueDateColorClass(card.dueDate, card.status === 'done')}>
                                {formatDate(card.dueDate)}
                              </span>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {card.comments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {card.comments.length}
                              </span>
                            )}
                            {card.attachments?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {card.attachments.length}
                              </span>
                            )}
                            {card.checklists.length > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" />
                                {card.checklists.reduce((acc, cl) => acc + cl.items.length, 0)} itens
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Separator if both exist */}
          {archivedCards.length > 0 && archivedLists.length > 0 && <Separator />}

          {/* Archived Lists */}
          {archivedLists.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Listas Arquivadas ({archivedLists.length})
              </h2>
              
              <div className="grid gap-4">
                {archivedLists.map((list) => (
                  <Card key={list.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: list.color }}
                          />
                          {list.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restaurar
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {list.cards.length} cartões arquivados junto com a lista
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showRestoreConfirmation !== null}
        onClose={() => setShowRestoreConfirmation(null)}
        onConfirm={() => showRestoreConfirmation && handleRestoreCard(showRestoreConfirmation)}
        title="Restaurar Cartão"
        description="Tem certeza de que deseja restaurar este cartão? Ele voltará para sua lista original."
        confirmText="Restaurar"
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirmation !== null}
        onClose={() => setShowDeleteConfirmation(null)}
        onConfirm={() => showDeleteConfirmation && handleDeleteCard(showDeleteConfirmation)}
        title="Excluir Cartão Definitivamente"
        description="Tem certeza de que deseja excluir este cartão permanentemente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
    </div>
  );
};