import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectsState, ProjectBoard, ProjectList, ProjectCard, ViewType, FilterState, Priority, CardStatus } from '@/types/projects';
import { useProjectBoards, ProjectBoard as DBProjectBoard } from '@/hooks/useProjectBoards';
import { useProjectLists, ProjectList as DBProjectList } from '@/hooks/useProjectLists';
import { useProjectCards, ProjectCard as DBProjectCard } from '@/hooks/useProjectCards';
import { useProjectLabels, ProjectLabel } from '@/hooks/useProjectLabels';
import { useProjectMembers, ProjectMember } from '@/hooks/useProjectMembers';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Transform Supabase data to match our types
const transformDBBoard = (dbBoard: DBProjectBoard, lists: ProjectList[], labels: any[], members: any[]): ProjectBoard => {
  return {
    id: dbBoard.id,
    title: dbBoard.title,
    description: dbBoard.description,
    status: dbBoard.status as any,
    lists: lists,
    members: members,
    labels: labels,
    cardColor: 'default',
    settings: dbBoard.settings || {
      visibility: 'private',
      allowComments: true,
      allowVoting: false,
      cardAging: false,
      calendarFeed: false
    },
    createdBy: dbBoard.user_id,
    createdAt: dbBoard.created_at,
    updatedAt: dbBoard.updated_at,
    background: dbBoard.background
  };
};

const transformDBList = (dbList: DBProjectList, cards: ProjectCard[]): ProjectList => {
  return {
    id: dbList.id,
    title: dbList.title,
    color: dbList.color,
    position: dbList.position,
    cards: cards,
    archived: dbList.archived,
    subscribed: dbList.subscribed,
    rules: dbList.rules || []
  };
};

const transformDBCard = (dbCard: DBProjectCard): ProjectCard => {
  const cf = (dbCard.custom_fields as any) || {};
  const checklists = Array.isArray(cf.checklists) ? cf.checklists : [];
  const comments = Array.isArray(cf.comments) ? cf.comments : [];
  const attachments = Array.isArray(cf.attachments) ? cf.attachments : [];
  const activities = Array.isArray(cf.activities) ? cf.activities : [];

  return {
    id: dbCard.id,
    title: dbCard.title,
    description: dbCard.description,
    status: dbCard.status as CardStatus,
    priority: dbCard.priority as Priority,
    labels: [],
    assignees: [],
    dueDate: dbCard.due_date,
    startDate: dbCard.start_date,
    estimatedHours: dbCard.estimated_hours,
    actualHours: dbCard.actual_hours,
    checklists,
    attachments,
    comments,
    activities,
    position: dbCard.position,
    listId: dbCard.list_id,
    createdBy: dbCard.created_by,
    createdAt: dbCard.created_at,
    updatedAt: dbCard.updated_at,
    cover: dbCard.cover,
    location: dbCard.location,
    customFields: cf,
    archived: dbCard.archived,
    watching: dbCard.watching
  };
};

const transformDBLabel = (dbLabel: ProjectLabel) => {
  return {
    id: dbLabel.id,
    name: dbLabel.name,
    color: dbLabel.color,
    description: dbLabel.description
  };
};

const transformDBMember = (dbMember: ProjectMember) => {
  return {
    id: dbMember.id,
    name: dbMember.name,
    email: dbMember.email,
    avatar: dbMember.avatar,
    role: dbMember.role as any
  };
};

const initialFilters: FilterState = {
  search: '',
  members: [],
  labels: [],
  dueDate: null,
  cardStatus: [],
  priority: [],
  showMyCards: false,
  archived: false
};

const initialState: ProjectsState = {
  currentBoard: null,
  boards: [],
  currentView: 'kanban',
  filters: initialFilters,
  draggedItem: null,
  isLoading: true,
  selectedCard: null,
  calendarDate: new Date()
};

