import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PagamentoSalario {
  id: string;
  user_id: string;
  colaborador_id: string;
  ano: number;
  mes: number;
  valor_pago: number;
  data_pagamento: string;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const usePagamentosSalarios = () => {
  const [pagamentosSalarios, setPagamentosSalarios] = useState<PagamentoSalario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const { toast } = useToast();

  const fetchPagamentosSalarios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pagamentos_salarios')
        .select('*')
        .eq('user_id', user.id)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) throw error;

      setPagamentosSalarios((data || []) as PagamentoSalario[]);
    } catch (error: any) {
      console.error('Error fetching pagamentos salarios:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar pagamentos",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagamentosSalarios();
  }, [user]);

  const addPagamentoSalario = async (pagamento: Omit<PagamentoSalario, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pagamentos_salarios')
        .insert([{ ...pagamento, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      await fetchPagamentosSalarios();
      toast({
        title: "Pagamento registrado",
        description: "Pagamento de salário registrado com sucesso.",
      });
    } catch (error: any) {
      console.error('Error adding pagamento salario:', error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar pagamento",
        description: error.message,
      });
    }
  };

  const deletePagamentoSalario = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos_salarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPagamentosSalarios();
      toast({
        title: "Pagamento excluído",
        description: "Pagamento de salário excluído com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting pagamento salario:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir pagamento",
        description: error.message,
      });
    }
  };

  return {
    pagamentosSalarios,
    loading,
    addPagamentoSalario,
    deletePagamentoSalario,
    refetch: fetchPagamentosSalarios,
  };
};
