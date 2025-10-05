import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { PagePermission } from '@/hooks/useUserPermissions';

interface PageGuardProps {
  children: React.ReactNode;
  page: PagePermission;
}

export const PageGuard: React.FC<PageGuardProps> = ({ children, page }) => {
  const { user, loading: authLoading, isAdmin } = useAuthContext();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkPermission = async () => {
      if (authLoading || !user) {
        setLoading(false);
        return;
      }

      // Admins sempre têm acesso
      if (isAdmin) {
        setHasPermission(true);
        setLoading(false);
        return;
      }

      try {
        // Verificar permissão usando a função do banco
        const { data, error } = await supabase.rpc('user_has_page_permission', {
          _user_id: user.id,
          _page: page
        });

        if (error) throw error;
        setHasPermission(data || false);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [user, page, isAdmin, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando permissões..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com o administrador para solicitar acesso.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
