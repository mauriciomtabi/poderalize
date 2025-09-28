import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ProjectMember {
  id: string;
  board_id: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  added_by?: string;
  added_at: string;
  created_at: string;
  updated_at: string;
}

export const useProjectMembers = (boardId?: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchMembers = async () => {
    if (!boardId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('board_id', boardId)
        .order('added_at', { ascending: true });

      if (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar membros do projeto",
          variant: "destructive",
        });
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (memberData: Omit<ProjectMember, 'id' | 'added_at' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      // If adding the current user, use their real data
      const finalMemberData = memberData.user_id === user.id ? {
        ...memberData,
        name: user.full_name || user.email || 'Você',
        email: user.email || 'user@example.com',
        added_by: user.id,
      } : {
        ...memberData,
        added_by: user.id,
      };

      const { data, error } = await supabase
        .from('project_members')
        .insert(finalMemberData)
        .select()
        .single();

      if (error) {
        console.error('Error adding member:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar membro",
          variant: "destructive",
        });
        return null;
      }

      await fetchMembers();
      return data;
    } catch (error) {
      console.error('Error adding member:', error);
      return null;
    }
  };

  const updateMember = async (id: string, updates: Partial<ProjectMember>) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating member:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar membro",
          variant: "destructive",
        });
        return false;
      }

      await fetchMembers();
      return true;
    } catch (error) {
      console.error('Error updating member:', error);
      return false;
    }
  };

  const removeMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing member:', error);
        toast({
          title: "Erro",
          description: "Erro ao remover membro",
          variant: "destructive",
        });
        return false;
      }

      await fetchMembers();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchMembers();
    }
  }, [boardId]);

  return {
    members,
    isLoading,
    fetchMembers,
    addMember,
    updateMember,
    removeMember,
  };
};