import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const receitaSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().positive("Valor deve ser maior que zero"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  data: z.string(),
  observacoes: z.string().optional(),
});

export interface Receita {
  id: string;
  user_id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export type CreateReceitaData = Omit<Receita, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateReceitaData = Partial<CreateReceitaData>;

export const useReceitas = () => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  const loadReceitas = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("receitas")
        .select("*")
        .eq("user_id", user.id)
        .order("data", { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar receitas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as receitas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addReceita = async (receita: CreateReceitaData) => {
    if (!user) return;

    try {
      receitaSchema.parse(receita);

      const { data, error } = await supabase
        .from("receitas")
        .insert([{ ...receita, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setReceitas(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Receita adicionada com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao adicionar receita:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a receita.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReceita = async (id: string, updates: UpdateReceitaData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("receitas")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setReceitas(prev => prev.map(r => r.id === id ? data : r));
      toast({
        title: "Sucesso",
        description: "Receita atualizada com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao atualizar receita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a receita.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReceita = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("receitas")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setReceitas(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao excluir receita:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a receita.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadReceitas();
  }, [user]);

  const refreshReceitas = () => loadReceitas();

  return {
    receitas,
    isLoading,
    addReceita,
    updateReceita,
    deleteReceita,
    refreshReceitas,
  };
};
