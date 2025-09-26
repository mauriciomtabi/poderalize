import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowPending?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole,
  allowPending = false 
}) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando autenticação..." />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // User is pending approval
  if (user.role === 'pending' && !allowPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Aguardando Aprovação</h2>
          <p className="text-muted-foreground mb-4">
            Sua conta foi criada com sucesso! Aguarde a aprovação do administrador para acessar o sistema.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Você receberá um e-mail quando sua conta for aprovada.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/auth';
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check required role
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};