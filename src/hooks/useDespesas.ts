import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const despesaSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().positive("Valor deve ser positivo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  data: z.string(),
  observacoes: z.string().optional(),
});

export interface Despesa {
  id: string;
  user_id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateDespesaData = Omit<Despesa, "id" | "user_id" | "created_at" | "updated_at">;
export type UpdateDespesaData = Partial<CreateDespesaData>;

export function useDespesas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadDespesas = useCallback(async () => {
    if (!user) {
      setDespesas([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("despesas")
        .select("*")
        .eq("user_id", user.id)
        .order("data", { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error: any) {
      console.error("Error loading despesas:", error);
      toast({
        title: "Erro ao carregar despesas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addDespesa = async (data: CreateDespesaData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      despesaSchema.parse(data);

      const { error } = await supabase.from("despesas").insert({
        ...data,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Despesa lançada com sucesso",
      });

      await loadDespesas();
      return true;
    } catch (error: any) {
      console.error("Error adding despesa:", error);
      toast({
        title: "Erro ao lançar despesa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDespesa = async (id: string, data: UpdateDespesaData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("despesas")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso",
      });

      await loadDespesas();
      return true;
    } catch (error: any) {
      console.error("Error updating despesa:", error);
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDespesa = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("despesas")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso",
      });

      await loadDespesas();
      return true;
    } catch (error: any) {
      console.error("Error deleting despesa:", error);
      toast({
        title: "Erro ao excluir despesa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadDespesas();
  }, [loadDespesas]);

  const refreshDespesas = () => loadDespesas();

  return {
    despesas,
    isLoading,
    addDespesa,
    updateDespesa,
    deleteDespesa,
    refreshDespesas,
  };
}
