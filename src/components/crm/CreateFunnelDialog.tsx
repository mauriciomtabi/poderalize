import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, GripVertical } from "lucide-react";
import { useCRM } from "@/contexts/CRMContext";

interface CreateFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StageForm {
  title: string;
  color: string;
}

const defaultColors = [
  'hsl(220 70% 50%)', // Blue
  'hsl(45 100% 50%)', // Yellow
  'hsl(30 100% 50%)', // Orange
  'hsl(120 60% 50%)', // Green
  'hsl(280 60% 50%)', // Purple
  'hsl(0 70% 50%)', // Red
];

export const CreateFunnelDialog = ({ open, onOpenChange }: CreateFunnelDialogProps) => {
  const { createFunnel } = useCRM();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stages, setStages] = useState<StageForm[]>([
    { title: "Descoberta", color: defaultColors[0] },
    { title: "Qualificação", color: defaultColors[1] },
    { title: "Proposta", color: defaultColors[2] },
    { title: "Fechamento", color: defaultColors[3] }
  ]);

  const handleAddStage = () => {
    setStages([
      ...stages,
      { 
        title: `Etapa ${stages.length + 1}`, 
        color: defaultColors[stages.length % defaultColors.length] 
      }
    ]);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length > 2) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  const handleStageChange = (index: number, field: keyof StageForm, value: string) => {
    setStages(stages.map((stage, i) => 
      i === index ? { ...stage, [field]: value } : stage
    ));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    createFunnel({
      name,
      description: description.trim() || undefined,
      stages: stages.map((stage, index) => ({
        title: stage.title,
        color: stage.color,
        position: index
      }))
    });

    // Reset form
    setName("");
    setDescription("");
    setStages([
      { title: "Descoberta", color: defaultColors[0] },
      { title: "Qualificação", color: defaultColors[1] },
      { title: "Proposta", color: defaultColors[2] },
      { title: "Fechamento", color: defaultColors[3] }
    ]);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Funil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="funnel-name">Nome do Funil</Label>
              <Input
                id="funnel-name"
                placeholder="Ex: Funil de Vendas B2B"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="funnel-description">Descrição (opcional)</Label>
              <Textarea
                id="funnel-description"
                placeholder="Descreva o propósito e processo deste funil..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Stages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Etapas do Funil</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Etapa
              </Button>
            </div>

            <div className="space-y-3">
              {stages.map((stage, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="Nome da etapa"
                            value={stage.title}
                            onChange={(e) => handleStageChange(index, 'title', e.target.value)}
                          />
                        </div>
                        
                        {/* Color Picker */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Cor:</span>
                          <div className="flex gap-1">
                            {defaultColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={`w-6 h-6 rounded-full border-2 ${
                                  stage.color === color 
                                    ? 'border-foreground' 
                                    : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleStageChange(index, 'color', color)}
                              />
                            ))}
                          </div>
                        </div>

                        {stages.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Posição {index + 1}
                        </Badge>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {stage.title || `Etapa ${index + 1}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!name.trim() || stages.length < 2}
            >
              Criar Funil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};