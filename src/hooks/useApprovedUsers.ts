import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface ApprovedUserProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

export function useApprovedUsers() {
  const [profiles, setProfiles] = useState<ApprovedUserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    const fetchApproved = async () => {
      if (!isAdmin) return;
      setLoading(true);
      try {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('role', ['colaborador', 'admin']);
        if (rolesError) throw rolesError;
        if (!roles || roles.length === 0) { setProfiles([]); return; }
        const ids = roles.map(r => r.user_id);
        const { data: profs, error: profsError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', ids);
        if (profsError) throw profsError;
        setProfiles((profs || []) as ApprovedUserProfile[]);
      } catch (e) {
        console.error('Erro ao carregar usuários aprovados:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApproved();
  }, [isAdmin]);

  return { profiles, loading };
}
