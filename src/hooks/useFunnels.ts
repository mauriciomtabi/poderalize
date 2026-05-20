import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FunnelStage {
  id: string;
  funnel_id: string;
  title: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Funnel {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  stages: FunnelStage[];
  created_at: string;
  updated_at: string;
}

export type CreateFunnelData = {
  name: string;
  description?: string;
  stages: { title: string; color: string; position: number }[];
};

export function useFunnels() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load funnels from Supabase
  const loadFunnels = useCallback(async () => {
    if (!user) {
      setFunnels([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load funnels with their stages
      // Removed .eq('user_id', user.id) so all users with CRM access can see all funnels
      const { data: funnelsData, error: funnelsError } = await supabase
        .from('funnels')
        .select(`
          *,
          funnel_stages (*)
        `)
        .order('created_at', { ascending: false });

      if (funnelsError) {
        console.error('Erro ao carregar funis:', funnelsError);
        toast.error('Erro ao carregar funis');
        return;
      }

      // Transform data to match our interface
      const transformedFunnels = funnelsData?.map(funnel => ({
        ...funnel,
        stages: (funnel.funnel_stages || []).sort((a: any, b: any) => a.position - b.position)
      })) || [];

      setFunnels(transformedFunnels);
    } catch (error) {
      console.error('Erro ao carregar funis:', error);
      toast.error('Erro ao carregar funis');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create new funnel with stages
  const createFunnel = useCallback(async (funnelData: CreateFunnelData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      // Create funnel
      const { data: funnelResult, error: funnelError } = await supabase
        .from('funnels')
        .insert([{
          user_id: user.id,
          name: funnelData.name.trim(),
          description: funnelData.description?.trim() || null,
          is_active: true,
        }])
        .select()
        .single();

      if (funnelError) {
        console.error('Erro ao criar funil:', funnelError);
        toast.error(`Erro ao criar funil: ${funnelError.message}`);
        return null;
      }

      // Create stages
      const stagesData = funnelData.stages.map(stage => ({
        funnel_id: funnelResult.id,
        title: stage.title.trim(),
        color: stage.color,
        position: stage.position,
      }));

      const { data: stagesResult, error: stagesError } = await supabase
        .from('funnel_stages')
        .insert(stagesData)
        .select();

      if (stagesError) {
        console.error('Erro ao criar etapas do funil:', stagesError);
        toast.error(`Erro ao criar etapas do funil: ${stagesError.message}`);
        
        // Clean up the funnel if stages creation failed
        await supabase.from('funnels').delete().eq('id', funnelResult.id);
        return null;
      }

      const newFunnel: Funnel = {
        ...funnelResult,
        stages: stagesResult.sort((a, b) => a.position - b.position),
      };

      setFunnels(prev => [newFunnel, ...prev]);
      toast.success('Funil criado com sucesso!');
      return newFunnel;
    } catch (error) {
      console.error('Erro ao criar funil:', error);
      toast.error('Erro ao criar funil');
      return null;
    }
  }, [user]);

  // Update funnel
  const updateFunnel = useCallback(async (id: string, updates: Partial<Pick<Funnel, 'name' | 'description' | 'is_active'>>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('funnels')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar funil:', error);
        toast.error(`Erro ao atualizar funil: ${error.message}`);
        return null;
      }

      setFunnels(prev => prev.map(funnel => 
        funnel.id === id ? { ...funnel, ...data } : funnel
      ));
      toast.success('Funil atualizado com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar funil:', error);
      toast.error('Erro ao atualizar funil');
      return null;
    }
  }, [user]);

  // Delete funnel
  const deleteFunnel = useCallback(async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar funil:', error);
        toast.error(`Erro ao deletar funil: ${error.message}`);
        return false;
      }

      setFunnels(prev => prev.filter(funnel => funnel.id !== id));
      toast.success('Funil deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar funil:', error);
      toast.error('Erro ao deletar funil');
      return false;
    }
  }, [user]);

  // Load funnels on mount and user change
  useEffect(() => {
    loadFunnels();
  }, [loadFunnels]);

  return {
    funnels,
    isLoading,
    createFunnel,
    updateFunnel,
    deleteFunnel,
    refreshFunnels: loadFunnels,
  };
}