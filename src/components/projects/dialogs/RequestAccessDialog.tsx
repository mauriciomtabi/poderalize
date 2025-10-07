import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, Bell } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface RequestAccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardTitle: string;
  boardOwnerId: string;
  isUserAdmin?: boolean;
  onAccessGranted?: () => void;
}

export const RequestAccessDialog = ({
  isOpen,
  onClose,
  boardId,
  boardTitle,
  boardOwnerId,
  isUserAdmin = false,
  onAccessGranted
}: RequestAccessDialogProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isAddingSelf, setIsAddingSelf] = useState(false);
  const { user } = useAuth();

  const handleRequestAccess = async () => {
    if (!user) return;
    
    setIsRequesting(true);
    try {
      // Create notification for board owner
      const { error } = await supabase.rpc('create_notification', {
        p_user_id: boardOwnerId,
        p_type: 'access_request',
        p_title: 'Solicitação de Acesso',
        p_description: `${user.full_name || user.email} solicitou acesso ao projeto "${boardTitle}"`,
        p_priority: 'medium',
        p_link: `/projetos?board=${boardId}`,
        p_entity_type: 'board',
        p_entity_id: boardId
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "O proprietário do projeto foi notificado.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error requesting access:', error);
      toast({
        title: "Erro ao solicitar acesso",
        description: "Não foi possível enviar a solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAddSelf = async () => {
    if (!user) return;
    
    setIsAddingSelf(true);
    try {
      // Add current user as member
      const { error } = await supabase
        .from('project_members')
        .insert({
          board_id: boardId,
          user_id: user.id,
          name: user.full_name || user.email || 'Usuário',
          email: user.email || '',
          role: 'member',
          added_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Acesso concedido",
        description: "Você foi adicionado ao projeto com sucesso.",
      });
      
      onAccessGranted?.();
      onClose();
    } catch (error) {
      console.error('Error adding self as member:', error);
      toast({
        title: "Erro ao adicionar ao projeto",
        description: "Não foi possível adicionar você ao projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAddingSelf(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Acesso Negado
          </DialogTitle>
          <DialogDescription>
            Você precisa ser membro deste projeto para criar cartões.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Projeto: <span className="font-semibold text-foreground">{boardTitle}</span>
          </p>
          
          <div className="flex flex-col gap-2">
            {isUserAdmin ? (
              <Button
                onClick={handleAddSelf}
                disabled={isAddingSelf}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isAddingSelf ? "Adicionando..." : "Adicionar-me ao Projeto"}
              </Button>
            ) : (
              <Button
                onClick={handleRequestAccess}
                disabled={isRequesting}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                {isRequesting ? "Enviando..." : "Solicitar Acesso"}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
