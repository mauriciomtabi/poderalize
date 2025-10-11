import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Colaborador } from "@/types/colaboradores";
import { format } from "date-fns";

interface ConfirmSalaryPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  colaborador: Colaborador | null;
  onConfirm: (data: {
    valor_pago: number;
    data_pagamento: string;
    observacoes?: string;
  }) => Promise<void>;
  ano: number;
  mes: number;
}

export const ConfirmSalaryPaymentDialog = ({
  isOpen,
  onClose,
  colaborador,
  onConfirm,
  ano,
  mes,
}: ConfirmSalaryPaymentDialogProps) => {
  const [valorPago, setValorPago] = useState(colaborador?.salario?.toString() || "");
  const [dataPagamento, setDataPagamento] = useState(format(new Date(), "yyyy-MM-dd"));
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onConfirm({
        valor_pago: parseFloat(valorPago),
        data_pagamento: dataPagamento,
        observacoes: observacoes || undefined,
      });
      onClose();
      // Reset form
      setValorPago(colaborador?.salario?.toString() || "");
      setDataPagamento(format(new Date(), "yyyy-MM-dd"));
      setObservacoes("");
    } catch (error) {
      console.error("Error confirming payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento de Salário</DialogTitle>
          <DialogDescription>
            {colaborador && (
              <span>
                {colaborador.nome} - {monthNames[mes - 1]}/{ano}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor">Valor Pago</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data do Pagamento</Label>
            <Input
              id="data"
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Confirmando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
