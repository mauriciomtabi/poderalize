import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/crm';
import { useAuth } from '@/hooks/useAuth';

interface FunnelLeadsData {
  [stageId: string]: Lead[];
}

export const useFunnelLeads = (funnelId?: string) => {
  const [funnelLeads, setFunnelLeads] = useState<FunnelLeadsData>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load leads for a specific funnel
  const loadFunnelLeads = useCallback(async (targetFunnelId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          *,
          funnel_stages!inner(id, title, position, color)
        `)
        .eq('user_id', user.id)
        .eq('funnel_id', targetFunnelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading funnel leads:', error);
        toast({
          title: 'Erro ao carregar leads do funil',
          variant: 'destructive'
        });
        return;
      }

      // Group leads by stage
      const leadsByStage: FunnelLeadsData = {};
      leads?.forEach((lead: any) => {
        const stageId = lead.funnel_stage_id;
        if (stageId) {
          if (!leadsByStage[stageId]) {
            leadsByStage[stageId] = [];
          }
          // Map database lead to Lead interface
          const mappedLead: Lead = {
            ...lead,
            status: lead.status_simple || 'novo',
            dataContato: lead.data_contato || new Date().toISOString()
          };
          leadsByStage[stageId].push(mappedLead);
        }
      });

      setFunnelLeads(leadsByStage);
    } catch (error) {
      console.error('Error loading funnel leads:', error);
      toast({
        title: 'Erro ao carregar leads do funil',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Move lead between stages
  const moveLeadToStage = useCallback(async (
    leadId: string, 
    newStageId: string, 
    newFunnelId: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          funnel_stage_id: newStageId,
          funnel_id: newFunnelId,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error moving lead:', error);
        toast({
          title: 'Erro ao mover lead',
          variant: 'destructive'
        });
        return false;
      }

      // Reload leads after moving
      if (funnelId) {
        await loadFunnelLeads(funnelId);
      }
      
      return true;
    } catch (error) {
      console.error('Error moving lead:', error);
      toast({
        title: 'Erro ao mover lead',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, funnelId, loadFunnelLeads, toast]);

  // Add existing lead to funnel stage
  const addLeadToFunnel = useCallback(async (
    leadId: string,
    targetFunnelId: string,
    stageId: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          funnel_id: targetFunnelId,
          funnel_stage_id: stageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error adding lead to funnel:', error);
        toast({
          title: 'Erro ao adicionar lead ao funil',
          variant: 'destructive'
        });
        return false;
      }

      // Reload leads
      await loadFunnelLeads(targetFunnelId);
      return true;
    } catch (error) {
      console.error('Error adding lead to funnel:', error);
      toast({
        title: 'Erro ao adicionar lead ao funil',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, loadFunnelLeads, toast]);

  // Remove lead from funnel (set funnel fields to null)
  const removeLeadFromFunnel = useCallback(async (leadId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          funnel_id: null,
          funnel_stage_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing lead from funnel:', error);
        toast({
          title: 'Erro ao remover lead do funil',
          variant: 'destructive'
        });
        return false;
      }

      // Reload leads if we have a current funnel
      if (funnelId) {
        await loadFunnelLeads(funnelId);
      }
      
      return true;
    } catch (error) {
      console.error('Error removing lead from funnel:', error);
      toast({
        title: 'Erro ao remover lead do funil',
        variant: 'destructive'
      });
      return false;
    }
  }, [user, funnelId, loadFunnelLeads, toast]);

  // Get leads not in any funnel
  const getUnassignedLeads = useCallback(async (): Promise<Lead[]> => {
    if (!user) return [];

    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .is('funnel_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading unassigned leads:', error);
        return [];
      }

      return (leads || []).map((lead: any) => ({
        ...lead,
        status: lead.status_simple || 'novo',
        dataContato: lead.data_contato || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error loading unassigned leads:', error);
      return [];
    }
  }, [user]);

  // Load funnel leads when funnelId changes
  useEffect(() => {
    if (funnelId && user) {
      loadFunnelLeads(funnelId);
    }
  }, [funnelId, user, loadFunnelLeads]);

  return {
    funnelLeads,
    isLoading,
    moveLeadToStage,
    addLeadToFunnel,
    removeLeadFromFunnel,
    getUnassignedLeads,
    refreshFunnelLeads: () => funnelId ? loadFunnelLeads(funnelId) : Promise.resolve(),
  };
};