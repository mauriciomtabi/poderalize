import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { ProjectsState, ProjectBoard, ProjectList, ProjectCard, ViewType, FilterState, Priority, CardStatus } from '@/types/projects';
import { generateId } from '@/hooks/useUuid';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { isAfter, isToday, startOfDay } from 'date-fns';

// Utility function to get status label in Portuguese
const getStatusLabel = (status: CardStatus): string => {
  const statusLabels = {
    'todo': 'A fazer',
    'in-progress': 'Em andamento', 
    'review': 'Em revisão',
    'blocked': 'Bloqueado',
    'done': 'Concluído'
  };
  return statusLabels[status];
};

// Utility function to get automatic status based on due date
const getAutoStatus = (card: ProjectCard): CardStatus => {
  if (!card.dueDate) return card.status;
  
  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(card.dueDate));
  
  // If card is done, keep it done
  if (card.status === 'done') return card.status;
  
  // If overdue and not done
  if (isAfter(today, dueDate)) {
    return 'blocked'; // Mark as blocked when overdue
  }
  
  // If due today and not in-progress or review
  if (isToday(dueDate) && card.status === 'todo') {
    return 'in-progress'; // Auto-start when due today
  }
  
  return card.status;
};

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
    activities: [
      {
        id: generateId(),
        type: 'create' as const,
        description: 'criou este cartão',
        author: initialMembers[2].id,
        authorName: initialMembers[2].name,
        createdAt: '2024-09-22T14:00:00Z'
      },
      {
        id: generateId(),
        type: 'assign' as const,
        description: 'atribuiu este cartão a si mesmo',
        author: initialMembers[2].id,
        authorName: initialMembers[2].name,
        createdAt: '2024-09-22T14:05:00Z'
      }
    ],
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
  calendarDate: new Date()
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
  | { type: 'ADD_CARD_ACTIVITY'; payload: { cardId: string; activity: any } }
  
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
      
      if (sourceListId === destListId) {
        // Moving within the same list - fix the logic
        const cards = [...sourceList.cards];
        const currentIndex = cards.findIndex(c => c.id === cardId);
        
        if (currentIndex === -1) return state;
        
        // Remove card from current position
        const [movedCard] = cards.splice(currentIndex, 1);
        // Insert at new position
        cards.splice(newPosition, 0, { ...movedCard, position: newPosition });
        
        // Update all positions in the list
        cards.forEach((c, index) => {
          c.position = index;
        });
        
        return {
          ...state,
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map(list =>
              list.id === sourceListId
                ? { ...list, cards }
                : list
            )
          }
        };
      } else {
        // Moving between lists
        const newSourceCards = sourceList.cards.filter(c => c.id !== cardId);
        const newDestCards = [...destList.cards];
        
        // Insert card at new position in destination list
        newDestCards.splice(newPosition, 0, { ...card, listId: destListId, position: newPosition });
        
        // Update positions for both lists
        newSourceCards.forEach((c, index) => {
          c.position = index;
        });
        
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
    
    case 'ADD_LABEL': {
      if (!state.currentBoard) return state;
      const newLabel = {
        id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...action.payload
      };
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          labels: [...state.currentBoard.labels, newLabel]
        }
      };
    }
    
    case 'UPDATE_LABEL': {
      if (!state.currentBoard) return state;
      const { labelId, updates } = action.payload;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          labels: state.currentBoard.labels.map(label =>
            label.id === labelId
              ? { ...label, ...updates }
              : label
          ),
          lists: state.currentBoard.lists.map(list => ({
            ...list,
            cards: list.cards.map(card => ({
              ...card,
              labels: card.labels.map(cardLabel =>
                cardLabel.id === labelId
                  ? { ...cardLabel, ...updates }
                  : cardLabel
              )
            }))
          }))
        }
      };
    }
    
    case 'ADD_CARD_ACTIVITY': {
      if (!state.currentBoard) return state;

      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          lists: state.currentBoard.lists.map(list => ({
            ...list,
            cards: list.cards.map(card => 
              card.id === action.payload.cardId
                ? {
                    ...card,
                    activities: [action.payload.activity, ...(card.activities || [])],
                    updatedAt: new Date().toISOString()
                  }
                : card
            )
          }))
        }
      };
    }

    case 'DELETE_LABEL': {
      if (!state.currentBoard) return state;
      return {
        ...state,
        currentBoard: {
          ...state.currentBoard,
          labels: state.currentBoard.labels.filter(label => label.id !== action.payload),
          lists: state.currentBoard.lists.map(list => ({
            ...list,
            cards: list.cards.map(card => ({
              ...card,
              labels: card.labels.filter(label => label.id !== action.payload)
            }))
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
    
    // Label actions
    addLabel: (name: string, color: string, description?: string) => void;
    updateLabel: (labelId: string, updates: Partial<{ name: string; color: string; description: string }>) => void;
    deleteLabel: (labelId: string) => void;
    
    // Utility functions
    getFilteredCards: () => ProjectCard[];
    getCurrentUser: () => { id: string; name: string } | null;
    addActivity: (cardId: string, type: string, description: string, metadata?: any) => void;
  };
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Provider
export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(projectsReducer, initialState);
  const { toast } = useToast();

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

  // Activity logging helper
  const addActivity = useCallback((cardId: string, type: string, description: string, metadata?: any) => {
    const currentUser = actions.getCurrentUser();
    if (!currentUser) return;

    const activity = {
      id: generateId(),
      type,
      description,
      author: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
      metadata
    };

    dispatch({ 
      type: 'ADD_CARD_ACTIVITY', 
      payload: { cardId, activity } 
    });
  }, []);

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
      toast({
        title: 'Lista criada',
        description: `Lista "${title}" foi criada com sucesso.`,
      });
    },
    
    updateList: (listId: string, updates: Partial<ProjectList>) => {
      dispatch({ type: 'UPDATE_LIST', payload: { listId, updates } });
    },
    
    deleteList: (listId: string) => {
      const list = state.currentBoard?.lists.find(l => l.id === listId);
      dispatch({ type: 'DELETE_LIST', payload: listId });
      
      if (list) {
        toast({
          title: 'Lista excluída',
          description: `Lista "${list.title}" foi excluída.`,
          variant: 'destructive',
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
        toast({
          title: 'Lista arquivada',
          description: `Lista "${list.title}" foi arquivada.`,
        });
      }
    },
    
    addCard: (listId: string, card: Omit<ProjectCard, 'id' | 'position' | 'createdAt' | 'updatedAt'>) => {
      dispatch({ type: 'ADD_CARD', payload: { listId, card } });
      toast({
        title: 'Cartão criado',
        description: `"${card.title}" foi criado com sucesso.`,
      });
    },
    
    updateCard: (card: ProjectCard) => {
      // Auto-update status based on due date
      const updatedCard = { ...card, status: getAutoStatus(card) };
      
      // Log activity for updates
      const currentCard = state.currentBoard?.lists
        .flatMap(l => l.cards)
        .find(c => c.id === card.id);
      
      if (currentCard) {
        // Log automatic status change
        if (updatedCard.status !== card.status) {
          addActivity(card.id, 'update', `status alterado automaticamente para ${getStatusLabel(updatedCard.status)} baseado na data de vencimento`);
        }
        
        if (card.title !== currentCard.title) {
          addActivity(card.id, 'update', 'alterou o título');
        }
        if (card.description !== currentCard.description) {
          addActivity(card.id, 'update', 'alterou a descrição');
        }
        if (card.dueDate !== currentCard.dueDate) {
          if (card.dueDate) {
            addActivity(card.id, 'due_date', `definiu data de vencimento para ${new Date(card.dueDate).toLocaleDateString('pt-BR')}`);
          } else {
            addActivity(card.id, 'due_date', 'removeu a data de vencimento');
          }
        }
        // Check assignee changes
        const addedMembers = card.assignees.filter(m => !currentCard.assignees.some(cm => cm.id === m.id));
        const removedMembers = currentCard.assignees.filter(cm => !card.assignees.some(m => m.id === cm.id));
        
        addedMembers.forEach(member => {
          addActivity(card.id, 'assign', `atribuiu ${member.name}`);
        });
        removedMembers.forEach(member => {
          addActivity(card.id, 'assign', `removeu ${member.name}`);
        });
        
        // Check label changes
        const addedLabels = card.labels.filter(l => !currentCard.labels.some(cl => cl.id === l.id));
        const removedLabels = currentCard.labels.filter(cl => !card.labels.some(l => l.id === cl.id));
        
        addedLabels.forEach(label => {
          addActivity(card.id, 'update', `adicionou etiqueta "${label.name}"`);
        });
        removedLabels.forEach(label => {
          addActivity(card.id, 'update', `removeu etiqueta "${label.name}"`);
        });
      }
      
      dispatch({ type: 'UPDATE_CARD', payload: updatedCard });
    },
    
    deleteCard: (cardId: string) => {
      const card = state.currentBoard?.lists
        .flatMap(l => l.cards)
        .find(c => c.id === cardId);
      
      dispatch({ type: 'DELETE_CARD', payload: cardId });
      
      if (card) {
        toast({
          title: 'Cartão excluído',
          description: `"${card.title}" foi excluído.`,
          variant: 'destructive',
        });
      }
    },
    
    moveCard: (cardId: string, sourceListId: string, destListId: string, newPosition: number) => {
      // Add activity for card move
      if (sourceListId !== destListId) {
        const sourceList = state.currentBoard?.lists.find(l => l.id === sourceListId);
        const destList = state.currentBoard?.lists.find(l => l.id === destListId);
        
        if (sourceList && destList) {
          addActivity(cardId, 'move', `moveu de "${sourceList.title}" para "${destList.title}"`);
        }
      }
      
      dispatch({ type: 'MOVE_CARD', payload: { cardId, sourceListId, destListId, newPosition } });
    },
    
    duplicateCard: (cardId: string) => {
      dispatch({ type: 'DUPLICATE_CARD', payload: cardId });
      toast({
        title: 'Cartão duplicado',
        description: 'Cartão foi duplicado com sucesso.',
      });
    },

    archiveCard: (cardId: string) => {
      addActivity(cardId, 'archive', 'arquivou este cartão');
      
      const card = state.currentBoard?.lists
        .flatMap(l => l.cards)
        .find(c => c.id === cardId);
      
      dispatch({ type: 'ARCHIVE_CARD', payload: cardId });
      
      if (card) {
        toast({
          title: 'Cartão arquivado',
          description: `"${card.title}" foi arquivado.`,
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
    
    addLabel: (name: string, color: string, description?: string) => {
      dispatch({ type: 'ADD_LABEL', payload: { name, color, description } });
      toast({
        title: 'Etiqueta criada',
        description: `Etiqueta "${name}" foi criada com sucesso.`,
      });
    },
    
    updateLabel: (labelId: string, updates: Partial<{ name: string; color: string; description: string }>) => {
      dispatch({ type: 'UPDATE_LABEL', payload: { labelId, updates } });
      toast({
        title: 'Etiqueta atualizada',
        description: 'Etiqueta foi atualizada com sucesso.',
      });
    },
    
    deleteLabel: (labelId: string) => {
      const label = state.currentBoard?.labels.find(l => l.id === labelId);
      dispatch({ type: 'DELETE_LABEL', payload: labelId });
      
      if (label) {
        toast({
          title: 'Etiqueta excluída',
          description: `Etiqueta "${label.name}" foi excluída.`,
          variant: 'destructive',
        });
      }
    },
    
    getCurrentUser: () => {
      // This would normally come from auth context
      return state.currentBoard?.members[0] || null;
    },
    
    addActivity: addActivity
  };

  // Auto-update card statuses when component mounts or daily
  useEffect(() => {
    if (state.currentBoard) {
      const updatedCards: ProjectCard[] = [];
      
      state.currentBoard.lists.forEach(list => {
        list.cards.forEach(card => {
          const autoStatus = getAutoStatus(card);
          if (autoStatus !== card.status && !card.archived) {
            updatedCards.push({ ...card, status: autoStatus });
          }
        });
      });
      
      // Update cards with auto status changes
      updatedCards.forEach(card => {
        dispatch({ type: 'UPDATE_CARD', payload: card });
      });
    }
  }, [state.currentBoard?.id]); // Only run when board changes

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