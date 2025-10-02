import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { CheckSquare, Search } from "lucide-react";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ChecklistTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string, items: string[]) => void;
  onCreateEmpty: () => void;
  boardId?: string;
}

export const ChecklistTemplateDialog = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateEmpty,
  boardId,
}: ChecklistTemplateDialogProps) => {
  const { templates } = useChecklistTemplates(boardId);
  const [search, setSearch] = useState("");

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(search.toLowerCase()) ||
    (template.description?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleSelectTemplate = (templateId: string, items: string[]) => {
    onSelectTemplate(templateId, items);
    onClose();
  };

  const handleCreateEmpty = () => {
    onCreateEmpty();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Lista de Verificação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCreateEmpty}
            >
              Criar Lista Vazia
            </Button>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar template..."
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[320px]">
              <div className="space-y-2 pr-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {search ? "Nenhum template encontrado" : "Nenhum template disponível"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Crie templates nas configurações do projeto
                    </p>
                  </div>
                ) : (
                  filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(
                        template.id,
                        template.items.map(i => i.text)
                      )}
                      className="w-full p-4 border rounded-lg text-left hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{template.title}</h4>
                          {template.isGlobal && (
                            <Badge variant="secondary" className="text-xs">Global</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {template.items.length} {template.items.length === 1 ? 'item' : 'itens'}
                        </span>
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                      )}

                      {template.items.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Preview dos itens:
                          </p>
                          {template.items.slice(0, 3).map((item, index) => (
                            <div key={item.id} className="text-xs text-muted-foreground flex items-center gap-2">
                              <CheckSquare className="w-3 h-3" />
                              {item.text}
                            </div>
                          ))}
                          {template.items.length > 3 && (
                            <p className="text-xs text-muted-foreground italic">
                              +{template.items.length - 3} mais...
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
