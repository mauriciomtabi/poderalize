import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProjectBoard {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: string;
  settings: any;
  background?: any;
  created_at: string;
  updated_at: string;
}

export const useProjectBoards = () => {
  const [boards, setBoards] = useState<ProjectBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchBoards = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('project_boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching boards:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar os quadros de projeto",
          variant: "destructive",
        });
        return;
      }

      setBoards(data || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBoard = async (boardData: Omit<ProjectBoard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('project_boards')
        .insert({
          ...boardData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating board:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar quadro de projeto",
          variant: "destructive",
        });
        return null;
      }

      await fetchBoards();
      return data;
    } catch (error) {
      console.error('Error creating board:', error);
      return null;
    }
  };

  const updateBoard = async (id: string, updates: Partial<ProjectBoard>) => {
    try {
      const { error } = await supabase
        .from('project_boards')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating board:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar quadro de projeto",
          variant: "destructive",
        });
        return false;
      }

      await fetchBoards();
      return true;
    } catch (error) {
      console.error('Error updating board:', error);
      return false;
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_boards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting board:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar quadro de projeto",
          variant: "destructive",
        });
        return false;
      }

      await fetchBoards();
      return true;
    } catch (error) {
      console.error('Error deleting board:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBoards();
    }
  }, [user]);

  return {
    boards,
    isLoading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
  };
};