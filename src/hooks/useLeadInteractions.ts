import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadInteraction, CreateInteractionData, InteractionType } from '@/types/crm';
import { useAuth } from './useAuth';

export const useLeadInteractions = () => {
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadInteractions = useCallback(async (leadId?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('lead_interactions')
        .select('*')
        .order('interaction_date', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading interactions:', error);
        return;
      }

      // Get unique user IDs to fetch user names
      const userIds = [...new Set((data || []).map(item => item.created_by_user).filter(Boolean))];
      
      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const userNamesMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile.full_name || 'Usuário desconhecido';
        return acc;
      }, {} as Record<string, string>);

      const formattedInteractions: LeadInteraction[] = (data || []).map(item => ({
        id: item.id,
        leadId: item.lead_id,
        userId: item.user_id,
        interactionType: item.interaction_type as InteractionType,
        description: item.description,
        interactionDate: item.interaction_date,
        createdByUser: item.created_by_user,
        createdByUserName: item.created_by_user ? userNamesMap[item.created_by_user] : 'Usuário desconhecido',
        metadata: (item.metadata as Record<string, any>) || {},
        createdAt: item.created_at
      }));

      setInteractions(formattedInteractions);
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addInteraction = useCallback(async (interactionData: CreateInteractionData) => {
    if (!user) return;

    try {
      const payload = {
        user_id: user.id,
        lead_id: interactionData.leadId,
        interaction_type: interactionData.interactionType,
        description: interactionData.description,
        interaction_date: interactionData.interactionDate || new Date().toISOString(),
        created_by_user: user.id,
        metadata: interactionData.metadata || {}
      };

      const { error } = await supabase
        .from('lead_interactions')
        .insert([payload]);

      if (error) {
        console.error('Error adding interaction:', error);
        return;
      }

      // Refresh interactions for this lead
      await loadInteractions(interactionData.leadId);
    } catch (error) {
      console.error('Error adding interaction:', error);
    }
  }, [user, loadInteractions]);

  const updateInteraction = useCallback(async (id: string, updates: Partial<CreateInteractionData>) => {
    if (!user) return;

    try {
      const payload = {
        ...(updates.interactionType && { interaction_type: updates.interactionType }),
        ...(updates.description && { description: updates.description }),
        ...(updates.interactionDate && { interaction_date: updates.interactionDate }),
        ...(updates.metadata && { metadata: updates.metadata })
      };

      const { error } = await supabase
        .from('lead_interactions')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('Error updating interaction:', error);
        return;
      }

      // Refresh interactions
      await loadInteractions();
    } catch (error) {
      console.error('Error updating interaction:', error);
    }
  }, [user, loadInteractions]);

  const deleteInteraction = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lead_interactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting interaction:', error);
        return;
      }

      // Refresh interactions
      await loadInteractions();
    } catch (error) {
      console.error('Error deleting interaction:', error);
    }
  }, [user, loadInteractions]);

  const refreshInteractions = useCallback(() => {
    loadInteractions();
  }, [loadInteractions]);

  useEffect(() => {
    if (user) {
      loadInteractions();
    }
  }, [user, loadInteractions]);

  return {
    interactions,
    isLoading,
    addInteraction,
    updateInteraction,
    deleteInteraction,
    loadInteractions,
    refreshInteractions
  };
};