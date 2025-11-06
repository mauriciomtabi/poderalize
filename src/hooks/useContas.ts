import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface ContaBancaria {
  id: string;
  user_id: string;
  nome: string;
  banco: string;
  tipo_conta: string;
  saldo_inicial: number;
  saldo_atual: number;
  cor: string;
  icone?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export function useContas() {
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadContas = useCallback(async () => {
    if (!user) {
      setContas([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .select("*")
        .eq("user_id", user.id)
        .order("nome", { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error: any) {
      console.error("Error loading contas:", error);
      toast({
        title: "Erro ao carregar contas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadContas();
  }, [loadContas]);

  return {
    contas,
    isLoading,
    refreshContas: loadContas,
  };
}
