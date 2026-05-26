import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AuthUser, UserRole } from '@/types/auth';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile and role
          setTimeout(async () => {
            await fetchUserProfile(session.user);
          }, 0);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      // Fetch user roles (may have multiple rows)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id);

      if (rolesError) {
        throw rolesError;
      }

      const rolePriority: UserRole[] = ['admin', 'colaborador', 'pending'];
      const resolvedRole: UserRole = rolesData?.reduce<UserRole>((acc, row) => {
        if (!acc) return row.role as UserRole;
        const accPri = rolePriority.indexOf(acc);
        const rowPri = rolePriority.indexOf(row.role as UserRole);
        return rowPri < accPri ? (row.role as UserRole) : acc;
      }, 'pending') || 'pending';

      const userData: AuthUser = {
        id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
        role: resolvedRole
      };

      // Only set user if it has actually changed to keep references stable
      setUser((current) => {
        if (
          current &&
          current.id === userData.id &&
          current.email === userData.email &&
          current.full_name === userData.full_name &&
          current.avatar_url === userData.avatar_url &&
          current.role === userData.role
        ) {
          return current;
        }
        return userData;
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Preserve current user if it matches authUser.id to prevent lockout on transient network issues
      setUser((current) => {
        if (current && current.id === authUser.id) {
          console.log('Preserving current user state due to fetch failure:', current);
          return current;
        }
        return {
          id: authUser.id,
          email: authUser.email,
          role: 'pending'
        };
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta. Aguarde aprovação do administrador."
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    }
    
    return { error };
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = user?.role === 'admin';

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin
  };
};