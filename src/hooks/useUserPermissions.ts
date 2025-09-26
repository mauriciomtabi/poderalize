import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import type { UserPermission, PagePermission } from '@/types/auth';

export const useUserPermissions = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin, user } = useAuthContext();

  // Buscar todos os usuários aprovados para o admin gerenciar
  const fetchAllUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Buscar usuários com role 'colaborador'
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'colaborador');

      if (rolesError) throw rolesError;

      if (!userRoles || userRoles.length === 0) {
        setAllUsers([]);
        return;
      }

      // Buscar os perfis correspondentes
      const userIds = userRoles.map(role => role.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Buscar permissões de cada usuário
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*')
        .in('user_id', userIds);

      if (permissionsError) throw permissionsError;

      // Combinar os dados
      const usersWithData = userRoles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        const userPermissions = permissions?.filter(p => p.user_id === role.user_id) || [];
        
        return {
          ...role,
          profile: profile || null,
          permissions: userPermissions
        };
      });

      setAllUsers(usersWithData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o usuário atual tem permissão para uma página específica
  const hasPagePermission = async (page: PagePermission): Promise<boolean> => {
    if (!user) return false;
    if (isAdmin) return true; // Admins têm acesso a tudo

    try {
      const { data, error } = await supabase.rpc('user_has_page_permission', {
        _user_id: user.id,
        _page: page
      });

      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking page permission:', error);
      return false;
    }
  };

  // Atualizar permissão de um usuário para uma página
  const updateUserPermission = async (userId: string, page: PagePermission, granted: boolean) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          page,
          granted,
          granted_by: user?.id,
          granted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,page'
        });

      if (error) throw error;

      toast({
        title: "Permissão atualizada",
        description: `Permissão para ${page} foi ${granted ? 'concedida' : 'removida'}`
      });

      // Recarregar dados
      fetchAllUsers();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão",
        variant: "destructive"
      });
    }
  };

  // Definir permissões padrão para um novo usuário
  const setDefaultPermissions = async (userId: string, pages: PagePermission[]) => {
    try {
      const permissionsToInsert = pages.map(page => ({
        user_id: userId,
        page,
        granted: true,
        granted_by: user?.id,
        granted_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_permissions')
        .insert(permissionsToInsert);

      if (error) throw error;

      toast({
        title: "Permissões definidas",
        description: "Permissões padrão foram definidas para o usuário"
      });

      fetchAllUsers();
    } catch (error) {
      console.error('Error setting default permissions:', error);
      toast({
        title: "Erro",
        description: "Erro ao definir permissões padrão",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin]);

  return {
    allUsers,
    loading,
    hasPagePermission,
    updateUserPermission,
    setDefaultPermissions,
    refetch: fetchAllUsers
  };
};