import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProjectChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  completed: boolean;
  position: number;
  assignee?: string; // project_members.id
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export const useProjectChecklistItems = (checklistId?: string) => {
  const [items, setItems] = useState<ProjectChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = async () => {
    if (!checklistId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_checklist_items')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('position', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching checklist items:', error);
      toast({
        title: 'Erro ao carregar itens',
        description: 'Não foi possível carregar os itens da lista.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createItem = async (data: Omit<ProjectChecklistItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newItem, error } = await supabase
        .from('project_checklist_items')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: 'Erro ao criar item',
        description: 'Não foi possível criar o item.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<ProjectChecklistItem>) => {
    try {
      const { error } = await supabase
        .from('project_checklist_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Erro ao atualizar item',
        description: 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_checklist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro ao excluir item',
        description: 'Não foi possível excluir o item.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (checklistId) {
      fetchItems();
    }
  }, [checklistId]);

  return {
    items,
    isLoading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
};
