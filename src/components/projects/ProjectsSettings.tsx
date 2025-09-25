import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tag, 
  Archive,
  Settings,
  Palette
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { ManageLabelsDialog } from "./dialogs/ManageLabelsDialog";

interface ProjectsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectsSettings = ({ isOpen, onClose }: ProjectsSettingsProps) => {
  const { state, actions } = useProjects();
  const [showManageLabels, setShowManageLabels] = useState(false);
  
  const cardColors = [
    { name: "Padrão", value: "default", color: "hsl(var(--card))" },
    { name: "Laranja Claro", value: "orange-light", color: "hsl(20 85% 95%)" },
    { name: "Azul Claro", value: "blue-light", color: "hsl(222 84% 95%)" },
    { name: "Verde Claro", value: "green-light", color: "hsl(142 71% 95%)" },
    { name: "Amarelo Claro", value: "yellow-light", color: "hsl(38 92% 95%)" },
    { name: "Roxo Claro", value: "purple-light", color: "hsl(260 90% 95%)" },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={20} />
              Configurações do Projeto
            </DialogTitle>
            <DialogDescription>
              Gerencie etiquetas e visualize itens arquivados
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            <div className="space-y-6">
              {/* Labels Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag size={16} className="text-muted-foreground" />
                    <h4 className="font-medium text-sm">Etiquetas</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManageLabels(true)}
                    className="h-8 px-3"
                  >
                    Gerenciar
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {state.currentBoard?.labels.map((label) => (
                    <Badge
                      key={label.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Card Colors */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Palette size={16} className="text-muted-foreground" />
                  <h4 className="font-medium text-sm">Cor dos Cards</h4>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {cardColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => actions.setCardColor(color.value)}
                      className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        state.currentBoard?.cardColor === color.value
                          ? "border-primary shadow-sm"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: color.color }}
                    >
                      <div className="text-xs font-medium text-foreground">
                        {color.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Archived Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Archive size={16} className="text-muted-foreground" />
                    <h4 className="font-medium text-sm">Itens Arquivados</h4>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {state.currentBoard?.lists
                      .flatMap(l => l.cards)
                      .filter(c => c.archived).length || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-archived"
                    checked={state.filters.archived}
                    onCheckedChange={(checked) => actions.setFilters({ archived: !!checked })}
                  />
                  <label htmlFor="show-archived" className="text-sm cursor-pointer">
                    Mostrar itens arquivados na visualização
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ManageLabelsDialog
        isOpen={showManageLabels}
        onClose={() => setShowManageLabels(false)}
      />
    </>
  );
};