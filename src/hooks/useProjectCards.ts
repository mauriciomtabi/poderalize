import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProjectCard {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position: number;
  cover?: string;
  location?: any;
  custom_fields?: any;
  archived: boolean;
  watching: boolean;
  created_by: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProjectCards = (listId?: string) => {
  const [cards, setCards] = useState<ProjectCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCards = async () => {
    if (!listId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_cards')
        .select('*')
        .eq('list_id', listId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching cards:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar cartões do projeto",
          variant: "destructive",
        });
        return;
      }

      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllBoardCards = async (boardId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_cards')
        .select(`*`)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching board cards:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching board cards:', error);
      return [];
    }
  };

  // Buscar cartões por múltiplas listas (evita JOIN pesado) - SEM attachments
  const fetchCardsByListIds = async (listIds: string[]) => {
    if (!listIds || listIds.length === 0) return [];
    try {
      // Select only lightweight columns, excluding attachments
      const { data, error } = await supabase
        .from('project_cards')
        .select(`
          id, list_id, title, description, status, priority, labels, members,
          due_date, estimated_hours, actual_hours, position, archived,
          created_at, updated_at, created_by,
          custom_fields->checklists,
          custom_fields->comments
        `)
        .in('list_id', listIds)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching cards by list ids:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching cards by list ids:', error);
      return [];
    }
  };

  // Buscar um cartão completo (com attachments) - para o modal
  const fetchCardWithAttachments = async (cardId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) {
        console.error('Error fetching card with attachments:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching card with attachments:', error);
      return null;
    }
  };

  const createCard = async (cardData: Omit<ProjectCard, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('project_cards')
        .insert({
          ...cardData,
          created_by: user.id,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating card:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar cartão",
          variant: "destructive",
        });
        return null;
      }

      await fetchCards();
      return data;
    } catch (error) {
      console.error('Error creating card:', error);
      return null;
    }
  };

  const updateCard = async (id: string, updates: Partial<ProjectCard>) => {
    try {
      const { error } = await supabase
        .from('project_cards')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating card:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar cartão",
          variant: "destructive",
        });
        return false;
      }

      await fetchCards();
      return true;
    } catch (error) {
      console.error('Error updating card:', error);
      return false;
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_cards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting card:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar cartão",
          variant: "destructive",
        });
        return false;
      }

      await fetchCards();
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  };

  useEffect(() => {
    if (listId) {
      fetchCards();
    }
  }, [listId]);

  return {
    cards,
    isLoading,
    fetchCards,
    fetchAllBoardCards,
    fetchCardsByListIds,
    fetchCardWithAttachments,
    createCard,
    updateCard,
    deleteCard,
  };
};