interface ProjectsContextType {
  state: ProjectsState;
  actions: {
    // View actions
    setCurrentView: (view: ViewType) => void;
    setFilters: (filters: Partial<FilterState>) => void;
    resetFilters: () => void;
    setSelectedCard: (card: ProjectCard | null) => void;
    setDraggedItem: (item: { type: 'card' | 'list'; id: string } | null) => void;
    
    // Board actions
    setCurrentBoard: (board: ProjectBoard | null) => void;
    createBoard: (title: string, description?: string) => Promise<boolean>;
    updateBoard: (updates: Partial<ProjectBoard>) => Promise<boolean>;
    deleteBoard: (boardId: string) => Promise<boolean>;
    setCardColor: (color: string) => Promise<boolean>;
    
    // List actions
    addList: (title: string, color: string) => Promise<boolean>;
    updateList: (listId: string, updates: Partial<ProjectList>) => Promise<boolean>;
    deleteList: (listId: string) => Promise<boolean>;
    moveList: (listId: string, newPosition: number) => Promise<boolean>;
    archiveList: (listId: string) => Promise<boolean>;
    
    // Card actions
    addCard: (listId: string, card: Omit<ProjectCard, 'id' | 'position' | 'createdAt' | 'updatedAt' | 'activities'>) => Promise<boolean>;
    updateCard: (card: ProjectCard) => Promise<boolean>;
    deleteCard: (cardId: string) => Promise<boolean>;
    moveCard: (cardId: string, sourceListId: string, destListId: string, newPosition: number) => Promise<boolean>;
    duplicateCard: (cardId: string) => Promise<boolean>;
    archiveCard: (cardId: string) => Promise<boolean>;
    
    // Label actions
    addLabel: (name: string, color: string, description?: string) => Promise<boolean>;
    updateLabel: (labelId: string, updates: Partial<{ name: string; color: string; description: string }>) => Promise<boolean>;
    deleteLabel: (labelId: string) => Promise<boolean>;
    
    // Member actions
    addMember: (name: string, email: string, role?: string) => Promise<boolean>;
    updateMember: (memberId: string, updates: Partial<ProjectMember>) => Promise<boolean>;
    removeMember: (memberId: string) => Promise<boolean>;
    
    // Utility actions
    getCurrentUser: () => any;
    getFilteredCards: () => ProjectCard[];
    addActivity: (cardId: string, type: string, description: string, metadata?: any) => Promise<boolean>;
  };
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<ProjectsState>(initialState);
  
  // Supabase hooks
  const boardsHook = useProjectBoards();
  const listsHook = useProjectLists(state.currentBoard?.id);
  const cardsHook = useProjectCards();
  const labelsHook = useProjectLabels(state.currentBoard?.id);
  const membersHook = useProjectMembers(state.currentBoard?.id);

  // Refetch lists when current board changes
  useEffect(() => {
    if (state.currentBoard?.id) {
      listsHook.fetchLists();
    }
  }, [state.currentBoard?.id]);

