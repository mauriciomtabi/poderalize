import { Cliente } from "@/hooks/useClientes";
import { Card } from "@/components/ui/card";
import { ArrowLeftRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PermutasSectionProps {
  clientes: Cliente[];
  formatCurrency: (value: number) => string;
  selectedYear: string;
  selectedMonth: string;
}

export const PermutasSection = ({
  clientes,
  formatCurrency,
  selectedYear,
  selectedMonth,
}: PermutasSectionProps) => {
  interface PermutaItem {
    clienteNome: string;
    servicoNome: string;
    valorPermuta: number;
    descricaoPermuta: string;
    dataPagamento?: string;
  }

  const permutas: PermutaItem[] = [];
  let totalPermuta = 0;
  let totalGeral = 0;

  clientes.forEach((cliente) => {
    // Serviços Únicos
    if (cliente.servicos_unicos) {
      Object.entries(cliente.servicos_unicos).forEach(([key, servico]) => {
        if (servico?.selecionado && servico.pagamento_confirmado && servico.data_pagamento) {
          const [year, month] = servico.data_pagamento.split('-');
          
          if (year === selectedYear && month === selectedMonth) {
            const modo = servico.modo_pagamento || 'dinheiro';
            const valorTotal = servico.valor || 0;
            totalGeral += valorTotal;

            if (modo === 'permuta' || modo === 'dinheiro_permuta') {
              const valorPermuta = servico.valor_permuta || 0;
              totalPermuta += valorPermuta;

              permutas.push({
                clienteNome: cliente.nome,
                servicoNome: key === 'criacao_site' ? 'Criação de Site' : 
                            key === 'identidade_visual' ? 'Identidade Visual' :
                            key === 'plataforma_vendas' ? 'Plataforma de Vendas' :
                            servico.descricao || 'Outros',
                valorPermuta,
                descricaoPermuta: servico.descricao_permuta || 'Não especificado',
                dataPagamento: servico.data_pagamento,
              });
            }
          }
        }
      });
    }
  });

  const percentualPermuta = totalGeral > 0 ? (totalPermuta / totalGeral) * 100 : 0;

  if (permutas.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">Permutas do Período</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total em Permuta</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPermuta)}</p>
            </div>
            <ArrowLeftRight className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Quantidade</p>
              <p className="text-2xl font-bold">{permutas.length}</p>
              <p className="text-xs text-muted-foreground">
                {permutas.length === 1 ? 'transação' : 'transações'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">% das Receitas</p>
              <p className="text-2xl font-bold">{percentualPermuta.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">do total do período</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">Detalhes das Permutas</h4>
        <div className="space-y-3">
          {permutas.map((permuta, idx) => (
            <div key={idx} className="border-l-4 border-yellow-400 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{permuta.clienteNome}</span>
                    <Badge variant="secondary" className="text-xs">
                      {permuta.servicoNome}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {permuta.descricaoPermuta}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-600">
                    {formatCurrency(permuta.valorPermuta)}
                  </p>
                  {permuta.dataPagamento && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(permuta.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
