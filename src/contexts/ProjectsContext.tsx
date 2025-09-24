import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ProjectsState, ProjectBoard, ProjectList, ProjectCard, ViewType, FilterState, Priority, CardStatus } from '@/types/projects';
import { generateId } from '@/hooks/useUuid';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useApp } from './AppContext';

// Initial data with Trello-like structure
const initialLabels = [
  { id: generateId(), name: 'Bug', color: '#ef4444', description: 'Correção de bugs' },
  { id: generateId(), name: 'Feature', color: '#3b82f6', description: 'Nova funcionalidade' },
  { id: generateId(), name: 'Urgent', color: '#f59e0b', description: 'Prioridade urgente' },
  { id: generateId(), name: 'Design', color: '#8b5cf6', description: 'Trabalho de design' },
  { id: generateId(), name: 'Review', color: '#10b981', description: 'Precisa de revisão' },
];

const initialMembers = [
  { id: generateId(), name: 'Maria Silva', email: 'maria@empresa.com', role: 'owner' as const },
  { id: generateId(), name: 'João Santos', email: 'joao@empresa.com', role: 'admin' as const },
  { id: generateId(), name: 'Ana Costa', email: 'ana@empresa.com', role: 'member' as const },
  { id: generateId(), name: 'Pedro Lima', email: 'pedro@empresa.com', role: 'member' as const },
];

const sampleCards = [
  {
    id: generateId(),
    title: 'Implementar sistema de login',
    description: 'Criar tela de login com autenticação via JWT e integração com o backend',
    status: 'todo' as CardStatus,
    priority: 'high' as Priority,
    labels: [initialLabels[1], initialLabels[3]], // Feature, Urgent
    assignees: [initialMembers[0], initialMembers[2]],
    dueDate: '2024-10-15',
    startDate: '2024-10-01',
    estimatedHours: 16,
    checklists: [{
      id: generateId(),
      title: 'Tarefas de desenvolvimento',
      items: [
        { id: generateId(), text: 'Criar componente de login', completed: true },
        { id: generateId(), text: 'Implementar validação de formulário', completed: true },
        { id: generateId(), text: 'Integrar com API', completed: false },
        { id: generateId(), text: 'Testes unitários', completed: false },
        { id: generateId(), text: 'Testes de integração', completed: false },
      ]
    }],
    attachments: [],
    comments: [
      {
        id: generateId(),
        text: 'Lembrar de implementar autenticação de dois fatores',
        author: initialMembers[1].id,
        authorName: initialMembers[1].name,
        createdAt: '2024-09-25T10:30:00Z',
        mentions: [initialMembers[0].id]
      }
    ],
        activities: [
          {
            id: generateId(),
            type: 'create' as const,
            description: 'criou este cartão',
            author: initialMembers[0].id,
            authorName: initialMembers[0].name,
            createdAt: '2024-09-20T09:00:00Z'
          }
        ],
    position: 0,
    listId: 'todo',
    createdBy: initialMembers[0].id,
    createdAt: '2024-09-20T09:00:00Z',
    updatedAt: '2024-09-25T10:30:00Z',
    archived: false,
    watching: true
  },
  {
    id: generateId(),
    title: 'Design da página inicial',
    description: 'Criar mockups e protótipos da nova página inicial',
    status: 'in-progress' as CardStatus,
    priority: 'medium' as Priority,
    labels: [initialLabels[3]], // Design
    assignees: [initialMembers[2]],
    dueDate: '2024-10-10',
    checklists: [{
      id: generateId(),
      title: 'Etapas do design',
      items: [
        { id: generateId(), text: 'Pesquisa de referências', completed: true },
        { id: generateId(), text: 'Wireframes', completed: true },
        { id: generateId(), text: 'Mockups alta fidelidade', completed: false },
        { id: generateId(), text: 'Protótipo interativo', completed: false }
      ]
    }],
    attachments: [],
    comments: [],
    activities: [],
    position: 0,
    listId: 'in-progress',
    createdBy: initialMembers[2].id,
    createdAt: '2024-09-22T14:00:00Z',
    updatedAt: '2024-09-24T16:20:00Z',
    archived: false,
    watching: false
  }
];

