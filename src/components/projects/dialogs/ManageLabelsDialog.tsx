import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Label as ProjectLabel } from "@/types/projects";
import { useProjects } from "@/contexts/ProjectsContext";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";
import { z } from "zod";

const labelSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Nome é obrigatório" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  description: z.string()
    .trim()
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" })
    .optional()
});

const predefinedColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
];

interface ManageLabelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageLabelsDialog = ({ isOpen, onClose }: ManageLabelsDialogProps) => {
  const { state, actions } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const availableLabels = state.currentBoard?.labels || [];

  const validateForm = () => {
    try {
      labelSchema.parse({ name, description });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { name?: string; description?: string } = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedColor(predefinedColors[0]);
    setErrors({});
    setIsCreating(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    
    // Check for duplicate names
    if (availableLabels.some(label => label.name.toLowerCase() === name.toLowerCase())) {
      setErrors({ name: "Já existe uma etiqueta com esse nome" });
      return;
    }

    actions.addLabel(name.trim(), selectedColor, description.trim());
    resetForm();
  };

  const handleEdit = (label: ProjectLabel) => {
    setName(label.name);
    setDescription(label.description || "");
    setSelectedColor(label.color);
    setEditingId(label.id);
    setIsCreating(false);
  };

  const handleUpdate = () => {
    if (!validateForm() || !editingId) return;
    
    // Check for duplicate names (excluding current label)
    if (availableLabels.some(label => 
      label.id !== editingId && 
      label.name.toLowerCase() === name.toLowerCase()
    )) {
      setErrors({ name: "Já existe uma etiqueta com esse nome" });
      return;
    }

    actions.updateLabel(editingId, {
      name: name.trim(),
      color: selectedColor,
      description: description.trim()
    });
    resetForm();
  };

  const handleDelete = (labelId: string) => {
    actions.deleteLabel(labelId);
    setDeleteConfirmId(null);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded" />
              Gerenciar Etiquetas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {isCreating ? "Nova Etiqueta" : "Editar Etiqueta"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome *</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Bug, Feature, Urgente..."
                      maxLength={50}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descrição opcional da etiqueta..."
                      rows={2}
                      maxLength={200}
                      className={errors.description ? "border-destructive" : ""}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor</label>
                    <div className="grid grid-cols-10 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-8 h-8 rounded border-2 transition-all",
                            selectedColor === color
                              ? "border-primary scale-110"
                              : "border-muted hover:scale-105"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Preview:</span>
                      <Badge style={{ backgroundColor: selectedColor }} className="text-white">
                        {name || "Nome da etiqueta"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={isCreating ? handleCreate : handleUpdate}>
                      <Save className="h-4 w-4 mr-2" />
                      {isCreating ? "Criar" : "Salvar"}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Labels List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Etiquetas Existentes ({availableLabels.length})
                </h3>
                {!isCreating && !editingId && (
                  <Button onClick={startCreating} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Etiqueta
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-3">
                  {availableLabels.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8" />
                      </div>
                      <p>Nenhuma etiqueta criada ainda</p>
                      <p className="text-sm">Clique em "Nova Etiqueta" para começar</p>
                    </div>
                  ) : (
                    availableLabels.map((label) => (
                      <div
                        key={label.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: label.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{label.name}</div>
                            {label.description && (
                              <div className="text-sm text-muted-foreground truncate">
                                {label.description}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(label)}
                            disabled={isCreating || editingId === label.id}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(label.id)}
                            disabled={isCreating || editingId !== null}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Excluir Etiqueta"
        description="Tem certeza de que deseja excluir esta etiqueta? Ela será removida de todos os cartões que a utilizam."
        confirmText="Excluir"
        variant="destructive"
      />
    </>
  );
};