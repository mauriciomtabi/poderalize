import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Plus, 
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KanbanCard } from "./KanbanCard";
import { AddCardDialog } from "./AddCardDialog";
import { EditCardDialog } from "./EditCardDialog";
import { InlineEdit } from "./InlineEdit";
import { LoadingOverlay } from "@/components/ui/loading-spinner";
import { useKanban } from "@/contexts/KanbanContext";
import { useState } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  comments: number;
  attachments: number;
  checklist?: { completed: number; total: number };
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export const KanbanBoard = () => {
  const { state, actions } = useKanban();
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const onDragStart = (start: any) => {
    actions.setDraggedItem(start.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    actions.setDraggedItem(null);

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    actions.moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  const handleAddCard = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsAddCardOpen(true);
  };

  const handleCreateTask = (newTask: Omit<Task, "id">) => {
    actions.addTask(selectedColumn, newTask);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    actions.updateTask(updatedTask);
  };

  const handleUpdateTaskTitle = (taskId: string, newTitle: string) => {
    const task = state.columns
      .flatMap(col => col.tasks)
      .find(t => t.id === taskId);
    
    if (task) {
      actions.updateTask({ ...task, title: newTitle });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    actions.deleteTask(taskId);
  };

  const handleDuplicateTask = (task: Task) => {
    actions.duplicateTask(task);
  };

  return (
    <LoadingOverlay isLoading={state.isLoading}>
      <div className="h-full">
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <div className="flex space-x-6 h-full overflow-x-auto pb-6">
            {state.columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className={`h-full flex flex-col kanban-column kanban-column-${column.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: column.color }}
                        />
                        <InlineEdit
                          value={column.title}
                          onSave={(newTitle) => actions.updateColumnTitle(column.id, newTitle)}
                          className="text-sm font-semibold text-foreground"
                          placeholder="Título da lista"
                        />
                        <Badge variant="secondary" className="text-xs">
                          {column.tasks.length}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleAddCard(column.id)}>
                            <Plus size={14} className="mr-2" />
                            Adicionar cartão
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit size={14} className="mr-2" />
                            Editar lista
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 size={14} className="mr-2" />
                            Excluir lista
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <CardContent
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-3 min-h-24 ${
                          snapshot.isDraggingOver ? "kanban-drop-zone" : ""
                        }`}
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${
                                  snapshot.isDragging 
                                    ? "kanban-drag-preview" 
                                    : state.draggedItem === task.id 
                                      ? "kanban-card-dragging" 
                                      : ""
                                }`}
                              >
                                <KanbanCard
                                  task={task}
                                  onEdit={() => handleEditTask(task)}
                                  onDelete={() => handleDeleteTask(task.id)}
                                  onDuplicate={() => handleDuplicateTask(task)}
                                  onUpdateTitle={handleUpdateTaskTitle}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          onClick={() => handleAddCard(column.id)}
                        >
                          <Plus size={16} className="mr-2" />
                          Adicionar cartão
                        </Button>
                      </CardContent>
                    )}
                  </Droppable>
                </Card>
              </div>
            ))}
          </div>
        </DragDropContext>

        <AddCardDialog
          isOpen={isAddCardOpen}
          onClose={() => setIsAddCardOpen(false)}
          onCreateTask={handleCreateTask}
        />

        {editingTask && (
          <EditCardDialog
            task={editingTask}
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </div>
    </LoadingOverlay>
  );
};