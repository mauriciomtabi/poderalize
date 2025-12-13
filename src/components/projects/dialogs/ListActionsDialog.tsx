import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProjectList } from "@/types/projects";
import { useAuthContext } from "@/contexts/AuthContext";
import { Archive, Clock } from "lucide-react";

interface ListActionsDialogProps {
  list: ProjectList | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateList: (listId: string, updates: Partial<ProjectList>) => void;
  onArchiveList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  onArchiveAllCards?: (listId: string) => void;
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

export const ListActionsDialog = ({ 
  list, 
  isOpen, 
  onClose, 
  onUpdateList, 
  onArchiveList,
  onDeleteList,
  onArchiveAllCards
}: ListActionsDialogProps) => {
  const [title, setTitle] = useState(list?.title || '');
  const [selectedColor, setSelectedColor] = useState(list?.color || predefinedColors[0].value);
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(false);
  const [autoArchiveDays, setAutoArchiveDays] = useState(30);
  const { isAdmin } = useAuthContext();

  // Parse list rules for auto-archive config
  useEffect(() => {
    if (list?.rules) {
      const rules = typeof list.rules === 'string' ? JSON.parse(list.rules) : list.rules;
      if (rules?.auto_archive_after_days) {
        setAutoArchiveEnabled(true);
        setAutoArchiveDays(rules.auto_archive_after_days);
      } else {
        setAutoArchiveEnabled(false);
        setAutoArchiveDays(30);
      }
    } else {
      setAutoArchiveEnabled(false);
      setAutoArchiveDays(30);
    }
  }, [list]);

  const handleSave = () => {
    if (!list || !title.trim()) return;
    
    // Build rules with auto-archive config
    const existingRules = typeof list.rules === 'string' ? JSON.parse(list.rules || '{}') : (list.rules || {});
    const newRules = {
      ...existingRules,
      auto_archive_after_days: autoArchiveEnabled ? autoArchiveDays : null
    };
    
    onUpdateList(list.id, {
      title: title.trim(),
      color: selectedColor,
      rules: newRules
    });
    onClose();
  };

  const handleArchive = () => {
    if (!list) return;
    onArchiveList(list.id);
    onClose();
  };

  const handleDelete = () => {
    if (!list) return;
    if (list.cards.length > 0) {
      const confirmed = window.confirm(
        `A lista "${list.title}" contém ${list.cards.length} cartão(s). Tem certeza que deseja excluí-la? Esta ação não pode ser desfeita.`
      );
      if (!confirmed) return;
    }
    
    onDeleteList(list.id);
    onClose();
  };

  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ações da Lista</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <div>
              <Label htmlFor="listTitle">Título da Lista</Label>
              <Input
                id="listTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da lista..."
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

            {isAdmin && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Arquivamento Automático
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Arquivar cards automaticamente após um período
                      </p>
                    </div>
                    <Switch
                      checked={autoArchiveEnabled}
                      onCheckedChange={setAutoArchiveEnabled}
                    />
                  </div>
                  
                  {autoArchiveEnabled && (
                    <div className="flex items-center gap-2 pl-6">
                      <span className="text-sm text-muted-foreground">Após</span>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={autoArchiveDays}
                        onChange={(e) => setAutoArchiveDays(parseInt(e.target.value) || 30)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">dias nesta lista</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar Alterações
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleArchive}
              >
                📦 Arquivar Lista
              </Button>
              
              {isAdmin && onArchiveAllCards && list && list.cards.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Tem certeza que deseja arquivar todos os ${list.cards.length} cartão(s) desta lista?`
                      );
                      if (confirmed) {
                        onArchiveAllCards(list.id);
                        onClose();
                      }
                    }}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar todos os cards ({list.cards.length})
                  </Button>
                </>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Zona de Perigo</strong>
                </p>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleDelete}
                >
                  🗑️ Excluir Lista
                </Button>
                <p className="text-xs text-muted-foreground">
                  Esta ação excluirá permanentemente a lista e todos os seus cartões. 
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};