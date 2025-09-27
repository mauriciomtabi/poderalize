import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProjectList {
  id: string;
  board_id: string;
  title: string;
  color: string;
  position: number;
  archived: boolean;
  subscribed: boolean;
  rules?: any;
  created_at: string;
  updated_at: string;
}

export const useProjectLists = (boardId?: string) => {
  const [lists, setLists] = useState<ProjectList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLists = async () => {
    if (!boardId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching lists:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar listas do projeto",
          variant: "destructive",
        });
        return;
      }

      setLists(data || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createList = async (listData: Omit<ProjectList, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_lists')
        .insert(listData)
        .select()
        .single();

      if (error) {
        console.error('Error creating list:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar lista",
          variant: "destructive",
        });
        return null;
      }

      await fetchLists();
      return data;
    } catch (error) {
      console.error('Error creating list:', error);
      return null;
    }
  };

  const updateList = async (id: string, updates: Partial<ProjectList>) => {
    try {
      const { error } = await supabase
        .from('project_lists')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating list:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar lista",
          variant: "destructive",
        });
        return false;
      }

      await fetchLists();
      return true;
    } catch (error) {
      console.error('Error updating list:', error);
      return false;
    }
  };

  const deleteList = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_lists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting list:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar lista",
          variant: "destructive",
        });
        return false;
      }

      await fetchLists();
      return true;
    } catch (error) {
      console.error('Error deleting list:', error);
      return false;
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchLists();
    }
  }, [boardId]);

  return {
    lists,
    isLoading,
    fetchLists,
    createList,
    updateList,
    deleteList,
  };
};