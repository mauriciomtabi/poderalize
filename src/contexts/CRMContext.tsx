import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { FunnelStage, CustomFunnel, CRMState, CRMFilters, CRMMetrics, LeadAdvanced } from '@/types/crm';
import { useFunnels } from '@/hooks/useFunnels';
import { useLeads } from '@/hooks/useLeads';
import { useFunnelLeads } from '@/hooks/useFunnelLeads';

// Initial state - now using real data from hooks
const initialFilters: CRMFilters = {
  search: '',
  dateRange: null,
  leadSource: [],
  responsible: [],
  funnel: null
};

const initialMetrics: CRMMetrics = {
  totalLeads: 0,
  conversionRate: 0,
  averageCycleTime: 0,
  predictedRevenue: 0
};

const initialState: CRMState = {
  currentFunnel: null,
  funnels: [],
  leads: [], // Add leads array to initial state
  filters: initialFilters,
  metrics: initialMetrics,
  selectedLead: null,
  isLoading: true,
  draggedLead: null
};

// Actions
type CRMAction =
  | { type: 'SET_CURRENT_FUNNEL'; payload: CustomFunnel | null }
  | { type: 'SET_FUNNELS'; payload: CustomFunnel[] }
  | { type: 'SET_FILTERS'; payload: Partial<CRMFilters> }
  | { type: 'SET_SELECTED_LEAD'; payload: LeadAdvanced | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DRAGGED_LEAD'; payload: LeadAdvanced | null }
  | { type: 'SET_LEADS'; payload: LeadAdvanced[] }
  | { type: 'UPDATE_METRICS'; payload: Partial<CRMMetrics> };

// Reducer
const crmReducer = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'SET_CURRENT_FUNNEL':
      return { ...state, currentFunnel: action.payload };

    case 'SET_FUNNELS':
      return { ...state, funnels: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'SET_SELECTED_LEAD':
      return { ...state, selectedLead: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_DRAGGED_LEAD':
      return { ...state, draggedLead: action.payload };

    case 'SET_LEADS':
      return { ...state, leads: action.payload };

    case 'UPDATE_METRICS':
      return { ...state, metrics: { ...state.metrics, ...action.payload } };

    default:
      return state;
  }
};

interface CRMContextType {
  // State properties (for backward compatibility)
  currentFunnel: CustomFunnel | null;
  funnels: CustomFunnel[];
  filters: CRMFilters;
  metrics: CRMMetrics;
  selectedLead: LeadAdvanced | null;
  isLoading: boolean;
  draggedLead: LeadAdvanced | null;
  leads: LeadAdvanced[];
  
  // Actions
  setCurrentFunnel: (funnel: CustomFunnel | null) => void;
  createFunnel: (funnel: { name: string; description?: string; stages: { title: string; color: string; position: number }[] }) => Promise<void>;
  updateFunnel: (id: string, updates: Partial<CustomFunnel>) => void;
  deleteFunnel: (id: string) => void;
  setLeads: (leads: LeadAdvanced[]) => void;
  addLead: (lead: Omit<LeadAdvanced, 'id'>, stageId?: string) => Promise<void>;
  updateLead: (id: string, updates: Partial<LeadAdvanced>) => void;
  deleteLead: (id: string) => void;
  moveLead: (leadId: string, newStageId: string) => void;
  setSelectedLead: (lead: LeadAdvanced | null) => void;
  setFilters: (filters: Partial<CRMFilters>) => void;
  updateMetrics: (metrics: Partial<CRMMetrics>) => void;
  setLoading: (loading: boolean) => void;
  
  // Real data hooks integration
  funnelHooks: ReturnType<typeof useFunnels>;
  leadHooks: ReturnType<typeof useLeads>;
  funnelLeadHooks: ReturnType<typeof useFunnelLeads>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = (): CRMContextType => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);
  
  // Real data hooks
  const funnelHooks = useFunnels();
  const leadHooks = useLeads();
  const funnelLeadHooks = useFunnelLeads(state.currentFunnel?.id);

  // Sync real data with state
  useEffect(() => {
    if (funnelHooks.funnels.length > 0) {
      // Convert Supabase funnel format to CRM format
      const convertedFunnels: CustomFunnel[] = funnelHooks.funnels.map(funnel => ({
        id: funnel.id,
        name: funnel.name,
        description: funnel.description || '',
        isActive: funnel.is_active || true,
        createdAt: funnel.created_at,
        updatedAt: funnel.updated_at,
        stages: funnel.stages?.map(stage => ({
          id: stage.id,
          title: stage.title,
          color: stage.color,
          position: stage.position,
          leads: [] // Leads are loaded separately via funnelLeadHooks
        })) || []
      }));

      dispatch({ type: 'SET_FUNNELS', payload: convertedFunnels });
      
      // Set current funnel if none selected
      if (!state.currentFunnel && convertedFunnels.length > 0) {
        dispatch({ type: 'SET_CURRENT_FUNNEL', payload: convertedFunnels[0] });
      }
    }
    
    // Set loading state based on hooks
    dispatch({ type: 'SET_LOADING', payload: funnelHooks.isLoading });
  }, [funnelHooks.funnels, funnelHooks.isLoading, state.currentFunnel]);

  useEffect(() => {
    if (leadHooks.leads.length >= 0) {
      // Convert leads to LeadAdvanced format
      const convertedLeads: LeadAdvanced[] = leadHooks.leads.map(lead => ({
        id: lead.id,
        nome: lead.nome,
        empresa: lead.empresa,
        email: lead.email,
        telefone: lead.telefone || '',
        fonte: lead.fonte,
        status: 'morno', // Default status for CRM context
        etapaFunil: lead.etapa_funil || 'descoberta',
        valor: lead.valor || 0,
        probabilidade: lead.probabilidade || 0,
        dataContato: lead.data_contato || new Date().toISOString(),
        observacoes: lead.observacoes,
        travaEmocional: lead.trava_emocional || 'inseguranca_financeira',
        tipoDiscurso: lead.tipo_discurso || 'tecnico',
        necessidadeOculta: lead.necessidade_oculta || [],
        anuncioOrigem: lead.anuncio_origem || '',
        produtoInteresse: lead.produto_interesse || '',
        ofertaAtrativa: lead.oferta_atrativa || '',
        gatilhosFuncionais: lead.gatilhos_funcionais || [],
        pontuacao: lead.pontuacao || 0,
        ultimaInteracao: lead.ultima_interacao ? new Date(lead.ultima_interacao).toISOString() : new Date().toISOString(),
        vendedorId: lead.vendedor_id || '',
        vendedorNome: lead.vendedor_nome || ''
      }));

      dispatch({ type: 'SET_LEADS', payload: convertedLeads });
      
      // Update metrics
      const metrics: CRMMetrics = {
        totalLeads: convertedLeads.length,
        conversionRate: convertedLeads.length > 0 ? (convertedLeads.filter(l => l.status === 'quente').length / convertedLeads.length) * 100 : 0,
        averageCycleTime: 30, // Default value
        predictedRevenue: convertedLeads.reduce((sum, lead) => sum + (lead.valor * (lead.probabilidade / 100)), 0)
      };
      
      dispatch({ type: 'UPDATE_METRICS', payload: metrics });
    }
  }, [leadHooks.leads]);

  // Inject leads from funnelLeadHooks into current funnel stages
  useEffect(() => {
    if (state.currentFunnel && funnelLeadHooks.funnelLeads && leadHooks.leads.length > 0) {
      const currentFunnelWithLeads = { ...state.currentFunnel };
      
      // For each stage, populate leads from funnelLeadHooks
      currentFunnelWithLeads.stages = currentFunnelWithLeads.stages.map(stage => {
        const stageLeads = funnelLeadHooks.funnelLeads[stage.id] || [];
        
        // Convert Lead[] to LeadAdvanced[] using full lead data
        const leadsAdvanced: LeadAdvanced[] = stageLeads.map(lead => {
          const fullLead = leadHooks.leads.find(l => l.id === lead.id);
          return {
            id: lead.id,
            nome: lead.nome,
            empresa: lead.empresa,
            email: lead.email,
            telefone: lead.telefone || '',
            fonte: lead.fonte,
            status: (fullLead?.status_advanced || 'morno') as 'frio' | 'morno' | 'quente',
            etapaFunil: (fullLead?.etapa_funil || 'descoberta') as 'descoberta' | 'consideracao' | 'decisao' | 'fechamento' | 'fidelizacao',
            valor: lead.valor || 0,
            probabilidade: lead.probabilidade || 0,
            dataContato: fullLead?.data_contato || new Date().toISOString(),
            observacoes: lead.observacoes || '',
            travaEmocional: (fullLead?.trava_emocional || 'inseguranca_financeira') as 'inseguranca_financeira' | 'medo_dar_errado' | 'falta_apoio' | 'falta_tempo' | 'desconfianca',
            tipoDiscurso: (fullLead?.tipo_discurso || 'tecnico') as 'tecnico' | 'emocional' | 'inspirador',
            necessidadeOculta: fullLead?.necessidade_oculta || [],
            anuncioOrigem: fullLead?.anuncio_origem || '',
            produtoInteresse: fullLead?.produto_interesse || '',
            ofertaAtrativa: fullLead?.oferta_atrativa || '',
            gatilhosFuncionais: fullLead?.gatilhos_funcionais || [],
            pontuacao: fullLead?.pontuacao || 0,
            ultimaInteracao: fullLead?.ultima_interacao ? new Date(fullLead.ultima_interacao).toISOString() : new Date().toISOString(),
            vendedorId: fullLead?.vendedor_id || '',
            vendedorNome: fullLead?.vendedor_nome || ''
          };
        });

        return {
          ...stage,
          leads: leadsAdvanced
        };
      });

      dispatch({ type: 'SET_CURRENT_FUNNEL', payload: currentFunnelWithLeads });
    }
  }, [state.currentFunnel?.id, funnelLeadHooks.funnelLeads, leadHooks.leads]);

  // Funnel actions
  const setCurrentFunnel = useCallback((funnel: CustomFunnel | null) => {
    dispatch({ type: 'SET_CURRENT_FUNNEL', payload: funnel });
  }, []);

  const createFunnel = useCallback(async (funnelData: { name: string; description?: string; stages: { title: string; color: string; position: number }[] }) => {
    try {
      await funnelHooks.createFunnel({
        name: funnelData.name,
        description: funnelData.description,
        stages: funnelData.stages.map(stage => ({
          title: stage.title,
          color: stage.color,
          position: stage.position
        }))
      });
    } catch (error) {
      console.error('Error creating funnel:', error);
    }
  }, [funnelHooks]);

  const updateFunnel = useCallback(async (id: string, updates: Partial<CustomFunnel>) => {
    try {
      await funnelHooks.updateFunnel(id, {
        name: updates.name,
        description: updates.description,
        is_active: updates.isActive
      });
    } catch (error) {
      console.error('Error updating funnel:', error);
    }
  }, [funnelHooks]);

  const deleteFunnel = useCallback(async (id: string) => {
    try {
      await funnelHooks.deleteFunnel(id);
    } catch (error) {
      console.error('Error deleting funnel:', error);
    }
  }, [funnelHooks]);

  // Lead actions
  const setLeads = useCallback((leads: LeadAdvanced[]) => {
    dispatch({ type: 'SET_LEADS', payload: leads });
  }, []);

  const addLead = useCallback(async (leadData: Omit<LeadAdvanced, 'id'>, stageId?: string) => {
    try {
      // Map LeadAdvanced fields to database structure
      const payload: any = {
        nome: leadData.nome,
        empresa: leadData.empresa,
        email: leadData.email,
        telefone: leadData.telefone,
        fonte: leadData.fonte,
        status: leadData.status,
        etapa_funil: leadData.etapaFunil,
        valor: leadData.valor,
        probabilidade: leadData.probabilidade,
        data_contato: leadData.dataContato,
        observacoes: leadData.observacoes,
        trava_emocional: leadData.travaEmocional,
        tipo_discurso: leadData.tipoDiscurso,
        necessidade_oculta: leadData.necessidadeOculta,
        anuncio_origem: leadData.anuncioOrigem,
        produto_interesse: leadData.produtoInteresse,
        oferta_atrativa: leadData.ofertaAtrativa,
        gatilhos_funcionais: leadData.gatilhosFuncionais,
        pontuacao: leadData.pontuacao,
        vendedor_id: leadData.vendedorId,
        vendedor_nome: leadData.vendedorNome,
      };

      if (state.currentFunnel && stageId) {
        payload.funnel_id = state.currentFunnel.id;
        payload.funnel_stage_id = stageId;
      }

      await leadHooks.addLead(payload);
      
      // Refresh funnel leads if in a funnel context
      if (state.currentFunnel) {
        await funnelLeadHooks.refreshFunnelLeads();
      }
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  }, [leadHooks, funnelLeadHooks, state.currentFunnel]);

  const updateLead = useCallback(async (id: string, updates: Partial<LeadAdvanced>) => {
    try {
      const updateData: any = {};
      
      // Map LeadAdvanced fields to database fields
      if (updates.nome) updateData.nome = updates.nome;
      if (updates.empresa) updateData.empresa = updates.empresa;
      if (updates.email) updateData.email = updates.email;
      if (updates.telefone) updateData.telefone = updates.telefone;
      if (updates.fonte) updateData.fonte = updates.fonte;
      if (updates.valor !== undefined) updateData.valor = updates.valor;
      if (updates.probabilidade !== undefined) updateData.probabilidade = updates.probabilidade;
      if (updates.observacoes) updateData.observacoes = updates.observacoes;
      if (updates.travaEmocional) updateData.trava_emocional = updates.travaEmocional;
      if (updates.tipoDiscurso) updateData.tipo_discurso = updates.tipoDiscurso;
      if (updates.necessidadeOculta) updateData.necessidade_oculta = updates.necessidadeOculta;
      if (updates.anuncioOrigem) updateData.anuncio_origem = updates.anuncioOrigem;
      if (updates.produtoInteresse) updateData.produto_interesse = updates.produtoInteresse;
      if (updates.ofertaAtrativa) updateData.oferta_atrativa = updates.ofertaAtrativa;
      if (updates.gatilhosFuncionais) updateData.gatilhos_funcionais = updates.gatilhosFuncionais;
      if (updates.pontuacao !== undefined) updateData.pontuacao = updates.pontuacao;
      if (updates.vendedorId) updateData.vendedor_id = updates.vendedorId;
      if (updates.vendedorNome) updateData.vendedor_nome = updates.vendedorNome;

      await leadHooks.updateLead(id, updateData);
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  }, [leadHooks]);

  const deleteLead = useCallback(async (id: string) => {
    try {
      await leadHooks.deleteLead(id);
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  }, [leadHooks]);

  const moveLead = useCallback(async (leadId: string, newStageId: string) => {
    if (state.currentFunnel) {
      await funnelLeadHooks.moveLeadToStage(leadId, newStageId, state.currentFunnel.id);
      await funnelLeadHooks.refreshFunnelLeads();
    }
  }, [funnelLeadHooks, state.currentFunnel]);

  const setSelectedLead = useCallback((lead: LeadAdvanced | null) => {
    dispatch({ type: 'SET_SELECTED_LEAD', payload: lead });
  }, []);

  // Filter actions
  const setFilters = useCallback((filters: Partial<CRMFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Metrics actions
  const updateMetrics = useCallback((metrics: Partial<CRMMetrics>) => {
    dispatch({ type: 'UPDATE_METRICS', payload: metrics });
  }, []);

  // Loading
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const value: CRMContextType = {
    ...state,
    leads: leadHooks.leads.map(lead => ({
      id: lead.id,
      nome: lead.nome,
      empresa: lead.empresa,
      email: lead.email,
      telefone: lead.telefone,
      fonte: lead.fonte,
      status: (lead.status_advanced || 'frio') as 'frio' | 'morno' | 'quente',
      etapaFunil: lead.etapa_funil as 'descoberta' | 'consideracao' | 'decisao' | 'fechamento' | 'fidelizacao',
      valor: lead.valor,
      probabilidade: lead.probabilidade,
      dataContato: lead.data_contato,
      observacoes: lead.observacoes,
      travaEmocional: lead.trava_emocional as 'inseguranca_financeira' | 'medo_dar_errado' | 'falta_apoio' | 'falta_tempo' | 'desconfianca',
      tipoDiscurso: lead.tipo_discurso as 'tecnico' | 'emocional' | 'inspirador',
      necessidadeOculta: lead.necessidade_oculta || [],
      anuncioOrigem: lead.anuncio_origem,
      produtoInteresse: lead.produto_interesse,
      ofertaAtrativa: lead.oferta_atrativa,
      gatilhosFuncionais: lead.gatilhos_funcionais || [],
      pontuacao: lead.pontuacao,
      ultimaInteracao: lead.ultima_interacao || '',
      vendedorId: lead.vendedor_id,
      vendedorNome: lead.vendedor_nome,
    })),
    setCurrentFunnel,
    createFunnel,
    updateFunnel,
    deleteFunnel,
    setLeads,
    addLead,
    updateLead,
    deleteLead,
    moveLead,
    setSelectedLead,
    setFilters,
    updateMetrics,
    setLoading,
    funnelHooks,
    leadHooks,
    funnelLeadHooks,
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};