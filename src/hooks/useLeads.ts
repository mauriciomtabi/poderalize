import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import { CreateClienteData } from './useClientes';

// Lead validation schema
const leadSchema = z.object({
  // Dados básicos
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  empresa: z.string().trim().min(1, "Empresa é obrigatória").max(100, "Empresa deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
  telefone: z.string().trim().optional(),
  fonte: z.string().trim().min(1, "Fonte é obrigatória").max(50, "Fonte deve ter no máximo 50 caracteres"),
  status_simple: z.enum(['novo', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido']).optional(),
  status_advanced: z.enum(['frio', 'morno', 'quente']).optional(),
  etapa_funil: z.enum(['descoberta', 'consideracao', 'decisao', 'fechamento', 'fidelizacao']).optional(),
  valor: z.number().min(0, "Valor deve ser positivo").optional(),
  probabilidade: z.number().min(0, "Probabilidade deve ser entre 0 e 100").max(100, "Probabilidade deve ser entre 0 e 100").optional(),
  data_contato: z.string().optional(),
  observacoes: z.string().trim().max(1000, "Observações devem ter no máximo 1000 caracteres").optional(),
  
  // Presença Digital
  site: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  outras_redes_sociais: z.string().trim().optional(),
  
  // Faturamento
  faturamento_atual: z.number().min(0).optional(),
  faturamento_desejado: z.number().min(0).optional(),
  
  // Comportamento e Potencial
  dores_identificadas: z.array(z.string()).optional(),
  nivel_consciencia: z.string().optional(),
  etapa_jornada: z.string().optional(),
  indicador_potencial: z.string().optional(),
  equipe_atual: z.string().optional(),
  
  // Mindset Comercial Poderalize
  trava_emocional: z.enum(['inseguranca_financeira', 'medo_dar_errado', 'falta_apoio', 'falta_tempo', 'desconfianca']).optional(),
  tipo_discurso: z.enum(['tecnico', 'emocional', 'inspirador']).optional(),
  necessidade_oculta: z.array(z.string()).optional(),
  
  // Atração e Conversão
  anuncio_origem: z.string().trim().optional(),
  produto_interesse: z.string().trim().min(1, "Produto de interesse é obrigatório"),
  oferta_atrativa: z.string().trim().optional(),
  gatilhos_funcionais: z.array(z.string()).optional(),
  
  // Lead Scoring
  pontuacao: z.number().min(0).optional(),
  ultima_interacao: z.string().optional(),
  
  // Vendedor responsável
  vendedor_id: z.string().optional(),
  vendedor_nome: z.string().trim().optional(),
  
  // Temperatura da negociação
  temperatura_negociacao: z.enum(['muito_fraca', 'fraca', 'mediana', 'forte', 'muito_forte']).optional(),

  // Funnel relationship (novos campos)
  funnel_id: z.string().uuid().optional(),
  funnel_stage_id: z.string().uuid().optional(),
});

export interface Lead {
  id: string;
  user_id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone?: string;
  fonte: string;
  status_simple?: 'novo' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';
  status_advanced?: 'frio' | 'morno' | 'quente';
  etapa_funil?: 'descoberta' | 'consideracao' | 'decisao' | 'fechamento' | 'fidelizacao';
  valor?: number;
  probabilidade?: number;
  data_contato: string;
  observacoes?: string;
  
  // Presença Digital
  site?: string;
  instagram?: string;
  facebook?: string;
  outras_redes_sociais?: string;
  
  // Faturamento
  faturamento_atual?: number;
  faturamento_desejado?: number;
  
  // Comportamento e Potencial
  dores_identificadas?: string[];
  nivel_consciencia?: string;
  etapa_jornada?: string;
  indicador_potencial?: string;
  equipe_atual?: string;
  
  // Mindset Comercial Poderalize
  trava_emocional?: 'inseguranca_financeira' | 'medo_dar_errado' | 'falta_apoio' | 'falta_tempo' | 'desconfianca';
  tipo_discurso?: 'tecnico' | 'emocional' | 'inspirador';
  necessidade_oculta?: string[];
  
  // Atração e Conversão
  anuncio_origem?: string;
  produto_interesse: string;
  oferta_atrativa?: string;
  gatilhos_funcionais?: string[];
  
  // Lead Scoring
  pontuacao?: number;
  ultima_interacao?: string;
  
  // Vendedor responsável
  vendedor_id?: string;
  vendedor_nome?: string;
  
  // Temperatura da negociação
  temperatura_negociacao?: 'muito_fraca' | 'fraca' | 'mediana' | 'forte' | 'muito_forte';
  
  // Motivo da perda
  motivo_perda?: string;
  
  created_at: string;
  updated_at: string;
}

export type CreateLeadData = Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateLeadData = Partial<CreateLeadData>;

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load leads from Supabase
  const loadLeads = useCallback(async () => {
    if (!user) {
      setLeads([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar leads:', error);
        toast.error('Erro ao carregar leads');
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add new lead
  const addLead = useCallback(async (leadData: CreateLeadData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      // Validate input data
      const validatedData = leadSchema.parse({
        ...leadData,
        telefone: leadData.telefone || undefined,
        observacoes: leadData.observacoes || undefined,
      });

      // Normalize data
      const normalizedData = {
        ...validatedData,
        user_id: user.id,
        valor: leadData.valor || 0,
        probabilidade: leadData.probabilidade || 0,
        data_contato: leadData.data_contato || new Date().toISOString().split('T')[0],
        produto_interesse: leadData.produto_interesse || 'Não especificado',
        status_simple: leadData.status_simple || 'novo' as const,
        status_advanced: leadData.status_advanced || 'frio' as const,
        etapa_funil: leadData.etapa_funil || 'descoberta' as const,
      };

      const { data, error } = await supabase
        .from('leads')
        .insert([normalizedData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar lead:', error);
        toast.error(`Erro ao adicionar lead: ${error.message}`);
        return null;
      }

      setLeads(prev => [data, ...prev]);
      toast.success('Lead adicionado com sucesso!');
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`Dados inválidos: ${firstError.message}`);
      } else {
        console.error('Erro ao adicionar lead:', error);
        toast.error('Erro ao adicionar lead');
      }
      return null;
    }
  }, [user]);

  // Convert lead to cliente
  const convertLeadToCliente = useCallback(async (lead: Lead) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const clienteData: CreateClienteData = {
        lead_id: lead.id,
        nome: lead.nome,
        empresa: lead.empresa,
        email: lead.email,
        telefone: lead.telefone,
        valor_fechamento: lead.valor || 0,
        data_fechamento: new Date().toISOString().split('T')[0],
        observacoes: lead.observacoes,
        site: lead.site,
        instagram: lead.instagram,
        facebook: lead.facebook,
        outras_redes_sociais: lead.outras_redes_sociais,
        faturamento_atual: lead.faturamento_atual,
        faturamento_desejado: lead.faturamento_desejado,
        fonte_original: lead.fonte,
        vendedor_id: lead.vendedor_id,
        vendedor_nome: lead.vendedor_nome,
      };

      const { data, error } = await supabase
        .from('clientes')
        .insert([{ ...clienteData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao converter lead para cliente:', error);
        toast.error(`Erro ao converter lead para cliente: ${error.message}`);
        return null;
      }

      toast.success(`🎉 Lead ${lead.nome} convertido para cliente com sucesso!`);
      return data;
    } catch (error) {
      console.error('Erro ao converter lead para cliente:', error);
      toast.error('Erro ao converter lead para cliente');
      return null;
    }
  }, [user]);

  // Update lead
  const updateLead = useCallback(async (id: string, leadData: UpdateLeadData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      console.log('Dados recebidos para atualização:', leadData);
      
      // Filter out undefined and null, but keep empty arrays and empty strings as valid values
      const providedData = Object.fromEntries(
        Object.entries(leadData).filter(([, value]) => value !== undefined && value !== null)
      );

      console.log('Dados filtrados para atualização:', providedData);

      if (Object.keys(providedData).length === 0) {
        toast.error('Nenhum dado fornecido para atualização');
        return null;
      }

      // Validate the provided data
      const validatedData = leadSchema.partial().parse(providedData);
      console.log('Dados validados:', validatedData);

      const { data, error } = await supabase
        .from('leads')
        .update(validatedData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar lead:', error);
        toast.error(`Erro ao atualizar lead: ${error.message}`);
        return null;
      }

      // Check if lead was marked as "fechado" and convert to cliente
      if (data.status_simple === 'fechado') {
        await convertLeadToCliente(data);
      }

      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      toast.success('Lead atualizado com sucesso!');
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`Dados inválidos: ${firstError.message}`);
      } else {
        console.error('Erro ao atualizar lead:', error);
        toast.error('Erro ao atualizar lead');
      }
      return null;
    }
  }, [user, convertLeadToCliente]);

  // Delete lead
  const deleteLead = useCallback(async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar lead:', error);
        toast.error(`Erro ao deletar lead: ${error.message}`);
        return false;
      }

      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      toast.error('Erro ao deletar lead');
      return false;
    }
  }, [user]);

  // Migrate localStorage data to Supabase (run once)
  const migrateLocalStorageData = useCallback(async () => {
    if (!user) return;

    try {
      const localLeads = localStorage.getItem('leads');
      if (!localLeads) return;

      const parsedLeads = JSON.parse(localLeads);
      if (!Array.isArray(parsedLeads) || parsedLeads.length === 0) return;

      console.log('Migrando leads do localStorage para Supabase...');
      
      for (const lead of parsedLeads) {
        // Convert old format to new format
        const migratedLead: CreateLeadData = {
          nome: lead.nome || '',
          empresa: lead.empresa || '',
          email: lead.email || '',
          telefone: lead.telefone,
          fonte: lead.fonte || 'Migração',
          status_simple: lead.status === 'novo' || lead.status === 'qualificado' || lead.status === 'proposta' || lead.status === 'negociacao' || lead.status === 'fechado' || lead.status === 'perdido' ? lead.status : 'novo',
          valor: typeof lead.valor === 'number' ? lead.valor : 0,
          probabilidade: typeof lead.probabilidade === 'number' ? lead.probabilidade : 0,
          data_contato: lead.dataContato || new Date().toISOString().split('T')[0],
          observacoes: lead.observacoes,
          site: lead.site,
          instagram: lead.instagram,
          facebook: lead.facebook,
          outras_redes_sociais: lead.outrasRedesSociais,
          faturamento_atual: lead.faturamentoAtual,
          faturamento_desejado: lead.faturamentoDesejado,
          dores_identificadas: lead.doresIdentificadas,
          nivel_consciencia: lead.nivelConsciencia,
          etapa_jornada: lead.etapaJornada,
          indicador_potencial: lead.indicadorPotencial,
          equipe_atual: lead.equipeAtual,
          produto_interesse: 'Migrado do localStorage',
        };

        await addLead(migratedLead);
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('leads');
      toast.success('Leads migrados do localStorage com sucesso!');
    } catch (error) {
      console.error('Erro na migração de leads:', error);
      toast.error('Erro na migração de leads do localStorage');
    }
  }, [user, addLead]);

  // Load leads on mount and user change
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Run migration once when user is available
  useEffect(() => {
    if (user && leads.length === 0 && !isLoading) {
      migrateLocalStorageData();
    }
  }, [user, leads.length, isLoading, migrateLocalStorageData]);

  // Mark lead as closed (converts to client)
  const markLeadAsClosed = useCallback(async (leadId: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const leadToClose = leads.find(lead => lead.id === leadId);
      if (!leadToClose) {
        toast.error('Lead não encontrado');
        return false;
      }

      const { data, error } = await supabase
        .from('leads')
        .update({ status_simple: 'fechado' })
        .eq('id', leadId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao marcar lead como fechado:', error);
        toast.error(`Erro ao marcar lead como fechado: ${error.message}`);
        return false;
      }

      // Convert to client
      await convertLeadToCliente(data);
      
      setLeads(prev => prev.map(lead => lead.id === leadId ? data : lead));
      return true;
    } catch (error) {
      console.error('Erro ao marcar lead como fechado:', error);
      toast.error('Erro ao marcar lead como fechado');
      return false;
    }
  }, [user, leads, convertLeadToCliente]);

  // Mark lead as lost with reason
  const markLeadAsLost = useCallback(async (leadId: string, motivo: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    if (!motivo || motivo.trim() === '') {
      toast.error('Motivo da perda é obrigatório');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status_simple: 'perdido',
          motivo_perda: motivo.trim()
        })
        .eq('id', leadId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao marcar lead como perdido:', error);
        toast.error(`Erro ao marcar lead como perdido: ${error.message}`);
        return false;
      }

      setLeads(prev => prev.map(lead => lead.id === leadId ? data : lead));
      toast.success('Lead marcado como perdido');
      return true;
    } catch (error) {
      console.error('Erro ao marcar lead como perdido:', error);
      toast.error('Erro ao marcar lead como perdido');
      return false;
    }
  }, [user]);

  // Get lost leads
  const getLeadsPerdidos = useCallback(() => {
    return leads.filter(lead => lead.status_simple === 'perdido');
  }, [leads]);

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    refreshLeads: loadLeads,
    convertLeadToCliente,
    markLeadAsClosed,
    markLeadAsLost,
    getLeadsPerdidos,
  };
}