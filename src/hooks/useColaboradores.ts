import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Colaborador, ColaboradorFormData, DEPARTAMENTOS_DISPONIVEIS, STATUS_DISPONIVEIS } from '@/types/colaboradores';
import { useToast } from './use-toast';
import { z } from 'zod';

// Zod schema for validation
const colaboradorSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().trim().email("Email inválido"),
  funcao: z.string().trim().min(1, "Função é obrigatória"),
  telefone: z.string().trim().optional(),
  departamento: z.enum(['RH', 'TI', 'Vendas', 'Marketing', 'Financeiro', 'Operações'] as const).nullable().optional(),
  status: z.enum(['ativo', 'inativo', 'afastado'] as const).optional(),
  salario: z.number().nonnegative("Salário deve ser maior ou igual a zero").optional()
});

export function useColaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchColaboradores = async () => {
    try {
      setLoading(true);
      const { data: colaboradoresData, error } = await supabase
        .from('colaboradores')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      // Fetch profiles to get avatar_url
      const userIds = colaboradoresData?.map(c => c.user_id).filter(Boolean) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, avatar_url')
        .in('user_id', userIds);
      
      // Map avatar_url from profiles to colaboradores
      const colaboradoresWithAvatars = colaboradoresData?.map(c => {
        const profile = profilesData?.find(p => p.user_id === c.user_id);
        return {
          ...c,
          avatar_url: profile?.avatar_url || c.avatar_url
        };
      }) || [];
      
      setColaboradores(colaboradoresWithAvatars);
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

  const addColaborador = async (formData: ColaboradorFormData, colaboradorUserId?: string) => {
    try {
      // Validação com Zod
      const validatedData = colaboradorSchema.parse({
        nome: formData.nome?.trim(),
        email: formData.email?.trim(),
        funcao: formData.funcao?.trim(),
        telefone: formData.telefone?.trim() || undefined,
        departamento: formData.departamento && DEPARTAMENTOS_DISPONIVEIS.includes(formData.departamento as any) 
          ? formData.departamento : null,
        status: formData.status && STATUS_DISPONIVEIS.includes(formData.status as any) 
          ? formData.status : 'ativo'
      });

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Usuário não autenticado');

      // Try to find user_id by email if not provided
      let finalUserId = colaboradorUserId;
      if (!finalUserId) {
        const { data: authUser } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', validatedData.email)
          .maybeSingle();
        
        finalUserId = authUser?.user_id;
      }

      // Preparar dados para inserção
      const insertData = {
        nome: validatedData.nome,
        email: validatedData.email,
        funcao: validatedData.funcao,
        telefone: validatedData.telefone || null,
        departamento: validatedData.departamento,
        status: validatedData.status || 'ativo',
        user_id: finalUserId || userData.user.id // Use colaborador's user_id or fallback to admin's
      };

      const { data, error } = await supabase
        .from('colaboradores')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(`Erro na base de dados: ${error.message}`);
      }
      
      setColaboradores(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Colaborador adicionado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof z.ZodError) {
        errorMessage = error.issues.map(e => e.message).join(', ');
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: `Erro ao adicionar colaborador: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateColaborador = async (id: string, formData: Partial<ColaboradorFormData>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Usuário não autenticado');

      // Normalizar e validar dados parciais
      const normalizedData: any = {};
      
      if (formData.nome !== undefined) {
        normalizedData.nome = formData.nome?.trim() || null;
      }
      if (formData.email !== undefined) {
        normalizedData.email = formData.email?.trim() || null;
      }
      if (formData.funcao !== undefined) {
        normalizedData.funcao = formData.funcao?.trim() || null;
      }
      if (formData.telefone !== undefined) {
        normalizedData.telefone = formData.telefone?.trim() || null;
      }
      if (formData.departamento !== undefined) {
        normalizedData.departamento = formData.departamento && DEPARTAMENTOS_DISPONIVEIS.includes(formData.departamento as any) 
          ? formData.departamento : null;
      }
      if (formData.status !== undefined) {
        normalizedData.status = formData.status && STATUS_DISPONIVEIS.includes(formData.status as any) 
          ? formData.status : 'ativo';
      }

      const { data, error } = await supabase
        .from('colaboradores')
        .update({
          ...normalizedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(`Erro na base de dados: ${error.message}`);
      }
      
      setColaboradores(prev => 
        prev.map(colaborador => 
          colaborador.id === id ? data : colaborador
        )
      );
      
      toast({
        title: "Sucesso",
        description: "Colaborador atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: `Erro ao atualizar colaborador: ${errorMessage}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteColaborador = async (id: string) => {
    try {
      // First, get the colaborador to find the user_id
      const colaborador = colaboradores.find(c => c.id === id);
      if (!colaborador) {
        throw new Error('Colaborador não encontrado');
      }

        // Determinar com segurança o user_id alvo pelo email do colaborador
        const { data: currentUser } = await supabase.auth.getUser();

        let targetUserId = colaborador.user_id;
        if (colaborador.email) {
          const { data: profileLookup } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('email', colaborador.email)
            .maybeSingle();
          if (profileLookup?.user_id) {
            targetUserId = profileLookup.user_id;
          }
        }

        if (targetUserId) {
          const { data, error } = await supabase.rpc('remove_user_completely', {
            _user_id: targetUserId
          });

          if (error) {
            console.error('Erro ao remover usuário completamente:', error);
            throw error;
          }

          if (!data) {
            throw new Error('Falha ao remover usuário');
          }
        } else {
        // If no user_id, just delete from colaboradores table
        const { error } = await supabase
          .from('colaboradores')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      // Atualizar estado local imediatamente após sucesso
      setColaboradores(prev => prev.filter(col => col.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Colaborador removido completamente do sistema"
      });
      
      // Aguardar um pouco e recarregar para garantir sincronização
      setTimeout(() => {
        fetchColaboradores();
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao deletar colaborador:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao remover colaborador",
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

      // Buscar usuários aprovados (colaboradores e admins)
      const { data: approvedUsers, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['colaborador', 'admin']);

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
              user_id: profile.user_id, // Vincular ao próprio usuário colaborador
              nome: profile.full_name || 'Nome não informado',
              email: profile.email,
              funcao: 'A definir',
              departamento: null,
              status: 'ativo'
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
    
    // Configurar realtime para atualizações da tabela colaboradores
    const channel = supabase
      .channel('colaboradores-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'colaboradores'
        },
        (payload) => {
          console.log('Colaborador change detected:', payload);
          // Recarregar colaboradores quando houver mudanças
          fetchColaboradores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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