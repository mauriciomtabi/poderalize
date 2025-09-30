import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomFunnel, FunnelStage } from "@/types/crm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useFunnels } from "@/hooks/useFunnels";
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
  const { updateFunnel } = useFunnels();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: funnel.name,
    description: funnel.description || '',
  });
  const [stages, setStages] = useState<FunnelStage[]>(funnel.stages);
  const [isLoading, setIsLoading] = useState(false);

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

      // Primeiro, buscar os IDs dos leads deste funil para reassignar depois
      const { data: leadsToUpdate, error: fetchLeadsError } = await supabase
        .from('leads')
        .select('id')
        .eq('funnel_id', funnel.id)
        .eq('user_id', user.id);

      if (fetchLeadsError) throw fetchLeadsError;

      const leadIds = leadsToUpdate?.map(l => l.id) || [];

      // Setar funnel_id e funnel_stage_id como null (constraint exige ambos null ou ambos not null)
      if (leadIds.length > 0) {
        const { error: updateLeadsError } = await supabase
          .from('leads')
          .update({ 
            funnel_stage_id: null,
            funnel_id: null 
          })
          .in('id', leadIds);

        if (updateLeadsError) throw updateLeadsError;
      }

      // Deletar etapas existentes
      const { error: deleteError } = await supabase
        .from('funnel_stages')
        .delete()
        .eq('funnel_id', funnel.id);

      if (deleteError) throw deleteError;

      // Criar novas etapas
      const stageInserts = stages.map((stage, index) => ({
        funnel_id: funnel.id,
        title: stage.title.trim(),
        color: stage.color,
        position: index,
      }));

      const { data: newStages, error: insertError } = await supabase
        .from('funnel_stages')
        .insert(stageInserts)
        .select();

      if (insertError) throw insertError;

      // Reassignar leads à primeira etapa do funil
      if (newStages && newStages.length > 0 && leadIds.length > 0) {
        const { error: assignLeadsError } = await supabase
          .from('leads')
          .update({ 
            funnel_id: funnel.id,
            funnel_stage_id: newStages[0].id 
          })
          .in('id', leadIds);

        if (assignLeadsError) throw assignLeadsError;
      }

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
                <Card key={stage.id} className="p-4">
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