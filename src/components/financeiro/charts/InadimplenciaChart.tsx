import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from "recharts";
import { AlertTriangle } from "lucide-react";
import { Cliente } from "@/hooks/useClientes";

interface InadimplenciaChartProps {
  clientes: Cliente[];
  getPagamentoByPeriodo: (clienteId: string, ano: number, mes: number) => any;
  calculateRecurrentPaymentBreakdown: (cliente: Cliente) => {
    dinheiro: number;
    permuta: number;
    modo: 'dinheiro' | 'permuta' | 'dinheiro_permuta' | null;
  };
  selectedYear: string;
  selectedMonth: string;
  getPaymentStatus: (cliente: Cliente) => 'pago' | 'no_prazo' | 'atrasado';
}

export const InadimplenciaChart = ({
  clientes,
  getPagamentoByPeriodo,
  calculateRecurrentPaymentBreakdown,
  selectedYear,
  selectedMonth,
  getPaymentStatus
}: InadimplenciaChartProps) => {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar valores para 'k' notation
  const formatToK = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return formatCurrency(value);
  };

  // Helper para obter nome do serviço
  const getServicoNome = (key: string): string => {
    const nomes: Record<string, string> = {
      'manutencao_redes': 'Manutenção de Redes',
      'design_grafico': 'Design Gráfico',
      'trafego_pago': 'Tráfego Pago',
      'desenvolvimento_web': 'Desenvolvimento Web',
      'consultoria': 'Consultoria',
      'fotografia': 'Fotografia',
      'video': 'Vídeo',
      'copywriting': 'Copywriting',
      'outro': 'Outro'
    };
    return nomes[key] || key;
  };

  // Calcular inadimplentes
  const chartData = (() => {
    // Só processar se houver mês específico selecionado
    if (selectedMonth === 'all') {
      return [];
    }

    const ano = parseInt(selectedYear);
    const mes = parseInt(selectedMonth);

    // 1. Clientes recorrentes inadimplentes
    const clientesRecorrentes = clientes
      .filter(cliente => {
        if (!cliente.pagamento_mensal) return false;
        const status = getPaymentStatus(cliente);
        return status === 'atrasado';
      })
      .map(cliente => {
        const breakdown = calculateRecurrentPaymentBreakdown(cliente);
        const valorTotal = breakdown.dinheiro + breakdown.permuta;
        
        return {
          nome: cliente.nome || cliente.empresa || 'Cliente sem nome',
          valor: valorTotal,
          dinheiro: breakdown.dinheiro,
          permuta: breakdown.permuta
        };
      })
      .filter(item => item.valor > 0);

    // 2. Serviços únicos atrasados
    const servicosAtrasados: Array<{nome: string; valor: number; dinheiro: number; permuta: number}> = [];
    
    clientes.forEach(cliente => {
      if (!cliente.servicos_unicos) return;
      
      Object.entries(cliente.servicos_unicos).forEach(([key, servico]: [string, any]) => {
        if (!servico || typeof servico !== 'object') return;
        if (!servico.selecionado) return;
        
        // Usar data_prevista_pagamento ou data_pagamento
        const dataPagamento = servico.data_prevista_pagamento || servico.data_pagamento;
        if (!dataPagamento) return;
        
        const dataServico = new Date(dataPagamento + 'T12:00:00');
        const anoServico = dataServico.getFullYear();
        const mesServico = dataServico.getMonth() + 1;
        
        // Verificar se é do período selecionado
        if (anoServico !== ano || mesServico !== mes) return;
        
        // Verificar se já foi pago
        if (servico.pagamento_confirmado === true) return;
        
        // Verificar se está atrasado (data já passou)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataServico.setHours(0, 0, 0, 0);
        
        if (dataServico >= hoje) return; // Ainda não venceu
        
        // Calcular valores
        const modoPagamento = servico.modo_pagamento || 'dinheiro';
        let valorDinheiro = 0;
        let valorPermuta = 0;
        
        if (modoPagamento === 'dinheiro') {
          valorDinheiro = servico.valor || 0;
        } else if (modoPagamento === 'permuta') {
          valorPermuta = servico.valor_permuta || servico.valor || 0;
        } else if (modoPagamento === 'dinheiro_permuta') {
          valorDinheiro = servico.valor_dinheiro || 0;
          valorPermuta = servico.valor_permuta || 0;
        }
        
        const valorTotal = valorDinheiro + valorPermuta;
        if (valorTotal <= 0) return;
        
        servicosAtrasados.push({
          nome: `${cliente.nome || cliente.empresa || 'Cliente'} - ${getServicoNome(key)}`,
          valor: valorTotal,
          dinheiro: valorDinheiro,
          permuta: valorPermuta
        });
      });
    });

    // Combinar e ordenar
    return [...clientesRecorrentes, ...servicosAtrasados]
      .sort((a, b) => b.valor - a.valor);
  })();

  // Cores gradientes do vermelho
  const getBarColor = (index: number, total: number) => {
    const intensity = 1 - (index / total) * 0.4; // Vai de 1.0 a 0.6
    return `rgba(239, 68, 68, ${intensity})`; // red-500 com diferentes opacidades
  };

  if (selectedMonth === 'all') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Controle de Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Selecione um mês específico para visualizar os clientes inadimplentes
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Controle de Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <p className="font-medium text-green-600 dark:text-green-500">
                Nenhum cliente inadimplente no período selecionado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalInadimplente = chartData.reduce((sum, item) => sum + item.valor, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Controle de Inadimplência
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            Total: <span className="font-bold text-red-600">{formatCurrency(totalInadimplente)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData}
            margin={{ top: 30, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="nome" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: 'currentColor' }}
              className="text-xs"
            />
            <YAxis 
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatToK}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="valor" 
              name="Valor em Atraso"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(index, chartData.length)}
                />
              ))}
              <LabelList 
                dataKey="valor" 
                position="top"
                formatter={(value: number) => formatCurrency(value)}
                style={{ 
                  fill: 'hsl(var(--foreground))',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
