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

interface InativarClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => void;
  clienteNome: string;
}

export function InativarClienteDialog({
  open,
  onOpenChange,
  onConfirm,
  clienteNome,
}: InativarClienteDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!motivo.trim()) {
      return;
    }

    setIsSubmitting(true);
    await onConfirm(motivo);
    setIsSubmitting(false);
    setMotivo("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setMotivo("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inativar Cliente</DialogTitle>
          <DialogDescription>
            Você está prestes a inativar o cliente <strong>{clienteNome}</strong>.
            Por favor, informe o motivo da inativação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div>
            <Label htmlFor="motivo">Motivo da Inativação *</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo da inativação deste cliente..."
              rows={4}
              className="mt-1"
            />
            {!motivo.trim() && (
              <p className="text-xs text-muted-foreground mt-1">
                O motivo é obrigatório para inativar um cliente
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!motivo.trim() || isSubmitting}
          >
            {isSubmitting ? "Inativando..." : "Inativar Cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
