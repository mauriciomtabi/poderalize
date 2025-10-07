import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Move } from "lucide-react";
import { ProjectList } from "@/types/projects";
import { cn } from "@/lib/utils";

interface MoveCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentListId: string;
  availableLists: ProjectList[];
  onMove: (listId: string) => void;
}

export const MoveCardDialog = ({
  isOpen,
  onClose,
  currentListId,
  availableLists,
  onMove,
}: MoveCardDialogProps) => {
  const [selectedListId, setSelectedListId] = useState<string>("");

  const handleMove = () => {
    if (selectedListId && selectedListId !== currentListId) {
      onMove(selectedListId);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedListId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            Mover Cartão
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione a lista de destino para mover este cartão:
          </p>
          
          <ScrollArea className="max-h-80">
            <div className="space-y-2">
              {availableLists
                .filter(list => !list.archived)
                .map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  className={cn(
                    "w-full p-3 text-left rounded-md border transition-colors",
                    selectedListId === list.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:bg-muted/50",
                    list.id === currentListId && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={list.id === currentListId}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: list.color }}
                      />
                      <span className="font-medium">{list.title}</span>
                    </div>
                    {list.id === currentListId && (
                      <Badge variant="secondary" className="text-xs">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {list.cards?.filter(card => !card.archived).length || 0} cartões
                  </p>
                </button>
                ))}
            </div>
          </ScrollArea>
        </div>

      <DialogFooter>
        <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
          Cancelar
        </Button>
        <Button 
          onClick={(e) => { e.stopPropagation(); handleMove(); }}
          disabled={!selectedListId || selectedListId === currentListId}
        >
          Mover
        </Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};