import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ServicoUnico, ServicoUnicoItem } from "@/hooks/useClientes";

// Date picker button that closes the popover on selection and fixes timezone issues
type DatePickerButtonProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const DatePickerButton = ({ value, onChange, placeholder = "Selecionar" }: DatePickerButtonProps) => {
  const [open, setOpen] = useState(false);
  const display = value ? format(new Date(value + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR }) : placeholder;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full mt-1 flex items-center justify-between rounded-md border px-3 py-2 text-sm",
            !value && "text-muted-foreground"
          )}
          aria-label="Abrir calendário"
        >
          {display}
          <CalendarIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value + 'T12:00:00') : undefined}
          onSelect={(date) => {
            if (date) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              onChange(`${year}-${month}-${day}`);
              setOpen(false);
            }
          }}
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

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
              <Label htmlFor={`${key}-modo`} className="text-sm">Modo de Pagamento</Label>
              <Select
                value={servico?.modo_pagamento || 'dinheiro'}
                onValueChange={(value: 'dinheiro' | 'permuta' | 'dinheiro_permuta') =>
                  updateServico(key, { modo_pagamento: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="permuta">Permuta</SelectItem>
                  <SelectItem value="dinheiro_permuta">Dinheiro + Permuta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {servico?.modo_pagamento === 'dinheiro_permuta' ? (
              <>
                {/* Dois campos editáveis para dinheiro_permuta */}
                <div>
                  <Label htmlFor={`${key}-valor-permuta`} className="text-sm">Valor da Permuta (R$)</Label>
                  <Input
                    id={`${key}-valor-permuta`}
                    type="number"
                    value={servico?.valor_permuta || ""}
                    onChange={(e) => {
                      const valorPermuta = Number(e.target.value);
                      const valorDinheiro = servico?.valor_dinheiro || 0;
                      updateServico(key, { 
                        valor_permuta: valorPermuta,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`${key}-valor-dinheiro`} className="text-sm">Valor Dinheiro (R$)</Label>
                  <Input
                    id={`${key}-valor-dinheiro`}
                    type="number"
                    value={servico?.valor_dinheiro || ""}
                    onChange={(e) => {
                      const valorDinheiro = Number(e.target.value);
                      const valorPermuta = servico?.valor_permuta || 0;
                      updateServico(key, { 
                        valor_dinheiro: valorDinheiro,
                        valor: valorPermuta + valorDinheiro
                      });
                    }}
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>

                {/* Valor Total readonly calculado */}
                <div>
                  <Label htmlFor={`${key}-valor`} className="text-sm">Valor Total (R$)</Label>
                  <Input
                    id={`${key}-valor`}
                    type="text"
                    value={formatCurrency(servico?.valor || 0)}
                    readOnly
                    disabled
                    className="mt-1 bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculado: Permuta + Dinheiro
                  </p>
                </div>

                <div>
                  <Label htmlFor={`${key}-desc-permuta`} className="text-sm">Descrição da Permuta</Label>
                  <Textarea
                    id={`${key}-desc-permuta`}
                    value={servico?.descricao_permuta || ""}
                    onChange={(e) =>
                      updateServico(key, { descricao_permuta: e.target.value })
                    }
                    placeholder="Descreva o que será permutado (ex: Banner 3x3m no evento)"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </>
            ) : servico?.modo_pagamento === 'permuta' ? (
              <>
                {/* Modo permuta puro - valor total editável */}
                <div>
                  <Label htmlFor={`${key}-valor`} className="text-sm">Valor Total (R$)</Label>
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

                <div>
                  <Label htmlFor={`${key}-valor-permuta`} className="text-sm">Valor da Permuta (R$)</Label>
                  <Input
                    id={`${key}-valor-permuta`}
                    type="number"
                    value={servico?.valor_permuta || ""}
                    onChange={(e) =>
                      updateServico(key, { valor_permuta: Number(e.target.value) })
                    }
                    placeholder="0,00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`${key}-desc-permuta`} className="text-sm">Descrição da Permuta</Label>
                  <Textarea
                    id={`${key}-desc-permuta`}
                    value={servico?.descricao_permuta || ""}
                    onChange={(e) =>
                      updateServico(key, { descricao_permuta: e.target.value })
                    }
                    placeholder="Descreva o que será permutado (ex: Banner 3x3m no evento)"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              /* Modo dinheiro - valor total editável */
              <div>
                <Label htmlFor={`${key}-valor`} className="text-sm">Valor Total (R$)</Label>
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
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Data da Contratação</Label>
                <DatePickerButton
                  value={servico?.data_contratacao}
                  onChange={(val) => updateServico(key, { data_contratacao: val })}
                />
              </div>

              <div>
                <Label className="text-sm">Data de Entrega</Label>
                <DatePickerButton
                  value={servico?.data_entrega}
                  onChange={(val) => updateServico(key, { data_entrega: val })}
                />
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
              <DatePickerButton
                value={servico?.pagamento_confirmado ? servico?.data_pagamento : servico?.data_prevista_pagamento}
                onChange={(val) => updateServico(
                  key,
                  servico?.pagamento_confirmado ? { data_pagamento: val } : { data_prevista_pagamento: val }
                )}
              />
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
