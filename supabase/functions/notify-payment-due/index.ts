import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Cliente {
  id: string;
  user_id: string;
  nome: string;
  empresa: string;
  dia_pagamento: number;
  pagamento_mensal: boolean;
  valor_fechamento: number;
  servicos_recorrentes: any;
}

interface PagamentoCliente {
  cliente_id: string;
  ano: number;
  mes: number;
  status: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    console.log(`Checking for payment notifications on ${diaHoje}/${mesAtual}/${anoAtual}`);

    // Buscar todos os clientes ativos com pagamento mensal
    const { data: clientes, error: clientesError } = await supabaseClient
      .from('clientes')
      .select('id, user_id, nome, empresa, dia_pagamento, pagamento_mensal, valor_fechamento, servicos_recorrentes')
      .eq('status', 'ativo')
      .eq('pagamento_mensal', true);

    if (clientesError) {
      console.error('Error fetching clientes:', clientesError);
      throw clientesError;
    }

    if (!clientes || clientes.length === 0) {
      console.log('No active clients with monthly payment found');
      return new Response(
        JSON.stringify({ success: true, message: 'No clients to process', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Buscar todos os pagamentos do mês atual
    const { data: pagamentos, error: pagamentosError } = await supabaseClient
      .from('pagamentos_clientes')
      .select('cliente_id, ano, mes, status')
      .eq('ano', anoAtual)
      .eq('mes', mesAtual);

    if (pagamentosError) {
      console.error('Error fetching pagamentos:', pagamentosError);
      throw pagamentosError;
    }

    const pagamentosMap = new Map<string, PagamentoCliente>();
    (pagamentos || []).forEach(p => {
      pagamentosMap.set(p.cliente_id, p);
    });

    // Função para calcular valor do cliente
    const calcularValorCliente = (cliente: Cliente): number => {
      let total = 0;
      
      if (cliente.servicos_recorrentes) {
        const servicos = Object.values(cliente.servicos_recorrentes || {}) as any[];
        servicos.forEach(servico => {
          if (servico?.ativo) {
            const modo = servico.modo_pagamento;
            if (modo === 'dinheiro' || !modo) {
              total += servico.valor || 0;
            } else if (modo === 'permuta') {
              total += servico.valor_permuta || servico.valor || 0;
            } else if (modo === 'dinheiro_permuta') {
              total += (servico.valor_dinheiro || 0) + (servico.valor_permuta || 0);
            }
          }
        });
      }
      
      if (total === 0 && cliente.valor_fechamento) {
        total = cliente.valor_fechamento;
      }
      
      return total;
    };

    // Filtrar clientes cujo dia de pagamento é hoje e ainda não pagaram
    const clientesVencendoHoje = clientes.filter(cliente => {
      const diaPagamento = cliente.dia_pagamento || 5;
      
      // Verificar se é o dia de pagamento
      if (diaPagamento !== diaHoje) {
        return false;
      }

      // Verificar se já foi pago
      const pagamento = pagamentosMap.get(cliente.id);
      if (pagamento && pagamento.status === 'pago') {
        return false;
      }

      return true;
    });

    console.log(`Found ${clientesVencendoHoje.length} clients with payment due today`);

    if (clientesVencendoHoje.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No clients with due payments today', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Criar notificações para cada cliente
    const notificationsToCreate = clientesVencendoHoje.map(cliente => {
      const valor = calcularValorCliente(cliente);
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);

      return {
        user_id: cliente.user_id,
        type: 'payment_due',
        title: '💰 Pagamento Vencendo Hoje',
        description: `Pagamento de ${cliente.nome} (${cliente.empresa}) - ${valorFormatado}`,
        priority: 'high',
        link: '/financeiro',
        entity_type: 'cliente',
        entity_id: cliente.id,
        read: false
      };
    });

    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert(notificationsToCreate);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      throw notificationError;
    }

    console.log(`Successfully created ${notificationsToCreate.length} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${notificationsToCreate.length} payment due notifications`,
        count: notificationsToCreate.length,
        clients: clientesVencendoHoje.map(c => ({ nome: c.nome, empresa: c.empresa }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in notify-payment-due function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
