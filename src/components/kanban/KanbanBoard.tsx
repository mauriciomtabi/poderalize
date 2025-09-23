import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Plus, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  User,
  Edit,
  Trash2,
  Copy
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

const initialData: Column[] = [
  {
    id: "todo",
    title: "A Fazer",
    color: "hsl(0 84% 60%)",
    tasks: [
      {
        id: "1",
        title: "Criar wireframes do site",
        description: "Desenvolver wireframes para as principais páginas do site institucional",
        assignee: "Maria Silva",
        dueDate: "2024-10-01",
        priority: "high",
        tags: ["Design", "UX"],
        comments: 3,
        attachments: 2,
        checklist: { completed: 2, total: 5 }
      },
      {
        id: "2",
        title: "Reunião com cliente XYZ",
        assignee: "João Santos",
        dueDate: "2024-09-28",
        priority: "medium",
        tags: ["Reunião"],
        comments: 1,
        attachments: 0
      }
    ]
  },
  {
    id: "inprogress",
    title: "Em Andamento",
    color: "hsl(45 93% 47%)",
    tasks: [
      {
        id: "3",
        title: "Desenvolvimento da landing page",
        description: "Implementar o design aprovado da landing page",
        assignee: "Ana Costa",
        dueDate: "2024-10-05",
        priority: "high",
        tags: ["Desenvolvimento", "Frontend"],
        comments: 5,
        attachments: 1,
        checklist: { completed: 3, total: 8 }
      }
    ]
  },
  {
    id: "review",
    title: "Revisão",
    color: "hsl(217 91% 60%)",
    tasks: [
      {
        id: "4",
        title: "Campanha para redes sociais",
        description: "Criação de posts para Instagram e LinkedIn",
        assignee: "Pedro Lima",
        priority: "medium",
        tags: ["Social Media", "Marketing"],
        comments: 2,
        attachments: 4
      }
    ]
  },
  {
    id: "done",
    title: "Concluído",
    color: "hsl(142 71% 45%)",
    tasks: [
      {
        id: "5",
        title: "Logo da marca atualizada",
        assignee: "Maria Silva",
        priority: "low",
        tags: ["Design", "Branding"],
        comments: 8,
        attachments: 3
      }
    ]
  }
];

export const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>(initialData);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const onDragStart = (start: any) => {
    setDraggedItem(start.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    setDraggedItem(null);

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const task = sourceColumn.tasks.find(task => task.id === draggableId);
    if (!task) return;

    // Remove task from source column
    const newSourceTasks = sourceColumn.tasks.filter(task => task.id !== draggableId);
    
    // Add task to destination column
    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, task);

    setColumns(prevColumns =>
      prevColumns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: newSourceTasks };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: newDestTasks };
        }
        return col;
      })
    );
  };

  const handleAddCard = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsAddCardOpen(true);
  };

  const handleCreateTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
    };

    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === selectedColumn
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      )
    );
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setColumns(prevColumns =>
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      }))
    );
  };

  const handleUpdateTaskTitle = (taskId: string, newTitle: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.map(task =>
          task.id === taskId ? { ...task, title: newTitle } : task
        )
      }))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col => ({
        ...col,
        tasks: col.tasks.filter(task => task.id !== taskId)
      }))
    );
  };

  const handleUpdateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
  };

  const handleDuplicateTask = (task: Task) => {
    const duplicatedTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      title: `${task.title} (Cópia)`,
    };

    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.tasks.some(t => t.id === task.id)
          ? { ...col, tasks: [...col.tasks, duplicatedTask] }
          : col
      )
    );
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div className="flex space-x-6 h-full overflow-x-auto pb-6">
          {columns.map((column) => (
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
                        onSave={(newTitle) => handleUpdateColumnTitle(column.id, newTitle)}
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
                                  : draggedItem === task.id 
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
  );
};