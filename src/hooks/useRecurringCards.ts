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
  template_config: any;
  enabled: boolean;
  created_at: string;
  updated_at: string;
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
      setCards(data || []);
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
      const { data, error } = await supabase
        .from('recurring_cards')
        .insert([cardData])
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
      const { error } = await supabase
        .from('recurring_cards')
        .update(updates)
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
