import { useMemo } from "react";
import { useClientes } from "./useClientes";
import { useColaboradores } from "./useColaboradores";
import { useDespesas } from "./useDespesas";
import { useReceitas } from "./useReceitas";
import { usePagamentosClientes } from "./usePagamentosClientes";
import { usePagamentosSalarios } from "./usePagamentosSalarios";
import {
  aggregateByMonth,
  calculateCumulativeCashFlow,
  aggregateByCategory,
  calculateMoMGrowth,
  calculateTrend,
  projectFutureValue,
  MonthlyData,
  CategoryData,
  SourceData,
} from "@/utils/financialCalculations";

export interface FinancialMetrics {
  // Totais básicos
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;

  // KPIs avançados
  ticketMedio: number;
  taxaInadimplencia: number;
  margemOperacional: number;
  burnRate: number;
  crescimentoMoM: number;

  // Séries temporais
  historicoReceitas: MonthlyData[];
  historicoDespesas: MonthlyData[];
  fluxoCaixaAcumulado: MonthlyData[];

  // Distribuições
  despesasPorCategoria: CategoryData[];
  receitasPorFonte: SourceData[];

  // Projeções
  previsaoCaixa30d: number;
  previsaoCaixa60d: number;
  previsaoCaixa90d: number;

  // Tendências
  tendenciaReceitas: 'crescente' | 'decrescente' | 'estavel';
  tendenciaDespesas: 'crescente' | 'decrescente' | 'estavel';
}

export const useFinancialMetrics = (year?: string, month?: string): FinancialMetrics => {
  const { clientes } = useClientes();
  const { colaboradores } = useColaboradores();
  const { despesas } = useDespesas();
  const { receitas } = useReceitas();
  const { pagamentos } = usePagamentosClientes();
  const { pagamentosSalarios } = usePagamentosSalarios();

  return useMemo(() => {
    // Histórico de receitas (últimos 12 meses)
    const historicoReceitas = aggregateByMonth(
      [...receitas, ...pagamentos.map(p => ({ data: `${p.ano}-${p.mes}-01`, valor: p.valor_pago }))],
      'data',
      'valor',
      12
    );

    // Histórico de despesas (últimos 12 meses)
    const historicoDespesas = aggregateByMonth(
      [...despesas, ...pagamentosSalarios.map(p => ({ data: `${p.ano}-${p.mes}-01`, valor: p.valor_pago }))],
      'data',
      'valor',
      12
    );

    // Totais
    const totalReceitas = historicoReceitas[historicoReceitas.length - 1]?.valor || 0;
    const totalDespesas = historicoDespesas[historicoDespesas.length - 1]?.valor || 0;
    const saldo = totalReceitas - totalDespesas;

    // Receitas mês anterior
    const receitasMesAnterior = historicoReceitas[historicoReceitas.length - 2]?.valor || 0;

    // Fluxo de caixa acumulado
    const fluxoCaixaAcumulado = calculateCumulativeCashFlow(historicoReceitas, historicoDespesas);

    // Distribuição de despesas por categoria
    const despesasPorCategoria = aggregateByCategory(despesas, 'categoria', 'valor');
    
    // Adicionar salários como categoria
    const totalSalarios = pagamentosSalarios.reduce((sum, p) => sum + p.valor_pago, 0);
    if (totalSalarios > 0) {
      despesasPorCategoria.push({
        categoria: 'Salários',
        valor: totalSalarios,
        cor: 'hsl(var(--chart-1))',
      });
    }

    // Distribuição de receitas por fonte
    const totalReceitasClientes = pagamentos.reduce((sum, p) => sum + p.valor_pago, 0);
    const totalReceitasManuais = receitas.reduce((sum, r) => sum + r.valor, 0);
    
    const receitasPorFonte: SourceData[] = [
      { fonte: 'Clientes', valor: totalReceitasClientes },
      { fonte: 'Outras Receitas', valor: totalReceitasManuais },
    ].filter(item => item.valor > 0);

    // KPIs
    const clientesAtivos = clientes.filter(c => c.pagamento_mensal).length;
    const ticketMedio = clientesAtivos > 0 ? totalReceitasClientes / clientesAtivos : 0;

    const clientesComAtraso = pagamentos.filter(p => {
      const dataVencimento = new Date(p.ano, p.mes - 1, 5);
      const dataPagamento = new Date(p.data_pagamento);
      return dataPagamento > dataVencimento;
    }).length;
    const taxaInadimplencia = clientesAtivos > 0 ? (clientesComAtraso / clientesAtivos) * 100 : 0;

    const margemOperacional = totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0;

    const burnRate = totalDespesas;

    const crescimentoMoM = calculateMoMGrowth(totalReceitas, receitasMesAnterior);

    // Projeções
    const previsaoCaixa30d = projectFutureValue(historicoReceitas, 30) - projectFutureValue(historicoDespesas, 30);
    const previsaoCaixa60d = projectFutureValue(historicoReceitas, 60) - projectFutureValue(historicoDespesas, 60);
    const previsaoCaixa90d = projectFutureValue(historicoReceitas, 90) - projectFutureValue(historicoDespesas, 90);

    // Tendências
    const tendenciaReceitas = calculateTrend(historicoReceitas);
    const tendenciaDespesas = calculateTrend(historicoDespesas);

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      ticketMedio,
      taxaInadimplencia,
      margemOperacional,
      burnRate,
      crescimentoMoM,
      historicoReceitas,
      historicoDespesas,
      fluxoCaixaAcumulado,
      despesasPorCategoria,
      receitasPorFonte,
      previsaoCaixa30d,
      previsaoCaixa60d,
      previsaoCaixa90d,
      tendenciaReceitas,
      tendenciaDespesas,
    };
  }, [clientes, colaboradores, despesas, receitas, pagamentos, pagamentosSalarios, year, month]);
};
