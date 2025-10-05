import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PagePermission = 'dashboard' | 'projetos' | 'crm' | 'leads' | 'vendas' | 'colaboradores' | 'acompanhamento' | 'relatorios' | 'configuracoes';

export interface UserPermission {
  id: string;
  user_id: string;
  page: PagePermission;
  granted: boolean;
  granted_by: string | null;
  granted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ALL_PAGES: { value: PagePermission; label: string }[] = [
  { value: 'projetos', label: 'Projetos' },
  { value: 'crm', label: 'CRM' },
  { value: 'leads', label: 'Leads' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'relatorios', label: 'Relatórios' },
  { value: 'configuracoes', label: 'Configurações' },
];

export const useUserPermissions = (userId?: string) => {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar permissões",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (page: PagePermission, granted: boolean) => {
    if (!userId) return;

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user) throw new Error('Usuário não autenticado');

      // Verificar se já existe uma permissão para esta página
      const existingPermission = permissions.find(p => p.page === page);

      if (existingPermission) {
        // Atualizar permissão existente
        const { error } = await supabase
          .from('user_permissions')
          .update({ 
            granted,
            granted_by: currentUser.user.id,
            granted_at: new Date().toISOString()
          })
          .eq('id', existingPermission.id);

        if (error) throw error;
      } else {
        // Criar nova permissão
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            page,
            granted,
            granted_by: currentUser.user.id,
            granted_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      await fetchPermissions();
      
      toast({
        title: "Sucesso",
        description: "Permissão atualizada"
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão",
        variant: "destructive"
      });
    }
  };

  const hasPermission = (page: PagePermission): boolean => {
    const permission = permissions.find(p => p.page === page);
    return permission?.granted ?? false;
  };

  useEffect(() => {
    if (userId) {
      fetchPermissions();
    }
  }, [userId]);

  return {
    permissions,
    loading,
    updatePermission,
    hasPermission,
    refetch: fetchPermissions
  };
};
