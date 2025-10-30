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
    console.time('⚡ Fetch board cards');
    try {
      const { data, error } = await supabase
        .from('project_cards')
        .select(`
          id, list_id, title, description, status, priority, 
          due_date, start_date, estimated_hours, actual_hours, 
          position, cover, location, archived, watching, 
          created_by, client_id, created_at, updated_at, custom_fields,
          checklists:custom_fields->checklists,
          comments:custom_fields->comments,
          attachments:custom_fields->attachments,
          project_lists!inner(board_id)
        ` as any)
        .eq('project_lists.board_id', boardId)
        .order('position', { ascending: true }) as any;

      if (error) {
        console.error('Error fetching board cards:', error);
        
        // Handle timeout specifically
        if (error.code === '57014') {
          toast({
            title: "Carregamento demorado",
            description: "A consulta demorou mais que o esperado.",
            variant: "default",
          });
        }
        
        return [];
      }

      console.timeEnd('⚡ Fetch board cards');
      
      // Reconstruct custom_fields with attachments count
      const cleanedData = (data || []).map(card => {
        const { checklists, comments, attachments, ...rest } = card as any;
        const attachmentsArray = attachments || rest.custom_fields?.attachments || [];
        const attachmentsCount = Array.isArray(attachmentsArray) ? attachmentsArray.length : 0;
        
        return {
          ...rest,
          attachments_count: attachmentsCount,
          custom_fields: {
            checklists: checklists || [],
            comments: comments || []
            // attachments completos serão carregados sob demanda ao abrir o modal
          }
        };
      });
      
      return cleanedData;
    } catch (error) {
      console.error('Error fetching board cards:', error);
      return [];
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
    createCard,
    updateCard,
    deleteCard,
  };
};