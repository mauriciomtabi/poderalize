import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, Bell, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface BoardAccessBannerProps {
  boardId: string;
  boardTitle: string;
  boardOwnerId: string;
  isUserAdmin?: boolean;
  onAccessGranted?: () => void;
}

export const BoardAccessBanner = ({
  boardId,
  boardTitle,
  boardOwnerId,
  isUserAdmin = false,
  onAccessGranted
}: BoardAccessBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isAddingSelf, setIsAddingSelf] = useState(false);
  const { user } = useAuth();

  if (!isVisible) return null;

  const handleRequestAccess = async () => {
    if (!user) return;
    
    setIsRequesting(true);
    try {
      const { error } = await (supabase as any).rpc('create_notification', {
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
      
      setIsVisible(false);
    } catch (error) {
      console.error('Error requesting access:', error);
      toast({
        title: "Erro ao solicitar acesso",
        description: "Não foi possível enviar a solicitação.",
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
      setIsVisible(false);
    } catch (error) {
      console.error('Error adding self as member:', error);
      toast({
        title: "Erro ao adicionar ao projeto",
        description: "Não foi possível adicionar você ao projeto.",
        variant: "destructive",
      });
    } finally {
      setIsAddingSelf(false);
    }
  };

  return (
    <Alert className="m-4 border-amber-500/50 bg-amber-500/10">
      <div className="flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <AlertDescription className="text-sm">
            Você está visualizando este projeto mas não é membro. 
            Para criar ou editar cartões, você precisa ser adicionado ao projeto.
          </AlertDescription>
          
          <div className="flex gap-2 flex-wrap">
            {isUserAdmin ? (
              <Button
                size="sm"
                onClick={handleAddSelf}
                disabled={isAddingSelf}
                variant="default"
              >
                <UserPlus className="h-3 w-3 mr-1.5" />
                {isAddingSelf ? "Adicionando..." : "Adicionar-me ao Projeto"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleRequestAccess}
                disabled={isRequesting}
                variant="default"
              >
                <Bell className="h-3 w-3 mr-1.5" />
                {isRequesting ? "Enviando..." : "Solicitar Acesso"}
              </Button>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
