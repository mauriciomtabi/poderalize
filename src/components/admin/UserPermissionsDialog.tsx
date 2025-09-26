import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import type { PagePermission } from '@/types/auth';
import { 
  Home, 
  FolderKanban, 
  Users2, 
  UserCheck, 
  TrendingUp, 
  Users, 
  Activity, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface UserPermissionsDialogProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAGE_CONFIGS: Record<PagePermission, { label: string; icon: any; description: string }> = {
  dashboard: { 
    label: 'Dashboard', 
    icon: Home, 
    description: 'Página inicial com visão geral' 
  },
  projetos: { 
    label: 'Projetos', 
    icon: FolderKanban, 
    description: 'Gerenciar projetos e tarefas' 
  },
  crm: { 
    label: 'CRM', 
    icon: Users2, 
    description: 'Gestão de relacionamento com clientes' 
  },
  leads: { 
    label: 'Leads', 
    icon: UserCheck, 
    description: 'Gerenciar leads e oportunidades' 
  },
  vendas: { 
    label: 'Vendas', 
    icon: TrendingUp, 
    description: 'Acompanhar vendas e métricas' 
  },
  colaboradores: { 
    label: 'Colaboradores', 
    icon: Users, 
    description: 'Gerenciar equipe e colaboradores' 
  },
  acompanhamento: { 
    label: 'Acompanhamento', 
    icon: Activity, 
    description: 'Acompanhar atividades e progresso' 
  },
  relatorios: { 
    label: 'Relatórios', 
    icon: BarChart3, 
    description: 'Visualizar relatórios e análises' 
  },
  configuracoes: { 
    label: 'Configurações', 
    icon: Settings, 
    description: 'Configurações do sistema' 
  }
};

export const UserPermissionsDialog = ({ user, open, onOpenChange }: UserPermissionsDialogProps) => {
  const { updateUserPermission } = useUserPermissions();
  const [updatingPermissions, setUpdatingPermissions] = useState<Record<string, boolean>>({});

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const hasPermission = (page: PagePermission): boolean => {
    return user.permissions?.some((p: any) => p.page === page && p.granted) || false;
  };

  const handlePermissionToggle = async (page: PagePermission, granted: boolean) => {
    setUpdatingPermissions(prev => ({ ...prev, [page]: true }));
    
    try {
      await updateUserPermission(user.user_id, page, granted);
    } finally {
      setUpdatingPermissions(prev => ({ ...prev, [page]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user.profile?.full_name || 'Usuário'}</div>
              <div className="text-sm text-muted-foreground">{user.profile?.email}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Permissões de Acesso</h4>
            <Badge variant="secondary">
              {user.permissions?.filter((p: any) => p.granted).length || 0} de {Object.keys(PAGE_CONFIGS).length}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-4">
            {Object.entries(PAGE_CONFIGS).map(([page, config]) => {
              const IconComponent = config.icon;
              const isGranted = hasPermission(page as PagePermission);
              const isUpdating = updatingPermissions[page];

              return (
                <div key={page} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-background">
                      <IconComponent size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <Label className="font-medium">{config.label}</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isGranted}
                    disabled={isUpdating}
                    onCheckedChange={(checked) => 
                      handlePermissionToggle(page as PagePermission, checked)
                    }
                  />
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};