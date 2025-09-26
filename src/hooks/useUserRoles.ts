import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import type { UserRole, UserRoleData } from '@/types/auth';

export const useUserRoles = () => {
  const [pendingUsers, setPendingUsers] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuthContext();

  const fetchPendingUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      // Primeiro buscar os user_roles pendentes
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'pending');

      if (rolesError) throw rolesError;

      if (!userRoles || userRoles.length === 0) {
        setPendingUsers([]);
        return;
      }

      // Buscar os perfis correspondentes
      const userIds = userRoles.map(role => role.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combinar os dados
      const usersWithProfiles = userRoles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          ...role,
          profiles: profile || null
        };
      });

      setPendingUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários pendentes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string, role: UserRole = 'colaborador') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          role,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Usuário aprovado!",
        description: "Usuário foi aprovado com sucesso"
      });

      fetchPendingUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar usuário",
        variant: "destructive"
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Usuário rejeitado",
        description: "Usuário foi rejeitado"
      });

      fetchPendingUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Erro", 
        description: "Erro ao rejeitar usuário",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [isAdmin]);

  return {
    pendingUsers,
    loading,
    approveUser,
    rejectUser,
    refetch: fetchPendingUsers
  };
};