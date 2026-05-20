import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomFunnel, FunnelStage } from "@/types/crm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useCRM } from "@/contexts/CRMContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EditFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funnel: CustomFunnel;
}

const defaultColors = [
  'hsl(220 70% 50%)', // Blue
  'hsl(30 100% 50%)', // Orange
  'hsl(45 100% 50%)', // Yellow
  'hsl(120 60% 50%)', // Green
  'hsl(280 60% 50%)', // Purple
  'hsl(0 70% 50%)', // Red
];

export const EditFunnelDialog = ({ open, onOpenChange, funnel }: EditFunnelDialogProps) => {
  const { funnelHooks, leadHooks, funnelLeadHooks } = useCRM();
  const { updateFunnel } = funnelHooks;
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: funnel.name,
    description: funnel.description || '',
  });
  const [stages, setStages] = useState<FunnelStage[]>(funnel.stages);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStages = [...stages];
    const [draggedItem] = newStages.splice(draggedIndex, 1);
    newStages.splice(index, 0, draggedItem);
    
    const updatedStages = newStages.map((stage, i) => ({
      ...stage,
      position: i
    }));
    
    setStages(updatedStages);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stages.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newStages = [...stages];
    
    const temp = newStages[index];
    newStages[index] = newStages[newIndex];
    newStages[newIndex] = temp;

    const updatedStages = newStages.map((stage, i) => ({
      ...stage,
      position: i
    }));

    setStages(updatedStages);
  };

  useEffect(() => {
    setFormData({
      name: funnel.name,
      description: funnel.description || '',
    });
    setStages(funnel.stages);
  }, [funnel]);

  const handleAddStage = () => {
    setStages([
      ...stages,
      { 
        id: `new-${Date.now()}`,
        title: `Etapa ${stages.length + 1}`, 
        color: defaultColors[stages.length % defaultColors.length],
        position: stages.length,
        leads: []
      }
    ]);
  };

  const handleRemoveStage = (index: number) => {
    const stage = stages[index];
    if (stage.leads.length > 0) {
      toast.error('Não é possível remover uma etapa que contém leads');
      return;
    }
    
    if (stages.length > 2) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  const handleStageChange = (index: number, field: 'title' | 'color', value: string) => {
    setStages(stages.map((stage, i) => 
      i === index ? { ...stage, [field]: value } : stage
    ));
  };
  const handleSave = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Nome do funil é obrigatório');
      return;
    }

    if (stages.length === 0) {
      toast.error('Pelo menos uma etapa é necessária');
      return;
    }

    setIsLoading(true);

    try {
      // Atualizar funil
      const success = await updateFunnel(funnel.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      });

      if (!success) {
        setIsLoading(false);
        return;
      }

            // 1. Buscar etapas atuais no banco
      const { data: dbStages, error: dbStagesError } = await supabase
        .from('funnel_stages')
        .select('id')
        .eq('funnel_id', funnel.id);

      if (dbStagesError) throw dbStagesError;

      const dbStageIds = dbStages?.map(s => s.id) || [];
      const updatedStageIds = stages.filter(s => !s.id.startsWith('new-')).map(s => s.id);

      // 2. Identificar etapas deletadas (existem no banco, mas n�o no novo array)
      const stageIdsToDelete = dbStageIds.filter(id => !updatedStageIds.includes(id));

      if (stageIdsToDelete.length > 0) {
        const { error: deleteStagesError } = await supabase
          .from('funnel_stages')
          .delete()
          .in('id', stageIdsToDelete);

        if (deleteStagesError) throw deleteStagesError;
      }

      // 3. Preparar upsert: etapas existentes mant�m o ID para preservar os leads nelas
      const stagesToUpsert = stages.map((stage, index) => {
        const item = {
          funnel_id: funnel.id,
          title: stage.title.trim(),
          color: stage.color,
          position: index,
        };
        if (!stage.id.startsWith('new-')) {
          item.id = stage.id;
        }
        return item;
      });

      const { error: upsertError } = await supabase
        .from('funnel_stages')
        .upsert(stagesToUpsert);

      if (upsertError) throw upsertError;

      // Sincronizar todos os hooks instantaneamente antes de fechar o modal
      await Promise.all([
        funnelHooks.refreshFunnels(),
        leadHooks.refreshLeads(),
        funnelLeadHooks.refreshFunnelLeads()
      ]);

      toast.success('Funil atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar funil:', error);
      const message = (error as { message?: string })?.message || 'Erro ao atualizar funil';
      toast.error(`Erro ao atualizar funil: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Funil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Funil */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Funil</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome do funil"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Digite uma descrição para o funil"
                rows={3}
              />
            </div>
          </div>

          {/* Etapas do Funil */}
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
                <Card 
                  key={stage.id} 
                  className={`p-4 transition-all duration-200 ${
                    draggedIndex === index ? 'border-dashed border-primary/50 bg-primary/5 opacity-50' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                      <div className="flex flex-col gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 text-muted-foreground hover:text-secondary disabled:opacity-30"
                          onClick={() => handleMoveStage(index, 'up')}
                          disabled={index === 0}
                          title="Mover para cima"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 text-muted-foreground hover:text-secondary disabled:opacity-30"
                          onClick={() => handleMoveStage(index, 'down')}
                          disabled={index === stages.length - 1}
                          title="Mover para baixo"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
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
                                className={`w-6 h-6 rounded-full border-2 transition-all ${
                                  stage.color === color 
                                    ? 'border-foreground scale-110' 
                                    : 'border-transparent hover:border-muted-foreground'
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
                            disabled={stage.leads.length > 0}
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
                        {stage.leads.length > 0 && (
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {stage.leads.length} leads
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};