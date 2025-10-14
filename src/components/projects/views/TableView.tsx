import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowUpDown, 
  Calendar, 
  User, 
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ProjectCard, Priority } from "@/types/projects";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CardDetailModal } from "@/components/projects/modal/CardDetailModal";
import { cn, getDueDateColorClass } from "@/lib/utils";

const priorityConfig = {
  low: { label: 'Baixa', icon: Clock, className: 'text-blue-500' },
  medium: { label: 'Média', icon: AlertCircle, className: 'text-yellow-500' },
  high: { label: 'Alta', icon: Zap, className: 'text-red-500' },
  urgent: { label: 'Urgente', icon: Zap, className: 'text-red-600' }
};

const statusConfig = {
  'todo': { label: 'A fazer', className: 'text-gray-500' },
  'in-progress': { label: 'Em andamento', className: 'text-blue-500' },
  'review': { label: 'Revisão', className: 'text-yellow-500' },
  'blocked': { label: 'Bloqueado', className: 'text-red-500' },
  'done': { label: 'Concluído', className: 'text-green-500' }
};

type SortField = 'title' | 'status' | 'dueDate' | 'assignee';
type SortDirection = 'asc' | 'desc';

export const TableView = () => {
  const { state, actions } = useProjects();
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);

  const handleDelete = (cardId: string) => {
    actions.deleteCard(cardId);
    setDeleteCardId(null);
  };

  const handleDuplicate = (cardId: string) => {
    actions.duplicateCard(cardId);
  };

  const handleCardClick = (card: ProjectCard) => {
    actions.setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCards = [...actions.getFilteredCards()].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'assignee':
        aValue = a.assignees[0]?.name || '';
        bValue = b.assignees[0]?.name || '';
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} dias atrás`;
    } else if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Amanhã';
    } else {
      return `Em ${diffDays} dias`;
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 hover:bg-transparent justify-start font-medium"
    >
      {children}
      <ArrowUpDown 
        size={14} 
        className={cn(
          "ml-1",
          sortField === field ? "text-primary" : "text-muted-foreground"
        )} 
      />
    </Button>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <SortButton field="title">Título</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="status">Status</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="assignee">Responsável</SortButton>
              </TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead>
                <SortButton field="dueDate">Prazo</SortButton>
              </TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCards.map((card) => {
              const completedChecklists = card.checklists.reduce((acc, checklist) => 
                acc + checklist.items.filter(item => item.completed).length, 0
              );
              const totalChecklists = card.checklists.reduce((acc, checklist) => 
                acc + checklist.items.length, 0
              );
              const progress = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;

              return (
                <TableRow key={card.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div 
                        className="font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleCardClick(card)}
                      >
                        {card.title}
                      </div>
                      {card.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {card.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", statusConfig[card.status].className)}
                    >
                      {statusConfig[card.status].label}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
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
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {card.labels.slice(0, 2).map((label) => (
                        <Badge
                          key={label.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: label.color + '20', color: label.color }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                      {card.labels.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{card.labels.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {card.dueDate && (
                      <div className={cn(
                        "text-xs",
                        getDueDateColorClass(card.dueDate, card.status === 'done')
                      )}>
                        <Calendar size={12} className="inline mr-1" />
                        {formatDate(card.dueDate)}
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {totalChecklists > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCardClick(card)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(card.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCardId(card.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Card Detail Modal */}
      {state.selectedCard && (
        <CardDetailModal
          card={state.selectedCard}
          isOpen={showCardModal}
          onClose={() => {
            setShowCardModal(false);
            actions.setSelectedCard(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteCardId}
        onClose={() => setDeleteCardId(null)}
        onConfirm={() => deleteCardId && handleDelete(deleteCardId)}
        title="Excluir Cartão"
        description="Tem certeza de que deseja excluir este cartão? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
      
      {sortedCards.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Nenhum cartão encontrado</div>
            <div className="text-sm">Tente ajustar os filtros ou criar um novo cartão</div>
          </div>
        </div>
      )}
    </div>
  );
};