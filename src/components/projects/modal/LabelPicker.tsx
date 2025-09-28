import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label as ProjectLabel } from "@/types/projects";
import { Tag } from "lucide-react";

interface LabelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  availableLabels: ProjectLabel[];
  selectedLabels: ProjectLabel[];
  onLabelsChange: (labels: ProjectLabel[]) => void;
}

export const LabelPicker = ({
  isOpen,
  onClose,
  availableLabels,
  selectedLabels,
  onLabelsChange
}: LabelPickerProps) => {
  const [tempSelected, setTempSelected] = useState<ProjectLabel[]>(selectedLabels);

  const handleToggleLabel = (label: ProjectLabel) => {
    const isSelected = tempSelected.some(l => l.id === label.id);
    if (isSelected) {
      setTempSelected(tempSelected.filter(l => l.id !== label.id));
    } else {
      setTempSelected([...tempSelected, label]);
    }
  };

  const handleSave = () => {
    onLabelsChange(tempSelected);
    onClose();
  };

  const handleCancel = () => {
    setTempSelected(selectedLabels);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Selecionar Etiquetas
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {availableLabels.map(label => {
            const isSelected = tempSelected.some(l => l.id === label.id);
            return (
              <div 
                key={label.id} 
                className="flex items-center space-x-3 p-3 rounded hover:bg-muted cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleToggleLabel(label); }}
              >
                <Checkbox checked={isSelected} onChange={() => {}} />
                <Badge 
                  style={{ backgroundColor: label.color }} 
                  className="text-white min-w-0 flex-1"
                >
                  {label.name}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
            Cancelar
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); handleSave(); }}>
            Salvar ({tempSelected.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};