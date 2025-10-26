import { useMemo } from "react";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Cliente {
  id: string;
  pagamento_mensal?: boolean;
  dia_pagamento?: number;
  valor_fechamento?: number;
  servicos_recorrentes?: any;
  servicos_unicos?: any;
}

interface PagamentoCliente {
  id: string;
  cliente_id: string;
  ano: number;
  mes: number;
  status: string;
}

interface ReceitaStatusData {
  mes: string;
  mesNumero: number;
  pago: number;
  noPrazo: number;
  atrasado: number;
  projecao: number;
}

export const useReceitasControl = (
  clientes: Cliente[],
  pagamentos: PagamentoCliente[],
  selectedYear: string,
  calculateRecurrentPaymentBreakdown: (cliente: Cliente) => { dinheiro: number; permuta: number; modo: string },
  paymentFilter: 'total' | 'dinheiro' | 'permuta' = 'total'
) => {
  return useMemo(() => {
    const meses: ReceitaStatusData[] = Array.from({ length: 12 }, (_, i) => ({
      mes: format(new Date(2024, i), 'MMM', { locale: ptBR }),
      mesNumero: i + 1,
      pago: 0,
      noPrazo: 0,
      atrasado: 0,
      projecao: 0,
    }));

    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const ano = parseInt(selectedYear);

    // Helper para buscar pagamento
    const getPagamentoByPeriodo = (clienteId: string, ano: number, mes: number) => {
      return pagamentos.find(
        p => p.cliente_id === clienteId && p.ano === ano && p.mes === mes
      );
    };

    // Processar clientes com pagamento recorrente
    clientes.forEach(cliente => {
      const hasActiveRecurring = Object.values(cliente.servicos_recorrentes || {}).some((s: any) => s?.ativo);
      const hasValorFechamento = (cliente.valor_fechamento || 0) > 0;
      
      // Se não tem nem serviços ativos nem valor de fechamento, pula
      if (!hasActiveRecurring && !hasValorFechamento) return;
      
      let valorTotal = 0;
      
      if (hasActiveRecurring) {
        // Usa breakdown detalhado dos serviços
        const breakdown = calculateRecurrentPaymentBreakdown(cliente);
        
        if (paymentFilter === 'total') {
          valorTotal = breakdown.dinheiro + breakdown.permuta;
        } else if (paymentFilter === 'dinheiro') {
          valorTotal = breakdown.dinheiro;
        } else if (paymentFilter === 'permuta') {
          valorTotal = breakdown.permuta;
        }
      } else if (hasValorFechamento) {
        // Cliente tem valor_fechamento mas sem serviços configurados
        // Assume que é dinheiro para manter compatibilidade
        if (paymentFilter === 'total' || paymentFilter === 'dinheiro') {
          valorTotal = cliente.valor_fechamento || 0;
        }
        // Se filtro for 'permuta', valorTotal fica 0 (ignora este cliente)
      }

      if (valorTotal === 0) return;

      meses.forEach(m => {
        const pagamento = getPagamentoByPeriodo(cliente.id, ano, m.mesNumero);
        const diaPagamento = cliente.dia_pagamento || 5;
        const dataVencimento = new Date(ano, m.mesNumero - 1, diaPagamento);
        const mesVenceu = m.mesNumero < mesAtual || 
          (m.mesNumero === mesAtual && isAfter(hoje, dataVencimento));

        if (pagamento?.status === 'pago') {
          m.pago += valorTotal;
        } else if (mesVenceu) {
          m.atrasado += valorTotal;
        } else if (m.mesNumero === mesAtual) {
          m.noPrazo += valorTotal;
        } else if (m.mesNumero > mesAtual) {
          m.projecao += valorTotal;
        }
      });
    });

    // Processar serviços únicos
    clientes.forEach(cliente => {
      const servicosUnicos = cliente.servicos_unicos || {};
      
      Object.values(servicosUnicos).forEach((servico: any) => {
        if (!servico?.selecionado) return;

        const dataPagamento = servico.data_prevista_pagamento || servico.data_pagamento;
        if (!dataPagamento) return;

        const dataServico = new Date(dataPagamento + 'T12:00:00');
        const mesServico = dataServico.getMonth() + 1;
        const anoServico = dataServico.getFullYear();

        if (anoServico !== ano) return;

        const mesData = meses.find(m => m.mesNumero === mesServico);
        if (!mesData) return;

        // Aplicar filtro de tipo de pagamento
        let valor = 0;
        const modoPagamento = servico.modo_pagamento || 'dinheiro';
        
        if (paymentFilter === 'total') {
          if (modoPagamento === 'dinheiro') {
            valor = servico.valor || 0;
          } else if (modoPagamento === 'permuta') {
            valor = servico.valor_permuta || servico.valor || 0;
          } else if (modoPagamento === 'dinheiro_permuta') {
            valor = (servico.valor_dinheiro || 0) + (servico.valor_permuta || 0);
          }
        } else if (paymentFilter === 'dinheiro') {
          if (modoPagamento === 'dinheiro') {
            valor = servico.valor || 0;
          } else if (modoPagamento === 'dinheiro_permuta') {
            valor = servico.valor_dinheiro || 0;
          }
        } else if (paymentFilter === 'permuta') {
          if (modoPagamento === 'permuta') {
            valor = servico.valor_permuta || servico.valor || 0;
          } else if (modoPagamento === 'dinheiro_permuta') {
            valor = servico.valor_permuta || 0;
          }
        }
        
        if (valor === 0) return;

        if (servico.pagamento_confirmado) {
          mesData.pago += valor;
        } else if (isAfter(hoje, dataServico)) {
          mesData.atrasado += valor;
        } else if (mesServico === mesAtual) {
          mesData.noPrazo += valor;
        } else if (mesServico > mesAtual) {
          mesData.projecao += valor;
        }
      });
    });

    return meses;
  }, [clientes, pagamentos, selectedYear, calculateRecurrentPaymentBreakdown, paymentFilter]);
};
