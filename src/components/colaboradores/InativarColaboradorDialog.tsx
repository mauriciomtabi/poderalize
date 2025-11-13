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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserX } from "lucide-react";

interface InativarColaboradorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
  colaboradorNome: string;
}

export const InativarColaboradorDialog = ({
  isOpen,
  onClose,
  onConfirm,
  colaboradorNome,
}: InativarColaboradorDialogProps) => {
  const [motivo, setMotivo] = useState("");

  const handleConfirm = () => {
    onConfirm(motivo);
    setMotivo("");
  };

  const handleClose = () => {
    setMotivo("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-destructive" />
            Inativar Colaborador
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja inativar <strong>{colaboradorNome}</strong>?
            O colaborador será movido para a lista de inativos e não aparecerá mais na lista de colaboradores ativos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da inativação (opcional)</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo da inativação..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            <UserX className="h-4 w-4 mr-2" />
            Confirmar Inativação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
