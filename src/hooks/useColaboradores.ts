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

  const syncApprovedUsers = async () => {
    try {
      console.log('Iniciando sincronização de usuários aprovados...');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Usuário não autenticado');

      // Buscar usuários aprovados
      const { data: approvedUsers, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'colaborador');

      if (rolesError) throw rolesError;
      if (!approvedUsers || approvedUsers.length === 0) {
        console.log('Nenhum usuário aprovado encontrado');
        return;
      }

      console.log('Usuários aprovados encontrados:', approvedUsers);

      // Buscar perfis dos usuários aprovados
      const userIds = approvedUsers.map(u => u.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) {
        console.log('Nenhum perfil encontrado para usuários aprovados');
        return;
      }

      console.log('Perfis encontrados:', profiles);

      // Buscar colaboradores existentes
      const { data: existingColaboradores, error: colaboradoresError } = await supabase
        .from('colaboradores')
        .select('email');

      if (colaboradoresError) throw colaboradoresError;

      const existingEmails = new Set(existingColaboradores?.map(c => c.email) || []);
      console.log('Emails de colaboradores existentes:', Array.from(existingEmails));

      // Filtrar usuários que não estão na tabela colaboradores
      const profilesToAdd = profiles.filter(profile => 
        profile.email && !existingEmails.has(profile.email)
      );

      console.log('Perfis para adicionar:', profilesToAdd);

      // Adicionar colaboradores faltantes
      for (const profile of profilesToAdd) {
        if (profile.email) {
          console.log('Adicionando colaborador:', profile);
          const { data, error } = await supabase
            .from('colaboradores')
            .insert([{
              user_id: userData.user.id, // Admin que gerencia os colaboradores
              nome: profile.full_name || 'Nome não informado',
              email: profile.email,
              funcao: 'A definir',
              departamento: '',
              status: 'ativo',
              data_contratacao: new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();

          if (error) {
            console.error('Erro ao inserir colaborador:', error);
            throw error;
          }
          
          console.log('Colaborador inserido com sucesso:', data);
        }
      }

      if (profilesToAdd.length > 0) {
        toast({
          title: "Colaboradores sincronizados",
          description: `${profilesToAdd.length} colaboradores foram adicionados à lista`
        });
        await fetchColaboradores();
      } else {
        toast({
          title: "Sincronização concluída",
          description: "Todos os usuários aprovados já estão na lista de colaboradores"
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar usuários aprovados:', error);
      toast({
        title: "Erro na sincronização",
        description: "Erro ao sincronizar usuários aprovados",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchColaboradores();
    // Sincronizar usuários aprovados na primeira carga
    setTimeout(() => syncApprovedUsers(), 1000);
  }, []);

  return {
    colaboradores,
    loading,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    refetch: fetchColaboradores,
    syncApprovedUsers
  };
}