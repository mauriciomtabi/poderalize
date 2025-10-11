import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface PagamentoCliente {
  id: string;
  user_id: string;
  cliente_id: string;
  ano: number;
  mes: number;
  valor_pago: number;
  data_pagamento: string;
  status: 'pago' | 'pendente' | 'atrasado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export type CreatePagamentoData = Omit<PagamentoCliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const usePagamentosClientes = () => {
  const [pagamentos, setPagamentos] = useState<PagamentoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  const loadPagamentos = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pagamentos_clientes")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setPagamentos((data || []) as PagamentoCliente[]);
    } catch (error: any) {
      console.error("Erro ao carregar pagamentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const registrarPagamento = async (pagamentoData: CreatePagamentoData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("pagamentos_clientes")
        .insert([{ ...pagamentoData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setPagamentos(prev => [...prev, data as PagamentoCliente]);
      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível registrar o pagamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePagamento = async (id: string, updates: Partial<CreatePagamentoData>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("pagamentos_clientes")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setPagamentos(prev => prev.map(p => p.id === id ? data as PagamentoCliente : p));
      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao atualizar pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o pagamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePagamento = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("pagamentos_clientes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setPagamentos(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Pagamento excluído com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao excluir pagamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pagamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getPagamentoByPeriodo = (clienteId: string, ano: number, mes: number) => {
    return pagamentos.find(
      p => p.cliente_id === clienteId && p.ano === ano && p.mes === mes
    );
  };

  useEffect(() => {
    loadPagamentos();
  }, [user]);

  const refreshPagamentos = () => loadPagamentos();

  return {
    pagamentos,
    isLoading,
    registrarPagamento,
    updatePagamento,
    deletePagamento,
    getPagamentoByPeriodo,
    refreshPagamentos,
  };
};
