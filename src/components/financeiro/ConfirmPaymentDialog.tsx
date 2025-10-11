import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cliente } from "@/hooks/useClientes";

interface ConfirmPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onConfirm: (data: {
    valor_pago: number;
    data_pagamento: string;
    observacoes?: string;
  }) => Promise<void>;
}

export const ConfirmPaymentDialog = ({ 
  isOpen, 
  onClose, 
  cliente,
  onConfirm 
}: ConfirmPaymentDialogProps) => {
  const [valorPago, setValorPago] = useState("");
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleConfirm = async () => {
    if (!valorPago || !dataPagamento) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        valor_pago: parseFloat(valorPago),
        data_pagamento: dataPagamento,
        observacoes: observacoes || undefined,
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setValorPago("");
    setDataPagamento(new Date().toISOString().split('T')[0]);
    setObservacoes("");
    onClose();
  };

  if (!cliente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Cliente</Label>
            <Input value={cliente.nome} disabled />
          </div>

          <div>
            <Label>Valor do Contrato</Label>
            <Input value={formatCurrency(cliente.valor_fechamento || 0)} disabled />
          </div>

          <div>
            <Label htmlFor="valor_pago">Valor Pago *</Label>
            <Input
              id="valor_pago"
              type="number"
              step="0.01"
              min="0"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="data_pagamento">Data do Pagamento *</Label>
            <Input
              id="data_pagamento"
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre o pagamento (opcional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Confirmando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
