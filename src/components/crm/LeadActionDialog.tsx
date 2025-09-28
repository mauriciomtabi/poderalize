import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";

interface LeadActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo?: string) => void;
  action: 'close' | 'lose';
  leadName: string;
}

export const LeadActionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  leadName
}: LeadActionDialogProps) => {
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (action === 'lose' && !motivo.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(action === 'lose' ? motivo : undefined);
      onClose();
      setMotivo("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setMotivo("");
  };

  const isCloseAction = action === 'close';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCloseAction ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {isCloseAction ? 'Marcar como Fechado' : 'Marcar como Perdido'}
          </DialogTitle>
          <DialogDescription>
            {isCloseAction ? (
              <>
                Você está prestes a marcar o lead <strong>{leadName}</strong> como fechado.
                Ele será automaticamente convertido para cliente.
              </>
            ) : (
              <>
                Você está prestes a marcar o lead <strong>{leadName}</strong> como perdido.
                Por favor, informe o motivo da perda.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isCloseAction && (
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da Perda *</Label>
            <Textarea
              id="motivo"
              placeholder="Ex: Optou por concorrente, orçamento insuficiente, não respondeu mais..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {motivo.trim() === '' && (
              <p className="text-sm text-muted-foreground">
                O motivo da perda é obrigatório
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant={isCloseAction ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isSubmitting || (!isCloseAction && !motivo.trim())}
          >
            {isSubmitting ? (
              "Processando..."
            ) : isCloseAction ? (
              "Marcar como Fechado"
            ) : (
              "Marcar como Perdido"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};