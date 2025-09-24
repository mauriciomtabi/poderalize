import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (title: string, color: string) => void;
}

const predefinedColors = [
  { name: 'Laranja', value: 'hsl(25 95% 53%)' },
  { name: 'Azul', value: 'hsl(217 91% 60%)' },
  { name: 'Verde', value: 'hsl(142 71% 45%)' },
  { name: 'Vermelho', value: 'hsl(0 84% 60%)' },
  { name: 'Roxo', value: 'hsl(262 83% 58%)' },
  { name: 'Rosa', value: 'hsl(330 81% 60%)' },
  { name: 'Amarelo', value: 'hsl(45 93% 47%)' },
  { name: 'Ciano', value: 'hsl(191 91% 36%)' },
  { name: 'Cinza', value: 'hsl(220 9% 46%)' },
  { name: 'Marrom', value: 'hsl(25 75% 47%)' }
];

export const AddListDialog = ({ isOpen, onClose, onCreateList }: AddListDialogProps) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateList(title.trim(), selectedColor);
    setTitle('');
    setSelectedColor(predefinedColors[0].value);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setSelectedColor(predefinedColors[0].value);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Lista</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="listTitle">Título da Lista</Label>
            <Input
              id="listTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da lista..."
              required
              autoFocus
            />
          </div>

          <div>
            <Label>Cor da Lista</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`
                    w-10 h-10 rounded-lg border-2 transition-all
                    ${selectedColor === color.value 
                      ? 'border-foreground scale-110' 
                      : 'border-transparent hover:border-muted-foreground'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Criar Lista
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};