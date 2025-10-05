import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useAdminRole = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const promoteToAdmin = async (userId: string, userName: string) => {
    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      // Verificar se já é admin
      const isAlreadyAdmin = await checkIsAdmin(userId);
      if (isAlreadyAdmin) {
        toast({
          title: 'Usuário já é admin',
          description: `${userName} já possui privilégios de administrador`,
          variant: 'destructive',
        });
        return false;
      }

      // Adicionar role de admin
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
          assigned_by: currentUser.user.id,
          assigned_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Admin promovido',
        description: `${userName} agora é administrador com acesso total`,
      });

      return true;
    } catch (error: any) {
      console.error('Error promoting to admin:', error);
      toast({
        title: 'Erro ao promover',
        description: error.message || 'Não foi possível promover o usuário',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async (userId: string, userName: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast({
        title: 'Privilégios removidos',
        description: `${userName} não é mais administrador`,
      });

      return true;
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast({
        title: 'Erro ao remover privilégios',
        description: error.message || 'Não foi possível remover os privilégios',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkIsAdmin,
    promoteToAdmin,
    removeAdmin,
  };
};
