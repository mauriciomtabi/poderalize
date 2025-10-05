import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Crown } from 'lucide-react';

interface PromoteToAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isAdmin: boolean;
}

export const PromoteToAdminDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName,
  isAdmin 
}: PromoteToAdminDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {isAdmin ? <Shield className="h-5 w-5 text-warning" /> : <Crown className="h-5 w-5 text-primary" />}
            <AlertDialogTitle>
              {isAdmin ? 'Remover Privilégios de Admin' : 'Promover a Administrador'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {isAdmin ? (
              <>
                Tem certeza que deseja <strong>remover</strong> os privilégios de administrador de <strong>{userName}</strong>?
                <br /><br />
                Este usuário perderá acesso total ao sistema e precisará de permissões específicas para acessar cada página.
              </>
            ) : (
              <>
                Tem certeza que deseja promover <strong>{userName}</strong> a <strong>Administrador</strong>?
                <br /><br />
                Administradores têm <strong>acesso total</strong> ao sistema, incluindo:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Gerenciar todos os colaboradores</li>
                  <li>Aprovar novos usuários</li>
                  <li>Configurar permissões</li>
                  <li>Acesso a todas as páginas e funcionalidades</li>
                  <li>Promover outros usuários a administrador</li>
                </ul>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={isAdmin ? "bg-warning hover:bg-warning/90" : ""}
          >
            {isAdmin ? 'Remover Admin' : 'Promover a Admin'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
