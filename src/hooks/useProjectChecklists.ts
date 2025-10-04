import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProjectChecklist {
  id: string;
  card_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export const useProjectChecklists = (cardId?: string) => {
  const [checklists, setChecklists] = useState<ProjectChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChecklists = async () => {
    if (!cardId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_checklists')
        .select('*')
        .eq('card_id', cardId)
        .order('position', { ascending: true });

      if (error) throw error;
      setChecklists((data || []) as ProjectChecklist[]);
    } catch (error) {
      console.error('Error fetching checklists:', error);
      toast({
        title: 'Erro ao carregar checklists',
        description: 'Não foi possível carregar as listas de verificação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createChecklist = async (data: Omit<ProjectChecklist, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newChecklist, error } = await supabase
        .from('project_checklists')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      setChecklists(prev => [...prev, newChecklist as ProjectChecklist]);
      return newChecklist as ProjectChecklist;
    } catch (error) {
      console.error('Error creating checklist:', error);
      toast({
        title: 'Erro ao criar checklist',
        description: 'Não foi possível criar a lista de verificação.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateChecklist = async (id: string, updates: Partial<ProjectChecklist>) => {
    try {
      const { error } = await supabase
        .from('project_checklists')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setChecklists(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      return true;
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast({
        title: 'Erro ao atualizar checklist',
        description: 'Não foi possível atualizar a lista de verificação.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteChecklist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setChecklists(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast({
        title: 'Erro ao excluir checklist',
        description: 'Não foi possível excluir a lista de verificação.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (cardId) {
      fetchChecklists();
    }
  }, [cardId]);

  return {
    checklists,
    isLoading,
    fetchChecklists,
    createChecklist,
    updateChecklist,
    deleteChecklist,
  };
};