const initialBoard: ProjectBoard = {
  id: generateId(),
  title: 'Desenvolvimento do Sistema CRM',
  description: 'Projeto principal de desenvolvimento do sistema CRM da empresa',
  status: 'active',
  lists: [
    {
      id: 'todo',
      title: 'Backlog',
      color: 'hsl(25 95% 53%)',
      position: 0,
      cards: [sampleCards[0]],
      archived: false,
      subscribed: true
    },
    {
      id: 'in-progress',
      title: 'Em Andamento',
      color: 'hsl(25 95% 53%)',
      position: 1,
      cards: [sampleCards[1]],
      archived: false,
      subscribed: true
    },
    {
      id: 'review',
      title: 'Revisão',
      color: 'hsl(25 95% 53%)',
      position: 2,
      cards: [],
      archived: false,
      subscribed: true
    },
    {
      id: 'done',
      title: 'Concluído',
      color: 'hsl(25 95% 53%)',
      position: 3,
      cards: [],
      archived: false,
      subscribed: true
    }
  ],
  members: initialMembers,
  labels: initialLabels,
  settings: {
    visibility: 'team',
    allowComments: true,
    allowVoting: false,
    cardAging: true,
    calendarFeed: true
  },
  createdBy: initialMembers[0].id,
  createdAt: '2024-09-01T00:00:00Z',
  updatedAt: '2024-09-25T10:30:00Z'
};

const initialState: ProjectsState = {
  currentBoard: initialBoard,
  boards: [initialBoard],
  currentView: 'kanban',
  filters: {
    search: '',
    members: [],
    labels: [],
    dueDate: null,
    cardStatus: [],
    priority: [],
    showMyCards: false,
    archived: false
  },
  draggedItem: null,
  isLoading: false,
  selectedCard: null,
  calendarDate: new Date(),
  timelineRange: {
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
};

// Actions
type ProjectsAction =
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_SELECTED_CARD'; payload: ProjectCard | null }
  | { type: 'SET_DRAGGED_ITEM'; payload: { type: 'card' | 'list'; id: string } | null }
  | { type: 'SET_LOADING'; payload: boolean }
  
  // Board actions
  | { type: 'SET_CURRENT_BOARD'; payload: ProjectBoard }
  | { type: 'UPDATE_BOARD'; payload: Partial<ProjectBoard> }
  
  // List actions
  | { type: 'ADD_LIST'; payload: { title: string; color: string } }
  | { type: 'UPDATE_LIST'; payload: { listId: string; updates: Partial<ProjectList> } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'MOVE_LIST'; payload: { listId: string; newPosition: number } }
  | { type: 'ARCHIVE_LIST'; payload: string }
  
  // Card actions
  | { type: 'ADD_CARD'; payload: { listId: string; card: Omit<ProjectCard, 'id' | 'position' | 'createdAt' | 'updatedAt'> } }
  | { type: 'UPDATE_CARD'; payload: ProjectCard }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'MOVE_CARD'; payload: { cardId: string; sourceListId: string; destListId: string; newPosition: number } }
  | { type: 'DUPLICATE_CARD'; payload: string }
  | { type: 'ARCHIVE_CARD'; payload: string }
  
  // Label actions
  | { type: 'ADD_LABEL'; payload: { name: string; color: string; description?: string } }
  | { type: 'UPDATE_LABEL'; payload: { labelId: string; updates: Partial<{ name: string; color: string; description: string }> } }
  | { type: 'DELETE_LABEL'; payload: string };

