import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { CRMState, CustomFunnel, FunnelStage, LeadAdvanced, CRMFilters, CRMMetrics } from '@/types/crm';
import { generateId } from '@/hooks/useUuid';
import { useToast } from '@/hooks/use-toast';

// Initial sample data
const sampleLeads: LeadAdvanced[] = [
  {
    id: generateId(),
    nome: 'João Silva',
    empresa: 'TechCorp',
    email: 'joao@techcorp.com',
    telefone: '(11) 9999-9999',
    fonte: 'Website',
    status: 'quente',
    etapaFunil: 'descoberta',
    valor: 50000,
    probabilidade: 75,
    dataContato: '2024-01-15',
    observacoes: 'Interessado em consultoria estratégica',
    travaEmocional: 'inseguranca_financeira',
    tipoDiscurso: 'tecnico',
    necessidadeOculta: ['Aumentar vendas', 'Reduzir custos'],
    anuncioOrigem: 'Google Ads - Consultoria',
    produtoInteresse: 'Consultoria Estratégica',
    ofertaAtrativa: 'Diagnóstico gratuito',
    gatilhosFuncionais: ['ROI garantido', 'Resultados em 30 dias'],
    pontuacao: 85,
    ultimaInteracao: '2024-01-20',
    vendedorId: 'vendedor-1',
    vendedorNome: 'Maria Santos'
  },
  {
    id: generateId(),
    nome: 'Ana Costa',
    empresa: 'StartupInc',
    email: 'ana@startup.com',
    telefone: '(11) 8888-8888',
    fonte: 'LinkedIn',
    status: 'morno',
    etapaFunil: 'consideracao',
    valor: 25000,
    probabilidade: 50,
    dataContato: '2024-01-10',
    observacoes: 'Precisa de aprovação da diretoria',
    travaEmocional: 'falta_apoio',
    tipoDiscurso: 'emocional',
    necessidadeOculta: ['Escalar negócio'],
    produtoInteresse: 'Mentoria Executiva',
    ofertaAtrativa: 'Plano de crescimento personalizado',
    gatilhosFuncionais: ['Cases de sucesso', 'Garantia de resultado'],
    pontuacao: 65,
    ultimaInteracao: '2024-01-18',
    vendedorId: 'vendedor-2',
    vendedorNome: 'Carlos Lima'
  }
];

const initialStages: FunnelStage[] = [
  {
    id: 'descoberta',
    title: 'Descoberta',
    color: 'hsl(220 70% 50%)',
    position: 0,
    leads: [sampleLeads[0]]
  },
  {
    id: 'qualificacao',
    title: 'Qualificação',
    color: 'hsl(45 100% 50%)',
    position: 1,
    leads: []
  },
  {
    id: 'proposta',
    title: 'Proposta',
    color: 'hsl(30 100% 50%)',
    position: 2,
    leads: [sampleLeads[1]]
  },
  {
    id: 'fechamento',
    title: 'Fechamento',
    color: 'hsl(120 60% 50%)',
    position: 3,
    leads: []
  }
];

const defaultFunnel: CustomFunnel = {
  id: generateId(),
  name: 'Funil de Vendas Principal',
  description: 'Processo principal de qualificação e conversão de leads',
  stages: initialStages,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
};

const initialState: CRMState = {
  currentFunnel: defaultFunnel,
  funnels: [defaultFunnel],
  filters: {
    search: '',
    dateRange: null,
    leadSource: [],
    responsible: [],
    funnel: null
  },
  metrics: {
    totalLeads: 2,
    conversionRate: 25,
    averageCycleTime: 30,
    predictedRevenue: 75000
  },
  selectedLead: null,
  isLoading: false,
  draggedLead: null
};

// Actions
type CRMAction =
  | { type: 'SET_CURRENT_FUNNEL'; payload: CustomFunnel }
  | { type: 'SET_FILTERS'; payload: Partial<CRMFilters> }
  | { type: 'SET_SELECTED_LEAD'; payload: LeadAdvanced | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DRAGGED_LEAD'; payload: LeadAdvanced | null }
  | { type: 'CREATE_FUNNEL'; payload: { name: string; description?: string; stages: Omit<FunnelStage, 'id' | 'leads'>[] } }
  | { type: 'UPDATE_FUNNEL'; payload: { funnelId: string; updates: Partial<CustomFunnel> } }
  | { type: 'DELETE_FUNNEL'; payload: string }
  | { type: 'ADD_STAGE'; payload: { funnelId: string; stage: Omit<FunnelStage, 'id' | 'leads'> } }
  | { type: 'UPDATE_STAGE'; payload: { funnelId: string; stageId: string; updates: Partial<FunnelStage> } }
  | { type: 'DELETE_STAGE'; payload: { funnelId: string; stageId: string } }
  | { type: 'MOVE_LEAD'; payload: { leadId: string; fromStageId: string; toStageId: string; funnelId: string } }
  | { type: 'UPDATE_LEAD'; payload: LeadAdvanced }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'UPDATE_METRICS'; payload: Partial<CRMMetrics> };

