import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RecurringCard {
  id: string;
  board_id: string;
  list_id: string;
  title: string;
  description?: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number | null;
  day_of_month?: number | null;
  time_of_day?: string | null;
  last_created_at?: string | null;
  next_creation_at: string;
  end_date?: string | null;
  template_config: any;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  days_of_week?: number[]; // For displaying daily frequency
}

export const useRecurringCards = (boardId: string | null) => {
  const [cards, setCards] = useState<RecurringCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCards = async () => {
    if (!boardId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_cards')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse days_of_week from template_config if it exists
      const parsedData = (data || []).map(card => {
        const config = typeof card.template_config === 'object' && card.template_config !== null 
          ? card.template_config as Record<string, any>
          : {};
        
        return {
          ...card,
          days_of_week: Array.isArray(config.days_of_week) ? config.days_of_week : []
        };
      });
      
      setCards(parsedData);
    } catch (error: any) {
      console.error('Error fetching recurring cards:', error);
      toast({
        title: "Erro ao carregar cards recorrentes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCard = async (cardData: any) => {
    try {
      // Store days_of_week in template_config for daily frequency
      const dataToInsert = {
        ...cardData,
        template_config: {
          ...cardData.template_config,
          days_of_week: cardData.days_of_week || []
        }
      };
      
      // Remove days_of_week from root level
      delete dataToInsert.days_of_week;
      
      const { data, error } = await supabase
        .from('recurring_cards')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Card recorrente criado",
        description: "O card será criado automaticamente conforme configurado.",
      });

      await fetchCards();
      return data;
    } catch (error: any) {
      console.error('Error creating recurring card:', error);
      toast({
        title: "Erro ao criar card recorrente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCard = async (id: string, updates: Partial<RecurringCard>) => {
    try {
      // Ensure days_of_week is stored inside template_config (column doesn't exist at root)
      const updatesToSend: any = { ...updates };
      if (Object.prototype.hasOwnProperty.call(updatesToSend, 'days_of_week')) {
        updatesToSend.template_config = {
          ...(updatesToSend.template_config || {}),
          days_of_week: updatesToSend.days_of_week || [],
        };
        delete updatesToSend.days_of_week;
      }

      const { error } = await supabase
        .from('recurring_cards')
        .update(updatesToSend)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Card recorrente atualizado",
      });

      await fetchCards();
    } catch (error: any) {
      console.error('Error updating recurring card:', error);
      toast({
        title: "Erro ao atualizar card recorrente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Card recorrente excluído",
      });

      await fetchCards();
    } catch (error: any) {
      console.error('Error deleting recurring card:', error);
      toast({
        title: "Erro ao excluir card recorrente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleEnabled = async (id: string, enabled: boolean) => {
    await updateCard(id, { enabled });
  };

  useEffect(() => {
    fetchCards();
  }, [boardId]);

  return {
    cards,
    isLoading,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    toggleEnabled,
  };
};