// Reducer
const projectsReducer = (state: ProjectsState, action: ProjectsAction): ProjectsState => {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'RESET_FILTERS':
      return { 
        ...state, 
        filters: {
          search: '',
          members: [],
          labels: [],
          dueDate: null,
          cardStatus: [],
          priority: [],
          showMyCards: false,
          archived: false
        }
      };
    
    case 'SET_SELECTED_CARD':
      return { ...state, selectedCard: action.payload };
    
    case 'SET_DRAGGED_ITEM':
      return { ...state, draggedItem: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.payload };
    
    case 'UPDATE_BOARD':
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: { ...state.currentBoard, ...action.payload }
      };
    
    case 'ADD_LIST': {
      if (!state.currentBoard) return state;
      const newList: ProjectList = {
        id: generateId(),
        title: action.payload.title,
        color: action.payload.color,
        position: state.currentBoard.lists.length,
        cards: [],
        archived: false,
        subscribed: true
      };
      
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: [...state.currentBoard.lists, newList]
        }
      };
    }
    
    case 'UPDATE_LIST':
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list =>
            list.id === action.payload.listId
              ? { ...list, ...action.payload.updates }
              : list
          )
        }
      };
    
    case 'ADD_CARD': {
      if (!state.currentBoard) return state;
      const targetList = state.currentBoard.lists.find(l => l.id === action.payload.listId);
      if (!targetList) return state;
      
      const newCard: ProjectCard = {
        ...action.payload.card,
        id: generateId(),
        position: targetList.cards.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: generateId(),
            type: 'create',
            description: 'criou este cartão',
            author: action.payload.card.createdBy,
            authorName: state.currentBoard.members.find(m => m.id === action.payload.card.createdBy)?.name || 'Usuário',
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list =>
            list.id === action.payload.listId
              ? { ...list, cards: [...list.cards, newCard] }
              : list
          )
        }
      };
    }
    
    case 'UPDATE_CARD':
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list => ({
            ...list,
            cards: list.cards.map(card =>
              card.id === action.payload.id
                ? { ...action.payload, updatedAt: new Date().toISOString() }
                : card
            )
          }))
        }
      };
    
    case 'DELETE_LIST':
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.filter(list => list.id !== action.payload)
        }
      };
    
    case 'MOVE_LIST': {
      if (!state.currentBoard) return state;
      const { listId, newPosition } = action.payload;
      
      const lists = [...state.currentBoard.lists];
      const listIndex = lists.findIndex(l => l.id === listId);
      
      if (listIndex === -1) return state;
      
      const [movedList] = lists.splice(listIndex, 1);
      lists.splice(newPosition, 0, movedList);
      
      // Update positions
      lists.forEach((list, index) => {
        list.position = index;
      });
      
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists
        }
      };
    }
    
    case 'ARCHIVE_LIST':
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list =>
            list.id === action.payload
              ? { ...list, archived: true }
              : list
          )
        }
      };

    case 'MOVE_CARD': {
      if (!state.currentBoard) return state;
      const { cardId, sourceListId, destListId, newPosition } = action.payload;
      
      const sourceList = state.currentBoard.lists.find(l => l.id === sourceListId);
      const destList = state.currentBoard.lists.find(l => l.id === destListId);
      const card = sourceList?.cards.find(c => c.id === cardId);
      
      if (!sourceList || !destList || !card) return state;
      
      const newSourceCards = sourceList.cards.filter(c => c.id !== cardId);
      const newDestCards = [...destList.cards];
      
      if (sourceListId === destListId) {
        // Moving within the same list
        newDestCards.splice(card.position, 1);
        newDestCards.splice(newPosition, 0, { ...card, position: newPosition });
      } else {
        // Moving between lists
        newDestCards.splice(newPosition, 0, { ...card, listId: destListId, position: newPosition });
      }
      
      // Update positions
      newDestCards.forEach((c, index) => {
        c.position = index;
      });
      
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list => {
            if (list.id === sourceListId) {
              return { ...list, cards: newSourceCards };
            }
            if (list.id === destListId) {
              return { ...list, cards: newDestCards };
            }
            return list;
          })
        }
      };
    }

    case 'DELETE_CARD': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list => ({
            ...list,
            cards: list.cards.filter(card => card.id !== action.payload)
          }))
        }
      };
    }

    case 'DUPLICATE_CARD': {
      if (!state.currentBoard) return state;
      const sourceCard = state.currentBoard.lists
        .flatMap(l => l.cards)
        .find(c => c.id === action.payload);
      
      if (!sourceCard) return state;
      
      const sourceList = state.currentBoard.lists.find(l => l.id === sourceCard.listId);
      if (!sourceList) return state;
      
      const duplicatedCard: ProjectCard = {
        ...sourceCard,
        id: generateId(),
        title: `${sourceCard.title} (cópia)`,
        position: sourceList.cards.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [
          {
            id: generateId(),
            type: 'create',
            description: 'duplicou este cartão',
            author: sourceCard.createdBy,
            authorName: state.currentBoard.members.find(m => m.id === sourceCard.createdBy)?.name || 'Usuário',
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list =>
            list.id === sourceCard.listId
              ? { ...list, cards: [...list.cards, duplicatedCard] }
              : list
          )
        }
      };
    }

    case 'ARCHIVE_CARD': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list => ({
            ...list,
            cards: list.cards.map(card =>
              card.id === action.payload
                ? { ...card, archived: true, updatedAt: new Date().toISOString() }
                : card
            )
          }))
        }
      };
    }
    
    default:
      return state;
  }
};

