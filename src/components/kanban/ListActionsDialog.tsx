import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Copy, 
  Move, 
  ArrowUpDown, 
  Heart, 
  Palette, 
  Archive,
  MoreHorizontal
} from "lucide-react";

interface ListActionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listTitle: string;
  onAddCard?: () => void;
  onCopyList?: () => void;
  onMoveList?: () => void;
  onSortBy?: () => void;
  onFollow?: () => void;
  onChangeColor?: () => void;
  onArchive?: () => void;
}

export const ListActionsDialog = ({
  isOpen,
  onClose,
  listTitle,
  onAddCard,
  onCopyList,
  onMoveList,
  onSortBy,
  onFollow,
  onChangeColor,
  onArchive
}: ListActionsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Ações da Lista</DialogTitle>
          <p className="text-center text-sm text-muted-foreground font-medium">
            {listTitle}
          </p>
        </DialogHeader>
        
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={() => {
              onAddCard?.();
              onClose();
            }}
          >
            <Plus size={16} className="mr-3" />
            Adicionar cartão
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={() => {
              onCopyList?.();
              onClose();
            }}
          >
            <Copy size={16} className="mr-3" />
            Copiar lista
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={() => {
              onMoveList?.();
              onClose();
            }}
          >
            <Move size={16} className="mr-3" />
            Mover lista
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={() => {
              onSortBy?.();
              onClose();
            }}
          >
            <ArrowUpDown size={16} className="mr-3" />
            Ordenar por...
          </Button>
          
          <Separator className="my-2" />
          
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={() => {
              onFollow?.();
              onClose();
            }}
          >
            <Heart size={16} className="mr-3" />
            Seguir
          </Button>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-3 py-1">Automação</p>
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-sm"
              disabled
            >
              <MoreHorizontal size={16} className="mr-3" />
              Quando um cartão for adicionado à lista...
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-sm"
              disabled
            >
              <MoreHorizontal size={16} className="mr-3" />
              Todo dia, ordenar a lista por...
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-sm"
              disabled
            >
              <MoreHorizontal size={16} className="mr-3" />
              Toda segunda-feira, ordenar a lista por...
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-sm text-primary"
            >
              <Plus size={16} className="mr-3" />
              Criar uma regra
            </Button>
          </div>
          
          <Separator className="my-2" />
          
          <Button
            variant="ghost"
            className="w-full justify-start h-10"
            onClick={() => {
              onChangeColor?.();
              onClose();
            }}
          >
            <Palette size={16} className="mr-3" />
            Alterar cor da lista
          </Button>
          
          <p className="text-xs text-muted-foreground px-3">Arquivar Esta Lista</p>
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-destructive hover:text-destructive"
            onClick={() => {
              onArchive?.();
              onClose();
            }}
          >
            <Archive size={16} className="mr-3" />
            Arquivar todos os cartões nesta lista
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};