  // Load all boards and set initial board, create one if none exists
  useEffect(() => {
    const handleBoardsLoaded = async () => {
      if (!boardsHook.isLoading && user) {
        if (boardsHook.boards.length === 0) {
          // No boards exist, create initial board
          setState(prev => ({ ...prev, isLoading: true }));
          const { createInitialBoard } = await import('@/utils/projectMigration');
          const newBoard = await createInitialBoard(user.id, user.email, user.full_name);
          
          if (newBoard) {
            // Refresh boards after creation
            await boardsHook.fetchBoards();
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else if (!state.currentBoard) {
          // Boards exist, load the first one
          loadBoard(boardsHook.boards[0].id);
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        boards: boardsHook.boards.map(board => transformDBBoard(board, [], [], [])),
        isLoading: boardsHook.isLoading
      }));
    };
    
    handleBoardsLoaded();
  }, [boardsHook.boards, boardsHook.isLoading, user]);

  // Load current board data
  const loadBoard = async (boardId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const board = boardsHook.boards.find(b => b.id === boardId);
      if (!board) return;

      // Create a temporary lists hook for this specific board
      const { data: listsData, error: listsError } = await supabase
        .from('project_lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (listsError) {
        console.error('Error fetching lists:', listsError);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch labels and members directly from Supabase for reliability
      const [labelsResponse, membersResponse] = await Promise.all([
        supabase
          .from('project_labels')
          .select('*')
          .eq('board_id', boardId),
        supabase
          .from('project_members')
          .select('*')
          .eq('board_id', boardId)
      ]);

      const labels = labelsResponse.data?.map(transformDBLabel) || [];
      const members = membersResponse.data?.map(transformDBMember) || [];

      // Load cards for all lists
      const allCards: ProjectCard[] = [];
      const lists = listsData || [];
      
      for (const list of lists) {
        const listCards = await cardsHook.fetchAllBoardCards(boardId);
        allCards.push(...listCards.filter(c => c.list_id === list.id).map(transformDBCard));
      }

      // Group cards by list
      const listsWithCards = lists.map(list => 
        transformDBList(list, allCards.filter(card => card.listId === list.id))
      );

      const transformedBoard = transformDBBoard(
        board,
        listsWithCards,
        labels,
        members
      );

      setState(prev => ({
        ...prev,
        currentBoard: transformedBoard,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading board:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Actions
  const actions = {
    // View actions
    setCurrentView: (view: ViewType) => {
      setState(prev => ({ ...prev, currentView: view }));
    },

    setFilters: (filters: Partial<FilterState>) => {
      setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
    },

    resetFilters: () => {
      setState(prev => ({ ...prev, filters: initialFilters }));
    },

    setSelectedCard: (card: ProjectCard | null) => {
      setState(prev => ({ ...prev, selectedCard: card }));
    },

    setDraggedItem: (item: { type: 'card' | 'list'; id: string } | null) => {
      setState(prev => ({ ...prev, draggedItem: item }));
    },

    // Board actions
    setCurrentBoard: (board: ProjectBoard | null) => {
      setState(prev => ({ ...prev, currentBoard: board }));
      if (board) {
        loadBoard(board.id);
      }
    },

    createBoard: async (title: string, description?: string) => {
      const result = await boardsHook.createBoard({
        title,
        description,
        status: 'active',
        settings: {
          visibility: 'private',
          allowComments: true,
          allowVoting: false,
          cardAging: false,
          calendarFeed: false
        }
      });
      
      if (result) {
        await loadBoard(result.id);
        return true;
      }
      return false;
    },

    updateBoard: async (updates: Partial<ProjectBoard>) => {
      if (!state.currentBoard) return false;
      return await boardsHook.updateBoard(state.currentBoard.id, updates as any);
    },

    deleteBoard: async (boardId: string) => {
      const result = await boardsHook.deleteBoard(boardId);
      if (result && state.currentBoard?.id === boardId) {
        setState(prev => ({ ...prev, currentBoard: null }));
      }
      return result;
    },

    // List actions
    addList: async (title: string, color: string) => {
      if (!state.currentBoard) return false;
      
      // Get current lists count
      const { data: existingLists } = await supabase
        .from('project_lists')
        .select('id')
        .eq('board_id', state.currentBoard.id);
      
      const result = await listsHook.createList({
        board_id: state.currentBoard.id,
        title,
        color,
        position: existingLists?.length || 0,
        archived: false,
        subscribed: true
      });
      
      if (result) {
        await loadBoard(state.currentBoard.id);
        return true;
      }
      return false;
    },

    updateList: async (listId: string, updates: Partial<ProjectList>) => {
      const result = await listsHook.updateList(listId, updates as any);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    deleteList: async (listId: string) => {
      const result = await listsHook.deleteList(listId);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    moveList: async (listId: string, newPosition: number) => {
      const result = await listsHook.updateList(listId, { position: newPosition });
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    archiveList: async (listId: string) => {
      const result = await listsHook.updateList(listId, { archived: true });
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    // Card actions
    addCard: async (listId: string, card: Omit<ProjectCard, 'id' | 'position' | 'createdAt' | 'updatedAt' | 'activities'>) => {
      if (!user) return false;

      const result = await cardsHook.createCard({
        list_id: listId,
        title: card.title,
        description: card.description,
        status: card.status,
        priority: card.priority,
        due_date: card.dueDate,
        start_date: card.startDate,
        estimated_hours: card.estimatedHours,
        actual_hours: card.actualHours,
        position: 0,
        cover: card.cover,
        location: card.location,
        custom_fields: {
          ...(card.customFields || {}),
          checklists: card.checklists || [],
          comments: card.comments || [],
          attachments: card.attachments || [],
          activities: []
        },
        archived: card.archived,
        watching: card.watching,
        created_by: user.id
      });
      
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
        return true;
      }
      return false;
    },

    updateCard: async (card: ProjectCard) => {
      const result = await cardsHook.updateCard(card.id, {
        title: card.title,
        description: card.description,
        status: card.status,
        priority: card.priority,
        due_date: card.dueDate,
        start_date: card.startDate,
        estimated_hours: card.estimatedHours,
        actual_hours: card.actualHours,
        cover: card.cover,
        location: card.location,
        custom_fields: {
          ...(card.customFields || {}),
          checklists: card.checklists || [],
          comments: card.comments || [],
          attachments: card.attachments || [],
          activities: card.activities || []
        },
        archived: card.archived,
        watching: card.watching
      } as any);
      
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    deleteCard: async (cardId: string) => {
      const result = await cardsHook.deleteCard(cardId);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    moveCard: async (cardId: string, sourceListId: string, destListId: string, newPosition: number) => {
      const result = await cardsHook.updateCard(cardId, {
        list_id: destListId,
        position: newPosition
      } as any);
      
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    duplicateCard: async (cardId: string) => {
      try {
        if (!state.currentBoard) return false;
        
        // Find the original card
        const originalCard = state.currentBoard.lists
          .flatMap(list => list.cards)
          .find(card => card.id === cardId);
          
        if (!originalCard) return false;

        // Create duplicate with new position
        const cardsInSameList = state.currentBoard.lists
          .find(list => list.id === originalCard.listId)?.cards || [];
        const newPosition = cardsInSameList.length;

        const duplicatedCard = await cardsHook.createCard({
          list_id: originalCard.listId,
          title: `${originalCard.title} (cópia)`,
          description: originalCard.description,
          status: originalCard.status,
          priority: originalCard.priority,
          position: newPosition,
          cover: originalCard.cover,
          location: originalCard.location,
          custom_fields: originalCard.customFields,
          estimated_hours: originalCard.estimatedHours,
          actual_hours: 0, // Reset actual hours for copy
          start_date: originalCard.startDate,
          due_date: originalCard.dueDate,
          archived: false,
          watching: false,
          created_by: user?.id || ''
        });

        if (duplicatedCard && state.currentBoard) {
          await loadBoard(state.currentBoard.id);
          toast({
            title: "Cartão duplicado",
            description: "O cartão foi duplicado com sucesso",
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error duplicating card:', error);
        toast({
          title: "Erro",
          description: "Erro ao duplicar cartão",
          variant: "destructive",
        });
        return false;
      }
    },

    archiveCard: async (cardId: string) => {
      const result = await cardsHook.updateCard(cardId, { archived: true } as any);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    // Label actions
    addLabel: async (name: string, color: string, description?: string) => {
      if (!state.currentBoard) return false;
      
      const result = await labelsHook.createLabel({
        board_id: state.currentBoard.id,
        name,
        color,
        description
      });
      
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
        return true;
      }
      return false;
    },

    updateLabel: async (labelId: string, updates: Partial<{ name: string; color: string; description: string }>) => {
      const result = await labelsHook.updateLabel(labelId, updates);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    deleteLabel: async (labelId: string) => {
      const result = await labelsHook.deleteLabel(labelId);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    // Member actions
    addMember: async (name: string, email: string, role: string = 'member') => {
      if (!state.currentBoard || !user) return false;
      
      const result = await membersHook.addMember({
        board_id: state.currentBoard.id,
        user_id: uuidv4(), // Generate a temp ID for now
        name,
        email,
        role
      });
      
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
        return true;
      }
      return false;
    },

    updateMember: async (memberId: string, updates: Partial<ProjectMember>) => {
      const result = await membersHook.updateMember(memberId, updates);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    removeMember: async (memberId: string) => {
      const result = await membersHook.removeMember(memberId);
      if (result && state.currentBoard) {
        await loadBoard(state.currentBoard.id);
      }
      return result;
    },

    // Additional utility methods for compatibility
    setCardColor: async (color: string) => {
      if (!state.currentBoard) return false;
      return await boardsHook.updateBoard(state.currentBoard.id, { cardColor: color } as any);
    },

    getCurrentUser: () => {
      return user ? {
        id: user.id,
        name: (user as any).user_metadata?.full_name || user.email,
        email: user.email
      } : null;
    },

    getFilteredCards: () => {
      if (!state.currentBoard) return [];
      
      let allCards: ProjectCard[] = [];
      state.currentBoard.lists.forEach(list => {
        allCards.push(...list.cards);
      });

      // Apply filters
      return allCards.filter(card => {
        // Search filter
        if (state.filters.search && !card.title.toLowerCase().includes(state.filters.search.toLowerCase())) {
          return false;
        }

        // Status filter
        if (state.filters.cardStatus.length > 0 && !state.filters.cardStatus.includes(card.status)) {
          return false;
        }

        // Priority filter
        if (state.filters.priority.length > 0 && !state.filters.priority.includes(card.priority)) {
          return false;
        }

        // Member filter
        if (state.filters.members.length > 0) {
          const hasMatchingMember = card.assignees.some(assignee => 
            state.filters.members.includes(assignee.id)
          );
          if (!hasMatchingMember) return false;
        }

        // Label filter
        if (state.filters.labels.length > 0) {
          const hasMatchingLabel = card.labels.some(label => 
            state.filters.labels.includes(label.id)
          );
          if (!hasMatchingLabel) return false;
        }

        // Due date filter
        if (state.filters.dueDate) {
          const now = new Date();
          const dueDate = card.dueDate ? new Date(card.dueDate) : null;
          
          switch (state.filters.dueDate) {
            case 'no-date':
              if (dueDate) return false;
              break;
            case 'overdue':
              if (!dueDate || dueDate >= now) return false;
              break;
            case 'today':
              if (!dueDate || dueDate.toDateString() !== now.toDateString()) return false;
              break;
            case 'week':
              if (!dueDate) return false;
              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              if (dueDate > weekFromNow) return false;
              break;
            case 'month':
              if (!dueDate) return false;
              const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              if (dueDate > monthFromNow) return false;
              break;
          }
        }

        // Show my cards filter
        if (state.filters.showMyCards && user) {
          const isAssignedToMe = card.assignees.some(assignee => assignee.id === user.id);
          if (!isAssignedToMe) return false;
        }

        // Archived filter
        if (state.filters.archived !== card.archived) {
          return false;
        }

        return true;
      });
    },

    addActivity: async (cardId: string, type: string, description: string, metadata?: any) => {
      // For now, just return true as activities will be handled separately
      // In a full implementation, you'd want to add activities to a separate table
      return true;
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
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};