// Context
interface ProjectsContextType {
  state: ProjectsState;
  actions: {
    setCurrentView: (view: ViewType) => void;
    setFilters: (filters: Partial<FilterState>) => void;
    resetFilters: () => void;
    setSelectedCard: (card: ProjectCard | null) => void;
    setDraggedItem: (item: { type: 'card' | 'list'; id: string } | null) => void;
    
    // Board actions
    updateBoard: (updates: Partial<ProjectBoard>) => void;
    
    // List actions
    addList: (title: string, color: string) => void;
    updateList: (listId: string, updates: Partial<ProjectList>) => void;
    deleteList: (listId: string) => void;
    moveList: (listId: string, newPosition: number) => void;
    archiveList: (listId: string) => void;
    
    // Card actions
    addCard: (listId: string, card: Omit<ProjectCard, 'id' | 'position' | 'createdAt' | 'updatedAt'>) => void;
    updateCard: (card: ProjectCard) => void;
    deleteCard: (cardId: string) => void;
    moveCard: (cardId: string, sourceListId: string, destListId: string, newPosition: number) => void;
    duplicateCard: (cardId: string) => void;
    archiveCard: (cardId: string) => void;
    
    // Utility functions
    getFilteredCards: () => ProjectCard[];
    getCurrentUser: () => { id: string; name: string } | null;
  };
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Provider
export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(projectsReducer, initialState);
  const { actions: appActions } = useApp();

