import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProjectLabel {
  id: string;
  board_id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useProjectLabels = (boardId?: string) => {
  const [labels, setLabels] = useState<ProjectLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLabels = async () => {
    if (!boardId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_labels')
        .select('*')
        .eq('board_id', boardId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching labels:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar etiquetas do projeto",
          variant: "destructive",
        });
        return;
      }

      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createLabel = async (labelData: Omit<ProjectLabel, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('project_labels')
        .insert(labelData)
        .select()
        .single();

      if (error) {
        console.error('Error creating label:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar etiqueta",
          variant: "destructive",
        });
        return null;
      }

      await fetchLabels();
      return data;
    } catch (error) {
      console.error('Error creating label:', error);
      return null;
    }
  };

  const updateLabel = async (id: string, updates: Partial<ProjectLabel>) => {
    try {
      const { error } = await supabase
        .from('project_labels')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating label:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar etiqueta",
          variant: "destructive",
        });
        return false;
      }

      await fetchLabels();
      return true;
    } catch (error) {
      console.error('Error updating label:', error);
      return false;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_labels')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting label:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar etiqueta",
          variant: "destructive",
        });
        return false;
      }

      await fetchLabels();
      return true;
    } catch (error) {
      console.error('Error deleting label:', error);
      return false;
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchLabels();
    }
  }, [boardId]);

  return {
    labels,
    isLoading,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
  };
};