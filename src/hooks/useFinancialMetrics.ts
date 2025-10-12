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
  filterDataByPeriod,
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
    // Filtrar dados pelo período selecionado
    const filteredReceitas = year || month ? filterDataByPeriod(receitas, 'data', year, month) : receitas;
    const filteredDespesas = year || month ? filterDataByPeriod(despesas, 'data', year, month) : despesas;
    const filteredPagamentos = year || month 
      ? pagamentos.filter(p => {
          if (month && month !== 'all') {
            return p.ano === parseInt(year || new Date().getFullYear().toString()) && p.mes === parseInt(month);
          }
          if (year) {
            return p.ano === parseInt(year);
          }
          return true;
        })
      : pagamentos;
    const filteredPagamentosSalarios = year || month
      ? pagamentosSalarios.filter(p => {
          if (month && month !== 'all') {
            return p.ano === parseInt(year || new Date().getFullYear().toString()) && p.mes === parseInt(month);
          }
          if (year) {
            return p.ano === parseInt(year);
          }
          return true;
        })
      : pagamentosSalarios;

    // Histórico de receitas com filtros
    const historicoReceitas = aggregateByMonth(
      [...filteredReceitas, ...filteredPagamentos.map(p => ({ data: `${p.ano}-${String(p.mes).padStart(2, '0')}-01`, valor: p.valor_pago }))],
      'data',
      'valor',
      year,
      month
    );

    // Histórico de despesas com filtros
    const historicoDespesas = aggregateByMonth(
      [...filteredDespesas, ...filteredPagamentosSalarios.map(p => ({ data: `${p.ano}-${String(p.mes).padStart(2, '0')}-01`, valor: p.valor_pago }))],
      'data',
      'valor',
      year,
      month
    );

    // Totais do período
    const totalReceitas = historicoReceitas.reduce((sum, item) => sum + item.valor, 0);
    const totalDespesas = historicoDespesas.reduce((sum, item) => sum + item.valor, 0);
    const saldo = totalReceitas - totalDespesas;

    // Receitas mês anterior (para MoM)
    const receitasMesAnterior = historicoReceitas[historicoReceitas.length - 2]?.valor || 0;

    // Fluxo de caixa acumulado
    const fluxoCaixaAcumulado = calculateCumulativeCashFlow(historicoReceitas, historicoDespesas);

    // Distribuição de despesas por categoria (filtrado)
    const despesasPorCategoria = aggregateByCategory(filteredDespesas, 'categoria', 'valor');
    
    // Adicionar salários como categoria (filtrado)
    const totalSalarios = filteredPagamentosSalarios.reduce((sum, p) => sum + p.valor_pago, 0);
    if (totalSalarios > 0) {
      despesasPorCategoria.push({
        categoria: 'Salários',
        valor: totalSalarios,
        cor: 'hsl(142, 76%, 36%)',
      });
    }

    // Distribuição de receitas por fonte (filtrado)
    const totalReceitasClientes = filteredPagamentos.reduce((sum, p) => sum + p.valor_pago, 0);
    const totalReceitasManuais = filteredReceitas.reduce((sum, r) => sum + r.valor, 0);
    
    const receitasPorFonte: SourceData[] = [
      { fonte: 'Clientes', valor: totalReceitasClientes },
      { fonte: 'Outras Receitas', valor: totalReceitasManuais },
    ].filter(item => item.valor > 0);

    // KPIs (calculados com dados filtrados)
    const clientesAtivos = clientes.filter(c => c.pagamento_mensal).length;
    const ticketMedio = filteredPagamentos.length > 0 
      ? totalReceitasClientes / filteredPagamentos.length 
      : clientesAtivos > 0 
        ? totalReceitasClientes / clientesAtivos 
        : 0;

    const clientesComAtraso = filteredPagamentos.filter(p => {
      if (!p.data_pagamento) return false;
      const dataVencimento = new Date(p.ano, p.mes - 1, 5);
      const dataPagamento = new Date(p.data_pagamento);
      return dataPagamento > dataVencimento;
    }).length;
    const taxaInadimplencia = filteredPagamentos.length > 0 
      ? (clientesComAtraso / filteredPagamentos.length) * 100 
      : 0;

    const margemOperacional = totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0;

    const burnRate = totalDespesas / (historicoReceitas.length || 1);

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