  // Load persisted data from localStorage directly
  useEffect(() => {
    try {
      const saved = localStorage.getItem('projects-data');
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (parsedData.currentBoard) {
          dispatch({ type: 'SET_CURRENT_BOARD', payload: parsedData.currentBoard });
        }
      }
    } catch (error) {
      console.error('Error loading projects data:', error);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (state.currentBoard) {
      try {
        localStorage.setItem('projects-data', JSON.stringify({
          currentBoard: state.currentBoard,
          lastUpdated: new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Error saving projects data:', error);
      }
    }
  }, [state.currentBoard]);

  const actions = {
    setCurrentView: (view: ViewType) => {
      dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
    },
    
    setFilters: (filters: Partial<FilterState>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
    },
    
    resetFilters: () => {
      dispatch({ type: 'RESET_FILTERS' });
    },
    
    setSelectedCard: (card: ProjectCard | null) => {
      dispatch({ type: 'SET_SELECTED_CARD', payload: card });
    },
    
    setDraggedItem: (item: { type: 'card' | 'list'; id: string } | null) => {
      dispatch({ type: 'SET_DRAGGED_ITEM', payload: item });
    },
    
    updateBoard: (updates: Partial<ProjectBoard>) => {
      dispatch({ type: 'UPDATE_BOARD', payload: updates });
    },
    
    addList: (title: string, color: string) => {
      dispatch({ type: 'ADD_LIST', payload: { title, color } });
      appActions.addNotification({
        type: 'success',
        title: 'Lista criada',
        message: `Lista "${title}" foi criada com sucesso.`,
      });
    },
    
    updateList: (listId: string, updates: Partial<ProjectList>) => {
      dispatch({ type: 'UPDATE_LIST', payload: { listId, updates } });
    },
    
    deleteList: (listId: string) => {
      const list = state.currentBoard?.lists.find(l => l.id === listId);
      dispatch({ type: 'DELETE_LIST', payload: listId });
      
      if (list) {
        appActions.addNotification({
          type: 'warning',
          title: 'Lista excluída',
          message: `Lista "${list.title}" foi excluída.`,
        });
      }
    },
    
    moveList: (listId: string, newPosition: number) => {
      dispatch({ type: 'MOVE_LIST', payload: { listId, newPosition } });
    },
    
    archiveList: (listId: string) => {
      const list = state.currentBoard?.lists.find(l => l.id === listId);
      dispatch({ type: 'ARCHIVE_LIST', payload: listId });
      
      if (list) {
        appActions.addNotification({
          type: 'info',
          title: 'Lista arquivada',
          message: `Lista "${list.title}" foi arquivada.`,
        });
      }
    },
    
    addCard: (listId: string, card: Omit<ProjectCard, 'id' | 'position' | 'createdAt' | 'updatedAt'>) => {
      dispatch({ type: 'ADD_CARD', payload: { listId, card } });
      appActions.addNotification({
        type: 'success',
        title: 'Cartão criado',
        message: `"${card.title}" foi criado com sucesso.`,
      });
    },
    
    updateCard: (card: ProjectCard) => {
      dispatch({ type: 'UPDATE_CARD', payload: card });
    },
    
    deleteCard: (cardId: string) => {
      const card = state.currentBoard?.lists
        .flatMap(l => l.cards)
        .find(c => c.id === cardId);
      
      dispatch({ type: 'DELETE_CARD', payload: cardId });
      
      if (card) {
        appActions.addNotification({
          type: 'warning',
          title: 'Cartão excluído',
          message: `"${card.title}" foi excluído.`,
        });
      }
    },
    
    moveCard: (cardId: string, sourceListId: string, destListId: string, newPosition: number) => {
      dispatch({ type: 'MOVE_CARD', payload: { cardId, sourceListId, destListId, newPosition } });
    },
    
    duplicateCard: (cardId: string) => {
      dispatch({ type: 'DUPLICATE_CARD', payload: cardId });
      appActions.addNotification({
        type: 'success',
        title: 'Cartão duplicado',
        message: 'Cartão foi duplicado com sucesso.',
      });
    },

    archiveCard: (cardId: string) => {
      const card = state.currentBoard?.lists
        .flatMap(l => l.cards)
        .find(c => c.id === cardId);
      
      dispatch({ type: 'ARCHIVE_CARD', payload: cardId });
      
      if (card) {
        appActions.addNotification({
          type: 'info',
          title: 'Cartão arquivado',
          message: `"${card.title}" foi arquivado.`,
        });
      }
    },
    
    getFilteredCards: (): ProjectCard[] => {
      if (!state.currentBoard) return [];
      
      const allCards = state.currentBoard.lists.flatMap(list => list.cards);
      const { filters } = state;
      
      return allCards.filter(card => {
        // Search filter
        if (filters.search && !card.title.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        
        // Members filter
        if (filters.members.length > 0) {
          const hasMatchingMember = card.assignees.some(assignee => 
            filters.members.includes(assignee.id)
          );
          if (!hasMatchingMember) return false;
        }
        
        // Labels filter
        if (filters.labels.length > 0) {
          const hasMatchingLabel = card.labels.some(label => 
            filters.labels.includes(label.id)
          );
          if (!hasMatchingLabel) return false;
        }
        
        // Due date filter
        if (filters.dueDate) {
          const now = new Date();
          const cardDueDate = card.dueDate ? new Date(card.dueDate) : null;
          
          switch (filters.dueDate) {
            case 'no-date':
              if (cardDueDate) return false;
              break;
            case 'overdue':
              if (!cardDueDate || cardDueDate >= now) return false;
              break;
            case 'today':
              if (!cardDueDate || cardDueDate.toDateString() !== now.toDateString()) return false;
              break;
            case 'week':
              if (!cardDueDate || cardDueDate > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) return false;
              break;
            case 'month':
              if (!cardDueDate || cardDueDate > new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) return false;
              break;
          }
        }
        
        // Status filter
        if (filters.cardStatus.length > 0 && !filters.cardStatus.includes(card.status)) {
          return false;
        }
        
        // Priority filter
        if (filters.priority.length > 0 && !filters.priority.includes(card.priority)) {
          return false;
        }
        
        // Archived filter
        if (!filters.archived && card.archived) {
          return false;
        }
        
        return true;
      });
    },
    
    getCurrentUser: () => {
      // This would normally come from auth context
      return state.currentBoard?.members[0] || null;
    }
  };

  return (
    <ProjectsContext.Provider value={{ state, actions }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects deve ser usado dentro de um ProjectsProvider');
  }
  return context;
};