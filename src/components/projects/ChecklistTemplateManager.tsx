import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit, GripVertical } from "lucide-react";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { ChecklistTemplate } from "@/types/projects";
import { Badge } from "@/components/ui/badge";

interface ChecklistTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: string;
}

export const ChecklistTemplateManager = ({ isOpen, onClose, boardId }: ChecklistTemplateManagerProps) => {
  const { templates, createTemplate, updateTemplate, deleteTemplate } = useChecklistTemplates(boardId);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    items: [""],
    isGlobal: true,
  });

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormData({
      title: "",
      description: "",
      items: [""],
      isGlobal: true,
    });
  };

  const handleEdit = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setIsCreating(true);
    setFormData({
      title: template.title,
      description: template.description || "",
      items: template.items.map(i => i.text),
      isGlobal: template.isGlobal,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    
    const validItems = formData.items.filter(i => i.trim());
    if (validItems.length === 0) return;

    try {
      if (editingTemplate) {
        await updateTemplate(
          editingTemplate.id,
          formData.title,
          validItems.map((text, i) => {
            const existingItem = editingTemplate.items[i];
            return existingItem ? { id: existingItem.id, text } : { text };
          }),
          formData.description || undefined,
          formData.isGlobal
        );
      } else {
        await createTemplate(
          formData.title,
          validItems,
          formData.description || undefined,
          formData.isGlobal,
          boardId
        );
      }
      setIsCreating(false);
      setEditingTemplate(null);
      setFormData({ title: "", description: "", items: [""], isGlobal: true });
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ""],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? value : item),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Templates de Listas de Verificação</DialogTitle>
        </DialogHeader>

        {!isCreating ? (
          <div className="space-y-4">
            <Button onClick={handleCreateNew} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum template criado ainda
                  </p>
                ) : (
                  templates.map(template => (
                    <div
                      key={template.id}
                      className="p-4 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{template.title}</h4>
                            {template.isGlobal && (
                              <Badge variant="secondary" className="text-xs">Global</Badge>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {template.items.length} {template.items.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Template</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Social Media, Tráfego Pago..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito deste template..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="global"
                checked={formData.isGlobal}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGlobal: checked }))}
              />
              <Label htmlFor="global">Template global (disponível em todos os boards)</Label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Itens da Lista</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Item
                </Button>
              </div>

              <ScrollArea className="h-[200px] border rounded-lg p-2">
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingTemplate(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingTemplate ? 'Atualizar' : 'Criar'} Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
