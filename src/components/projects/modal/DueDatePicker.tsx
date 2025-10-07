import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string;
  onDateChange: (date?: string) => void;
}

export const DueDatePicker = ({
  isOpen,
  onClose,
  currentDate,
  onDateChange
}: DueDatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate ? new Date(currentDate) : undefined
  );

  const handleSave = () => {
    onDateChange(selectedDate ? selectedDate.toISOString() : undefined);
    onClose();
  };

  const handleRemoveDate = () => {
    setSelectedDate(undefined);
    onDateChange(undefined);
    onClose();
  };

  const handleCancel = () => {
    setSelectedDate(currentDate ? new Date(currentDate) : undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Data de Vencimento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentDate && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Data atual:</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(currentDate), "PPP", { locale: ptBR })}
              </p>
            </div>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              locale={ptBR}
              className={cn("p-3 pointer-events-auto")}
            />
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <div>
              {currentDate && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleRemoveDate(); }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Data
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
                Cancelar
              </Button>
              <Button onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                {selectedDate ? 'Salvar' : 'Remover'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};