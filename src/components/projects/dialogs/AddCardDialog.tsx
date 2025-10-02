import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Member, Label as ProjectLabel, Priority, CardStatus } from "@/types/projects";

interface AddCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCard: (cardData: any) => void;
  availableMembers: Member[];
  availableLabels: ProjectLabel[];
}

export const AddCardDialog = ({
  isOpen,
  onClose,
  onCreateCard,
  availableMembers,
  availableLabels
}: AddCardDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateCard({
      title: title.trim(),
      description: description.trim(),
      status: 'todo' as CardStatus,
      priority: 'medium' as Priority,
      labels: [],
      assignees: []
    });
    
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Cartão</DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os detalhes para criar um novo cartão no quadro de projetos
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do cartão..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Cartão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};