import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomFunnel, FunnelStage } from "@/types/crm";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { useFunnels } from "@/hooks/useFunnels";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EditFunnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funnel: CustomFunnel;
}

export const EditFunnelDialog = ({ open, onOpenChange, funnel }: EditFunnelDialogProps) => {
  const { updateFunnel } = useFunnels();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: funnel.name,
    description: funnel.description || '',
  });
  const [stages, setStages] = useState<FunnelStage[]>(funnel.stages);
  const [newStageName, setNewStageName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: funnel.name,
      description: funnel.description || '',
    });
    setStages(funnel.stages);
  }, [funnel]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar posições
    const updatedStages = items.map((stage, index) => ({
      ...stage,
      position: index,
    }));

    setStages(updatedStages);
  };

  const addStage = () => {
    if (!newStageName.trim()) {
      toast.error('Nome da etapa é obrigatório');
      return;
    }

    const newStage: FunnelStage = {
      id: `new-${Date.now()}`, // ID temporário
      title: newStageName.trim(),
      color: '#3B82F6',
      position: stages.length,
      leads: [],
    };

    setStages([...stages, newStage]);
    setNewStageName('');
  };

  const removeStage = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage && stage.leads.length > 0) {
      toast.error('Não é possível remover uma etapa que contém leads');
      return;
    }

    setStages(stages.filter(s => s.id !== stageId));
  };

  const updateStageTitle = (stageId: string, title: string) => {
    setStages(stages.map(stage => 
      stage.id === stageId ? { ...stage, title } : stage
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

      // Primeiro, mover todos os leads deste funil para a primeira etapa (sem stage específica)
      const { error: updateLeadsError } = await supabase
        .from('leads')
        .update({ funnel_stage_id: null })
        .eq('funnel_id', funnel.id);

      if (updateLeadsError) throw updateLeadsError;

      // Deletar etapas existentes
      const { error: deleteError } = await supabase
        .from('funnel_stages')
        .delete()
        .eq('funnel_id', funnel.id);

      if (deleteError) throw deleteError;

      // Criar novas etapas
      const stageInserts = stages.map((stage, index) => ({
        funnel_id: funnel.id,
        title: stage.title,
        color: stage.color,
        position: index,
      }));

      const { data: newStages, error: insertError } = await supabase
        .from('funnel_stages')
        .insert(stageInserts)
        .select();

      if (insertError) throw insertError;

      // Atribuir leads à primeira etapa
      if (newStages && newStages.length > 0) {
        const { error: assignLeadsError } = await supabase
          .from('leads')
          .update({ funnel_stage_id: newStages[0].id })
          .eq('funnel_id', funnel.id)
          .is('funnel_stage_id', null);

        if (assignLeadsError) throw assignLeadsError;
      }

      toast.success('Funil atualizado com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar funil:', error);
      toast.error('Erro ao atualizar funil');
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
              <Badge variant="secondary">{stages.length} etapas</Badge>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="funnel-stages">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3"
                  >
                    {stages.map((stage, index) => (
                      <Draggable key={stage.id} draggableId={stage.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-4 ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="text-muted-foreground hover:text-foreground cursor-grab"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>

                              <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                                <Input
                                  value={stage.title}
                                  onChange={(e) => updateStageTitle(stage.id, e.target.value)}
                                  placeholder="Nome da etapa"
                                />
                                

                                <div className="flex items-center justify-between">
                                  <Badge variant="outline">
                                    {stage.leads.length} leads
                                  </Badge>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeStage(stage.id)}
                                    disabled={stage.leads.length > 0}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Adicionar Nova Etapa */}
            <Card className="p-4 border-dashed">
              <div className="flex items-center gap-3">
                <Input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Nome da nova etapa"
                  onKeyPress={(e) => e.key === 'Enter' && addStage()}
                />
                <Button onClick={addStage} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </Card>
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