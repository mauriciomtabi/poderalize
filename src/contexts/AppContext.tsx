import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Tipos do estado global da aplicação
interface AppState {
  isLoading: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
  } | null;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
  }>;
  settings: {
    theme: 'light' | 'dark';
    language: 'pt-BR' | 'en-US';
    notifications: boolean;
    autoSave: boolean;
  };
}

// Ações do reducer
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AppState['user'] }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Estado inicial
const initialState: AppState = {
  isLoading: false,
  user: null,
  notifications: [],
  settings: {
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
    autoSave: true,
  },
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            ...action.payload,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
          },
        ],
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setUser: (user: AppState['user']) => void;
    addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    updateSettings: (settings: Partial<AppState['settings']>) => void;
    clearNotifications: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { toast } = useToast();

  const actions = {
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    
    setUser: (user: AppState['user']) => dispatch({ type: 'SET_USER', payload: user }),
    
    addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      // Também exibir como toast se as notificações estiverem habilitadas
      if (state.settings.notifications) {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === 'error' ? 'destructive' : 'default',
        });
      }
    },
    
    removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    
    updateSettings: (settings: Partial<AppState['settings']>) => 
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook para usar o contexto
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};