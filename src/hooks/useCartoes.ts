import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface CartaoCredito {
  id: string;
  user_id: string;
  nome: string;
  bandeira: string;
  ultimos_digitos?: string;
  limite: number;
  dia_fechamento: number;
  dia_vencimento: number;
  cor: string;
  icone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateCartaoData = Omit<CartaoCredito, "id" | "user_id" | "created_at" | "updated_at">;
export type UpdateCartaoData = Partial<CreateCartaoData>;

export function useCartoes() {
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadCartoes = useCallback(async () => {
    if (!user) {
      setCartoes([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cartoes_credito")
        .select("*")
        .eq("user_id", user.id)
        .order("nome", { ascending: true });

      if (error) throw error;
      setCartoes(data || []);
    } catch (error: any) {
      console.error("Error loading cartoes:", error);
      toast({
        title: "Erro ao carregar cartões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addCartao = async (data: CreateCartaoData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("cartoes_credito").insert({
        ...data,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cartão cadastrado com sucesso",
      });

      await loadCartoes();
      return true;
    } catch (error: any) {
      console.error("Error adding cartao:", error);
      toast({
        title: "Erro ao cadastrar cartão",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCartao = async (id: string, data: UpdateCartaoData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("cartoes_credito")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cartão atualizado com sucesso",
      });

      await loadCartoes();
      return true;
    } catch (error: any) {
      console.error("Error updating cartao:", error);
      toast({
        title: "Erro ao atualizar cartão",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCartao = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("cartoes_credito")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cartão excluído com sucesso",
      });

      await loadCartoes();
      return true;
    } catch (error: any) {
      console.error("Error deleting cartao:", error);
      toast({
        title: "Erro ao excluir cartão",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadCartoes();
  }, [loadCartoes]);

  return {
    cartoes,
    isLoading,
    addCartao,
    updateCartao,
    deleteCartao,
    refreshCartoes: loadCartoes,
  };
}
