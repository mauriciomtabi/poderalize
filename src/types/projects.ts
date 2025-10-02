export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type CardStatus = 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
export type ViewType = 'kanban' | 'table' | 'calendar' | 'dashboard';

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorName: string;
  createdAt: string;
  editedAt?: string;
  mentions: string[];
}

export interface Activity {
  id: string;
  type: 'create' | 'update' | 'move' | 'archive' | 'restore' | 'comment' | 'assign' | 'due_date' | 'complete' | 'checklist' | 'attachment';
  description: string;
  author: string;
  authorName: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ProjectCard {
  id: string;
  title: string;
  description?: string;
  status: CardStatus;
  priority: Priority;
  labels: Label[];
  assignees: Member[];
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  checklists: Checklist[];
  attachments: Attachment[];
  comments: Comment[];
  activities: Activity[];
  position: number;
  listId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional Trello-like features
  cover?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  customFields?: Record<string, any>;
  archived: boolean;
  watching: boolean;
}

export interface ProjectList {
  id: string;
  title: string;
  color: string;
  position: number;
  cards: ProjectCard[];
  archived: boolean;
  subscribed: boolean;
  
  // List automation rules
  rules?: {
    id: string;
    name: string;
    trigger: string;
    action: string;
    enabled: boolean;
  }[];
}

export interface ProjectBoard {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  lists: ProjectList[];
  members: Member[];
  labels: Label[];
  cardColor?: string; // Color theme for cards in this board
  settings: {
    visibility: 'private' | 'team' | 'public';
    allowComments: boolean;
    allowVoting: boolean;
    cardAging: boolean;
    calendarFeed: boolean;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Background and styling
  background?: {
    type: 'color' | 'image';
    value: string;
  };
}

export interface FilterState {
  search: string;
  members: string[];
  labels: string[];
  dueDate: 'no-date' | 'overdue' | 'today' | 'week' | 'month' | null;
  cardStatus: CardStatus[];
  priority: Priority[];
  showMyCards: boolean;
  archived: boolean;
}

export interface ProjectsState {
  currentBoard: ProjectBoard | null;
  boards: ProjectBoard[];
  currentView: ViewType;
  filters: FilterState;
  draggedItem: {
    type: 'card' | 'list';
    id: string;
  } | null;
  isLoading: boolean;
  selectedCard: ProjectCard | null;
  
  // View-specific states
  calendarDate: Date;
}

export interface DashboardMetrics {
  totalCards: number;
  completedCards: number;
  overdue: number;
  completionRate: number;
  averageTimeToComplete: number;
  cardsByStatus: Record<CardStatus, number>;
  cardsByPriority: Record<Priority, number>;
  cardsByMember: Record<string, number>;
  cardsByLabel: Record<string, number>;
  activityTrend: {
    date: string;
    cardsCreated: number;
    cardsCompleted: number;
  }[];
}

export interface ChecklistTemplateItem {
  id: string;
  templateId: string;
  text: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplate {
  id: string;
  userId: string;
  boardId?: string;
  title: string;
  description?: string;
  isGlobal: boolean;
  items: ChecklistTemplateItem[];
  createdAt: string;
  updatedAt: string;
}