import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

// Lead validation schema
const leadSchema = z.object({
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
  observacoes: z.string().trim().max(1000, "Observações devem ter no máximo 1000 caracteres").optional(),
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

  // Update lead
  const updateLead = useCallback(async (id: string, leadData: UpdateLeadData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      // Validate only provided fields
      const providedData = Object.fromEntries(
        Object.entries(leadData).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );

      if (Object.keys(providedData).length === 0) {
        toast.error('Nenhum dado fornecido para atualização');
        return null;
      }

      // Validate the provided data
      const validatedData = leadSchema.partial().parse(providedData);

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
  }, [user]);

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

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    refreshLeads: loadLeads,
  };
}