import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Colaborador, ColaboradorFormData } from '@/types/colaboradores';
import { useToast } from './use-toast';

export function useColaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchColaboradores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .order('nome');

      if (error) throw error;
      setColaboradores(data || []);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addColaborador = async (formData: ColaboradorFormData) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('colaboradores')
        .insert([{
          ...formData,
          user_id: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setColaboradores(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Colaborador adicionado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar colaborador",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateColaborador = async (id: string, formData: Partial<ColaboradorFormData>) => {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setColaboradores(prev => 
        prev.map(col => col.id === id ? data : col)
      );
      toast({
        title: "Sucesso",
        description: "Colaborador atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar colaborador",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteColaborador = async (id: string) => {
    try {
      const { error } = await supabase
        .from('colaboradores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setColaboradores(prev => prev.filter(col => col.id !== id));
      toast({
        title: "Sucesso",
        description: "Colaborador removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar colaborador:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover colaborador",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  return {
    colaboradores,
    loading,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    refetch: fetchColaboradores
  };
}