// Reducer
const crmReducer = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'SET_CURRENT_FUNNEL':
      return { ...state, currentFunnel: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'SET_SELECTED_LEAD':
      return { ...state, selectedLead: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_DRAGGED_LEAD':
      return { ...state, draggedLead: action.payload };

    case 'CREATE_FUNNEL': {
      const newFunnel: CustomFunnel = {
        id: generateId(),
        name: action.payload.name,
        description: action.payload.description,
        stages: action.payload.stages.map((stage, index) => ({
          ...stage,
          id: generateId(),
          position: index,
          leads: []
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      return {
        ...state,
        funnels: [...state.funnels, newFunnel],
        currentFunnel: newFunnel
      };
    }

    case 'UPDATE_FUNNEL':
      return {
        ...state,
        funnels: state.funnels.map(funnel =>
          funnel.id === action.payload.funnelId
            ? { ...funnel, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : funnel
        ),
        currentFunnel: state.currentFunnel?.id === action.payload.funnelId
          ? { ...state.currentFunnel, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : state.currentFunnel
      };

    case 'DELETE_FUNNEL':
      const updatedFunnels = state.funnels.filter(f => f.id !== action.payload);
      return {
        ...state,
        funnels: updatedFunnels,
        currentFunnel: state.currentFunnel?.id === action.payload 
          ? (updatedFunnels[0] || null)
          : state.currentFunnel
      };

    case 'MOVE_LEAD': {
      const { leadId, fromStageId, toStageId, funnelId } = action.payload;
      
      return {
        ...state,
        funnels: state.funnels.map(funnel => {
          if (funnel.id !== funnelId) return funnel;
          
          const lead = funnel.stages
            .find(stage => stage.id === fromStageId)
            ?.leads.find(l => l.id === leadId);
          
          if (!lead) return funnel;
          
          return {
            ...funnel,
            stages: funnel.stages.map(stage => {
              if (stage.id === fromStageId) {
                return {
                  ...stage,
                  leads: stage.leads.filter(l => l.id !== leadId)
                };
              }
              if (stage.id === toStageId) {
                return {
                  ...stage,
                  leads: [...stage.leads, { ...lead, etapaFunil: stage.id as any }]
                };
              }
              return stage;
            })
          };
        }),
        currentFunnel: state.currentFunnel?.id === funnelId
          ? state.funnels.find(f => f.id === funnelId) || state.currentFunnel
          : state.currentFunnel
      };
    }

    case 'UPDATE_LEAD':
      return {
        ...state,
        funnels: state.funnels.map(funnel => ({
          ...funnel,
          stages: funnel.stages.map(stage => ({
            ...stage,
            leads: stage.leads.map(lead =>
              lead.id === action.payload.id ? action.payload : lead
            )
          }))
        })),
        selectedLead: state.selectedLead?.id === action.payload.id 
          ? action.payload 
          : state.selectedLead
      };

    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload }
      };

    default:
      return state;
  }
};

// Context
interface CRMContextType {
  state: CRMState;
  setCurrentFunnel: (funnel: CustomFunnel) => void;
  setFilters: (filters: Partial<CRMFilters>) => void;
  setSelectedLead: (lead: LeadAdvanced | null) => void;
  createFunnel: (data: { name: string; description?: string; stages: Omit<FunnelStage, 'id' | 'leads'>[] }) => void;
  updateFunnel: (funnelId: string, updates: Partial<CustomFunnel>) => void;
  deleteFunnel: (funnelId: string) => void;
  moveLead: (leadId: string, fromStageId: string, toStageId: string) => void;
  updateLead: (lead: LeadAdvanced) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = (): CRMContextType => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

interface CRMProviderProps {
  children: ReactNode;
}

export const CRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);
  const { toast } = useToast();

  const setCurrentFunnel = useCallback((funnel: CustomFunnel) => {
    dispatch({ type: 'SET_CURRENT_FUNNEL', payload: funnel });
  }, []);

  const setFilters = useCallback((filters: Partial<CRMFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSelectedLead = useCallback((lead: LeadAdvanced | null) => {
    dispatch({ type: 'SET_SELECTED_LEAD', payload: lead });
  }, []);

  const createFunnel = useCallback((data: { name: string; description?: string; stages: Omit<FunnelStage, 'id' | 'leads'>[] }) => {
    dispatch({ type: 'CREATE_FUNNEL', payload: data });
    toast({
      title: "Funil criado",
      description: `O funil "${data.name}" foi criado com sucesso.`,
    });
  }, [toast]);

  const updateFunnel = useCallback((funnelId: string, updates: Partial<CustomFunnel>) => {
    dispatch({ type: 'UPDATE_FUNNEL', payload: { funnelId, updates } });
  }, []);

  const deleteFunnel = useCallback((funnelId: string) => {
    dispatch({ type: 'DELETE_FUNNEL', payload: funnelId });
    toast({
      title: "Funil excluído",
      description: "O funil foi excluído com sucesso.",
    });
  }, [toast]);

  const moveLead = useCallback((leadId: string, fromStageId: string, toStageId: string) => {
    if (!state.currentFunnel) return;
    
    dispatch({ 
      type: 'MOVE_LEAD', 
      payload: { 
        leadId, 
        fromStageId, 
        toStageId, 
        funnelId: state.currentFunnel.id 
      } 
    });
  }, [state.currentFunnel]);

  const updateLead = useCallback((lead: LeadAdvanced) => {
    dispatch({ type: 'UPDATE_LEAD', payload: lead });
  }, []);

  const value: CRMContextType = {
    state,
    setCurrentFunnel,
    setFilters,
    setSelectedLead,
    createFunnel,
    updateFunnel,
    deleteFunnel,
    moveLead,
    updateLead
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};