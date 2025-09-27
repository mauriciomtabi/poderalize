import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FollowUp } from '@/types/crm';
import { useAuth } from './useAuth';

interface CreateFollowUpData {
  leadId: string;
  leadNome: string;
  dataAgendada: string;
  tipo: 'ligacao' | 'whatsapp' | 'email' | 'reuniao';
  observacoes?: string;
  templateMensagem?: string;
  vendedorId?: string;
}

export const useFollowUps = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadFollowUps = useCallback(async (leadId?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('follow_ups')
        .select('*')
        .eq('user_id', user.id)
        .order('data_agendada', { ascending: true });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading follow-ups:', error);
        return;
      }

      const formattedFollowUps: FollowUp[] = (data || []).map(item => ({
        id: item.id,
        leadId: item.lead_id,
        leadNome: item.lead_nome,
        dataAgendada: item.data_agendada,
        tipo: item.tipo,
        status: item.status,
        observacoes: item.observacoes,
        templateMensagem: item.template_mensagem,
        vendedorId: item.vendedor_id || user.id
      }));

      setFollowUps(formattedFollowUps);
    } catch (error) {
      console.error('Error loading follow-ups:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addFollowUp = useCallback(async (followUpData: CreateFollowUpData) => {
    if (!user) return;

    try {
      const payload = {
        user_id: user.id,
        lead_id: followUpData.leadId,
        lead_nome: followUpData.leadNome,
        data_agendada: followUpData.dataAgendada,
        tipo: followUpData.tipo,
        status: 'pendente' as const,
        observacoes: followUpData.observacoes || '',
        template_mensagem: followUpData.templateMensagem || '',
        vendedor_id: followUpData.vendedorId || user.id
      };

      const { error } = await supabase
        .from('follow_ups')
        .insert([payload]);

      if (error) {
        console.error('Error adding follow-up:', error);
        return;
      }

      // Refresh follow-ups for this lead
      await loadFollowUps(followUpData.leadId);
    } catch (error) {
      console.error('Error adding follow-up:', error);
    }
  }, [user, loadFollowUps]);

  const updateFollowUp = useCallback(async (id: string, updates: Partial<FollowUp>) => {
    if (!user) return;

    try {
      const payload = {
        ...(updates.dataAgendada && { data_agendada: updates.dataAgendada }),
        ...(updates.tipo && { tipo: updates.tipo }),
        ...(updates.status && { status: updates.status }),
        ...(updates.observacoes !== undefined && { observacoes: updates.observacoes }),
        ...(updates.templateMensagem !== undefined && { template_mensagem: updates.templateMensagem })
      };

      const { error } = await supabase
        .from('follow_ups')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating follow-up:', error);
        return;
      }

      // Refresh follow-ups
      await loadFollowUps();
    } catch (error) {
      console.error('Error updating follow-up:', error);
    }
  }, [user, loadFollowUps]);

  const deleteFollowUp = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting follow-up:', error);
        return;
      }

      // Refresh follow-ups
      await loadFollowUps();
    } catch (error) {
      console.error('Error deleting follow-up:', error);
    }
  }, [user, loadFollowUps]);

  const refreshFollowUps = useCallback(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  useEffect(() => {
    if (user) {
      loadFollowUps();
    }
  }, [user, loadFollowUps]);

  return {
    followUps,
    isLoading,
    addFollowUp,
    updateFollowUp,
    deleteFollowUp,
    loadFollowUps,
    refreshFollowUps
  };
};