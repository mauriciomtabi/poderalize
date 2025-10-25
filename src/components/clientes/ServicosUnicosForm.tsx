import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ServicoUnico, ServicoUnicoItem } from "@/hooks/useClientes";

interface ServicosUnicosFormProps {
  value: ServicoUnico;
  onChange: (servicos: ServicoUnico) => void;
}

export const ServicosUnicosForm = ({ value, onChange }: ServicosUnicosFormProps) => {
  const [servicos, setServicos] = useState<ServicoUnico>(value || {});

  const updateServico = (
    key: keyof ServicoUnico,
    updates: Partial<ServicoUnicoItem>
  ) => {
    const updated = {
      ...servicos,
      [key]: {
        ...(servicos[key] || { selecionado: false, pagamento_confirmado: false }),
        ...updates,
      },
    };
    setServicos(updated);
    onChange(updated);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateTotals = () => {
    let selectedCount = 0;
    let totalValue = 0;

    Object.values(servicos).forEach((servico) => {
      if (servico?.selecionado) {
        selectedCount++;
        totalValue += servico.valor || 0;
      }
    });

    return { selectedCount, totalValue };
  };

  const { selectedCount, totalValue } = calculateTotals();

  const renderServicoCard = (
    key: keyof ServicoUnico,
    title: string,
    hasDescription: boolean = false
  ) => {
    const servico = servicos[key];
    const selecionado = servico?.selecionado || false;

    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${key}-check`} className="text-base font-semibold cursor-pointer">
            {title}
          </Label>
          <Switch
            id={`${key}-check`}
            checked={selecionado}
            onCheckedChange={(checked) =>
              updateServico(key, { 
                selecionado: checked as boolean,
                pagamento_confirmado: checked ? (servico?.pagamento_confirmado || false) : false
              })
            }
          />
        </div>

        {selecionado && (
          <div className="space-y-3 pt-2 border-t">
            {hasDescription && (
              <div>
                <Label htmlFor={`${key}-desc`} className="text-sm">Descrição</Label>
                <Input
                  id={`${key}-desc`}
                  value={servico?.descricao || ""}
                  onChange={(e) =>
                    updateServico(key, { descricao: e.target.value })
                  }
                  placeholder="Descreva o serviço"
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor={`${key}-valor`} className="text-sm">Valor (R$)</Label>
              <Input
                id={`${key}-valor`}
                type="number"
                value={servico?.valor || ""}
                onChange={(e) =>
                  updateServico(key, { valor: Number(e.target.value) })
                }
                placeholder="0,00"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Data da Contratação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full mt-1 flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                        !servico?.data_contratacao && "text-muted-foreground"
                      )}
                    >
                    {servico?.data_contratacao
                      ? format(new Date(servico.data_contratacao + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar"}
                      <CalendarIcon className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={servico?.data_contratacao ? new Date(servico.data_contratacao + 'T12:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          updateServico(key, { data_contratacao: `${year}-${month}-${day}` });
                        }
                      }}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm">Data de Entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full mt-1 flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                        !servico?.data_entrega && "text-muted-foreground"
                      )}
                    >
                    {servico?.data_entrega
                      ? format(new Date(servico.data_entrega + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                      : "Selecionar"}
                      <CalendarIcon className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={servico?.data_entrega ? new Date(servico.data_entrega + 'T12:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          updateServico(key, { data_entrega: `${year}-${month}-${day}` });
                        }
                      }}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <Label htmlFor={`${key}-pagamento`} className="text-sm cursor-pointer">
                Confirmar Pagamento
              </Label>
              <Switch
                id={`${key}-pagamento`}
                checked={servico?.pagamento_confirmado || false}
                onCheckedChange={(checked) => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  updateServico(key, { 
                    pagamento_confirmado: checked as boolean,
                    data_pagamento: checked ? (servico?.data_pagamento || `${year}-${month}-${day}`) : undefined
                  });
                }}
              />
            </div>

            <div>
              <Label className="text-sm">
                {servico?.pagamento_confirmado ? "Data de Pagamento" : "Data Prevista de Pagamento"}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full mt-1 flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                      !(servico?.pagamento_confirmado ? servico?.data_pagamento : servico?.data_prevista_pagamento) && "text-muted-foreground"
                    )}
                  >
                    {servico?.pagamento_confirmado
                      ? (servico?.data_pagamento
                          ? format(new Date(servico.data_pagamento + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                          : "Selecionar")
                      : (servico?.data_prevista_pagamento
                          ? format(new Date(servico.data_prevista_pagamento + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })
                          : "Selecionar")}
                    <CalendarIcon className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      servico?.pagamento_confirmado
                        ? (servico?.data_pagamento ? new Date(servico.data_pagamento + 'T12:00:00') : undefined)
                        : (servico?.data_prevista_pagamento ? new Date(servico.data_prevista_pagamento + 'T12:00:00') : undefined)
                    }
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const dateStr = `${year}-${month}-${day}`;
                        updateServico(key, servico?.pagamento_confirmado
                          ? { data_pagamento: dateStr }
                          : { data_prevista_pagamento: dateStr }
                        );
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">SERVIÇOS ÚNICOS (SEM RECORRÊNCIA)</h3>
          <p className="text-sm text-muted-foreground">Estes valores não são somados ao valor do fechamento</p>
        </div>
        {selectedCount > 0 && (
          <div className="text-right">
            <Badge variant="secondary" className="mb-1">
              {selectedCount} {selectedCount === 1 ? 'serviço' : 'serviços'}
            </Badge>
            <p className="text-sm font-semibold">
              Total: {formatCurrency(totalValue)}
            </p>
          </div>
        )}
      </div>

      {/* Serviços */}
      {renderServicoCard("criacao_site", "Criação de Site")}
      {renderServicoCard("identidade_visual", "Identidade Visual")}
      {renderServicoCard("plataforma_vendas", "Plataforma de Vendas On-line")}
      {renderServicoCard("outros", "Outros", true)}
    </div>
  );
};
