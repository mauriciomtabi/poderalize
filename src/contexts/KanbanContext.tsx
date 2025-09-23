import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, Column } from '@/components/kanban/KanbanBoard';
import { generateId } from '@/hooks/useUuid';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useApp } from './AppContext';

// Estado do Kanban
interface KanbanState {
  columns: Column[];
  draggedItem: string | null;
  isLoading: boolean;
  lastSaved: string | null;
}

// Ações do Kanban
type KanbanAction =
  | { type: 'SET_COLUMNS'; payload: Column[] }
  | { type: 'ADD_TASK'; payload: { columnId: string; task: Omit<Task, 'id'> } }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; sourceColumnId: string; destColumnId: string; destIndex: number } }
  | { type: 'UPDATE_COLUMN_TITLE'; payload: { columnId: string; title: string } }
  | { type: 'SET_DRAGGED_ITEM'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'DUPLICATE_TASK'; payload: Task };

// Dados iniciais
const initialColumns: Column[] = [
  {
    id: "todo",
    title: "A Fazer",
    color: "hsl(0 84% 60%)",
    tasks: [
      {
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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
        id: generateId(),
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

const initialState: KanbanState = {
  columns: initialColumns,
  draggedItem: null,
  isLoading: false,
  lastSaved: null,
};

// Reducer
const kanbanReducer = (state: KanbanState, action: KanbanAction): KanbanState => {
  switch (action.type) {
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };
    
    case 'ADD_TASK': {
      const newTask: Task = {
        ...action.payload.task,
        id: generateId(),
      };
      
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.columnId
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        ),
      };
    }
    
    case 'UPDATE_TASK':
      return {
        ...state,
        columns: state.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(task =>
            task.id === action.payload.id ? action.payload : task
          ),
        })),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        columns: state.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(task => task.id !== action.payload),
        })),
      };
    
    case 'MOVE_TASK': {
      const { taskId, sourceColumnId, destColumnId, destIndex } = action.payload;
      
      const sourceColumn = state.columns.find(col => col.id === sourceColumnId);
      const destColumn = state.columns.find(col => col.id === destColumnId);
      const task = sourceColumn?.tasks.find(t => t.id === taskId);
      
      if (!sourceColumn || !destColumn || !task) return state;
      
      const newSourceTasks = sourceColumn.tasks.filter(t => t.id !== taskId);
      const newDestTasks = [...destColumn.tasks];
      newDestTasks.splice(destIndex, 0, task);
      
      return {
        ...state,
        columns: state.columns.map(col => {
          if (col.id === sourceColumnId) {
            return { ...col, tasks: newSourceTasks };
          }
          if (col.id === destColumnId) {
            return { ...col, tasks: newDestTasks };
          }
          return col;
        }),
      };
    }
    
    case 'UPDATE_COLUMN_TITLE':
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.columnId
            ? { ...col, title: action.payload.title }
            : col
        ),
      };
    
    case 'DUPLICATE_TASK': {
      const originalTask = action.payload;
      const duplicatedTask: Task = {
        ...originalTask,
        id: generateId(),
        title: `${originalTask.title} (Cópia)`,
      };
      
      return {
        ...state,
        columns: state.columns.map(col =>
          col.tasks.some(t => t.id === originalTask.id)
            ? { ...col, tasks: [...col.tasks, duplicatedTask] }
            : col
        ),
      };
    }
    
    case 'SET_DRAGGED_ITEM':
      return { ...state, draggedItem: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
};

// Context
interface KanbanContextType {
  state: KanbanState;
  actions: {
    addTask: (columnId: string, task: Omit<Task, 'id'>) => void;
    updateTask: (task: Task) => void;
    deleteTask: (taskId: string) => void;
    moveTask: (taskId: string, sourceColumnId: string, destColumnId: string, destIndex: number) => void;
    updateColumnTitle: (columnId: string, title: string) => void;
    duplicateTask: (task: Task) => void;
    setDraggedItem: (itemId: string | null) => void;
  };
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

// Provider
export const KanbanProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);
  const [persistedData, setPersisted, isStorageLoading] = useLocalStorage('kanban', {
    columns: initialColumns,
    lastUpdated: new Date().toISOString(),
  });
  const { actions: appActions } = useApp();

  // Carrega dados persistidos na inicialização
  useEffect(() => {
    if (!isStorageLoading && persistedData?.columns) {
      dispatch({ type: 'SET_COLUMNS', payload: persistedData.columns });
    }
  }, [isStorageLoading, persistedData]);

  // Auto-save quando o estado muda
  useEffect(() => {
    if (!isStorageLoading) {
      setPersisted({
        columns: state.columns,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [state.columns, isStorageLoading, setPersisted]);

  const actions = {
    addTask: (columnId: string, task: Omit<Task, 'id'>) => {
      dispatch({ type: 'ADD_TASK', payload: { columnId, task } });
      appActions.addNotification({
        type: 'success',
        title: 'Tarefa adicionada',
        message: `"${task.title}" foi adicionada com sucesso.`,
      });
    },
    
    updateTask: (task: Task) => {
      dispatch({ type: 'UPDATE_TASK', payload: task });
      appActions.addNotification({
        type: 'info',
        title: 'Tarefa atualizada',
        message: `"${task.title}" foi atualizada.`,
      });
    },
    
    deleteTask: (taskId: string) => {
      const task = state.columns
        .flatMap(col => col.tasks)
        .find(t => t.id === taskId);
      
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      
      if (task) {
        appActions.addNotification({
          type: 'warning',
          title: 'Tarefa excluída',
          message: `"${task.title}" foi excluída.`,
        });
      }
    },
    
    moveTask: (taskId: string, sourceColumnId: string, destColumnId: string, destIndex: number) => {
      dispatch({ 
        type: 'MOVE_TASK', 
        payload: { taskId, sourceColumnId, destColumnId, destIndex } 
      });
    },
    
    updateColumnTitle: (columnId: string, title: string) => {
      dispatch({ type: 'UPDATE_COLUMN_TITLE', payload: { columnId, title } });
    },
    
    duplicateTask: (task: Task) => {
      dispatch({ type: 'DUPLICATE_TASK', payload: task });
      appActions.addNotification({
        type: 'success',
        title: 'Tarefa duplicada',
        message: `"${task.title}" foi duplicada com sucesso.`,
      });
    },
    
    setDraggedItem: (itemId: string | null) => {
      dispatch({ type: 'SET_DRAGGED_ITEM', payload: itemId });
    },
  };

  return (
    <KanbanContext.Provider value={{ state, actions }}>
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban deve ser usado dentro de um KanbanProvider');
  }
  return context;
};