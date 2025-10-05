import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shield, Lock, Unlock } from 'lucide-react';
import { useUserPermissions, ALL_PAGES, PagePermission } from '@/hooks/useUserPermissions';

interface PermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const PermissionsDialog = ({ isOpen, onClose, userId, userName }: PermissionsDialogProps) => {
  const { permissions, loading, updatePermission, hasPermission } = useUserPermissions(userId);
  const [localPermissions, setLocalPermissions] = useState<Record<PagePermission, boolean>>({
    projetos: false,
    crm: false,
    leads: false,
    vendas: false,
    acompanhamento: false,
    relatorios: false,
    configuracoes: false,
    dashboard: false,
    colaboradores: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (permissions.length > 0) {
      const permissionsMap: Record<PagePermission, boolean> = {
        projetos: false,
        crm: false,
        leads: false,
        vendas: false,
        acompanhamento: false,
        relatorios: false,
        configuracoes: false,
        dashboard: false,
        colaboradores: false
      };

      permissions.forEach(p => {
        permissionsMap[p.page as PagePermission] = p.granted;
      });

      setLocalPermissions(permissionsMap);
    }
  }, [permissions]);

  const handleToggle = (page: PagePermission) => {
    setLocalPermissions(prev => ({
      ...prev,
      [page]: !prev[page]
    }));
  };

  const handleAllowAll = () => {
    const allAllowed: Record<PagePermission, boolean> = {
      projetos: true,
      crm: true,
      leads: true,
      vendas: true,
      acompanhamento: true,
      relatorios: true,
      configuracoes: true,
      dashboard: true,
      colaboradores: true
    };
    setLocalPermissions(allAllowed);
  };

  const handleDenyAll = () => {
    const allDenied: Record<PagePermission, boolean> = {
      projetos: false,
      crm: false,
      leads: false,
      vendas: false,
      acompanhamento: false,
      relatorios: false,
      configuracoes: false,
      dashboard: false,
      colaboradores: false
    };
    setLocalPermissions(allDenied);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Atualizar todas as permissões
      for (const page of ALL_PAGES) {
        await updatePermission(page.value, localPermissions[page.value]);
      }
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Gerenciar Permissões</DialogTitle>
          </div>
          <DialogDescription>
            Configure quais páginas {userName} pode acessar
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAllowAll}
                className="flex-1"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Permitir Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDenyAll}
                className="flex-1"
              >
                <Lock className="h-4 w-4 mr-2" />
                Negar Todos
              </Button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto py-4">
            {ALL_PAGES.map(page => (
              <Card key={page.value} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {localPermissions[page.value] ? (
                        <Unlock className="h-5 w-5 text-green-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <Label htmlFor={`permission-${page.value}`} className="text-base font-medium cursor-pointer">
                          {page.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {localPermissions[page.value] ? 'Acesso permitido' : 'Acesso negado'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={`permission-${page.value}`}
                      checked={localPermissions[page.value]}
                      onCheckedChange={() => handleToggle(page.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || loading}>
            {isSaving ? (
              <>
                <LoadingSpinner className="mr-2" />
                Salvando...
              </>
            ) : (
              'Salvar Permissões'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
