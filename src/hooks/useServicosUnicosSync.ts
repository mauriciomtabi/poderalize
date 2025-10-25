import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServicoUnico, ServicoUnicoItem } from './useClientes';

interface SyncServicosUnicosParams {
  clienteId: string;
  clienteNome: string;
  userId: string;
  servicosUnicos: ServicoUnico;
  servicosUnicosAntigos?: ServicoUnico;
}

export const useServicosUnicosSync = () => {
  const getServicoNome = (key: string): string => {
    const nomes: Record<string, string> = {
      criacao_site: 'Criação de Site',
      identidade_visual: 'Identidade Visual',
      plataforma_vendas: 'Plataforma de Vendas Online',
      outros: 'Outros Serviços',
    };
    return nomes[key] || key;
  };

  const syncServicosUnicos = useCallback(async ({
    clienteId,
    clienteNome,
    userId,
    servicosUnicos,
    servicosUnicosAntigos,
  }: SyncServicosUnicosParams): Promise<ServicoUnico> => {
    const servicosAtualizados: ServicoUnico = { ...servicosUnicos };

    try {
      for (const [key, servico] of Object.entries(servicosUnicos) as [keyof ServicoUnico, ServicoUnicoItem][]) {
        if (!servico) continue;

        const servicoAntigo = servicosUnicosAntigos?.[key];
        const servicoNome = getServicoNome(key);
        const modoPagamento = servico.modo_pagamento || 'dinheiro';

        // Caso 1: Serviço foi desmarcado e tinha receita(s)
        if (!servico.selecionado) {
          // Deletar receita única
          if (servicoAntigo?.receita_id) {
            await supabase.from('receitas').delete().eq('id', servicoAntigo.receita_id);
          }
          // Deletar receitas múltiplas (modo misto)
          if (servicoAntigo?.receita_ids && Array.isArray(servicoAntigo.receita_ids)) {
            for (const receita_id of servicoAntigo.receita_ids) {
              await supabase.from('receitas').delete().eq('id', receita_id);
            }
          }
          continue;
        }

        // Caso 2: Serviço está marcado e pagamento confirmado
        if (servico.selecionado && servico.pagamento_confirmado) {
          const descricaoReceita = key === 'outros' && servico.descricao
            ? `${clienteNome} - ${servico.descricao}`
            : `${clienteNome} - ${servicoNome}`;

          // MODO DINHEIRO
          if (modoPagamento === 'dinheiro') {
            const receitaData = {
              user_id: userId,
              categoria: `Serviços Únicos - ${servicoNome}`,
              descricao: descricaoReceita,
              valor: servico.valor || 0,
              data: servico.data_pagamento || new Date().toISOString().split('T')[0],
              observacoes: `Serviço único vinculado ao cliente ${clienteNome}`,
            };

            if (servico.receita_id) {
              await supabase.from('receitas').update(receitaData).eq('id', servico.receita_id);
            } else {
              const { data, error } = await supabase.from('receitas').insert([receitaData]).select().single();
              if (!error && data) {
                servicosAtualizados[key] = { ...servico, receita_id: data.id };
              }
            }
          }

          // MODO PERMUTA
          else if (modoPagamento === 'permuta') {
            const receitaData = {
              user_id: userId,
              categoria: `Permuta - Serviços Únicos`,
              descricao: `${descricaoReceita} - PERMUTA: ${servico.descricao_permuta || ''}`,
              valor: servico.valor_permuta || 0,
              data: servico.data_pagamento || new Date().toISOString().split('T')[0],
              observacoes: `Permuta vinculada ao cliente ${clienteNome}`,
            };

            if (servico.receita_id) {
              await supabase.from('receitas').update(receitaData).eq('id', servico.receita_id);
            } else {
              const { data, error } = await supabase.from('receitas').insert([receitaData]).select().single();
              if (!error && data) {
                servicosAtualizados[key] = { ...servico, receita_id: data.id };
              }
            }
          }

          // MODO DINHEIRO + PERMUTA
          else if (modoPagamento === 'dinheiro_permuta') {
            const valorDinheiro = (servico.valor || 0) - (servico.valor_permuta || 0);
            
            // Criar ou atualizar receita de dinheiro
            const receitaDinheiroData = {
              user_id: userId,
              categoria: `Serviços Únicos - ${servicoNome}`,
              descricao: `${descricaoReceita} (Parte Dinheiro)`,
              valor: valorDinheiro,
              data: servico.data_pagamento || new Date().toISOString().split('T')[0],
              observacoes: `Parte em dinheiro - Cliente ${clienteNome}`,
            };

            // Criar ou atualizar receita de permuta
            const receitaPermutaData = {
              user_id: userId,
              categoria: `Permuta - Serviços Únicos`,
              descricao: `${descricaoReceita} - PERMUTA: ${servico.descricao_permuta || ''}`,
              valor: servico.valor_permuta || 0,
              data: servico.data_pagamento || new Date().toISOString().split('T')[0],
              observacoes: `Parte em permuta - Cliente ${clienteNome}`,
            };

            // Se já existem receitas, atualizar
            if (servico.receita_ids && Array.isArray(servico.receita_ids) && servico.receita_ids.length === 2) {
              await supabase.from('receitas').update(receitaDinheiroData).eq('id', servico.receita_ids[0]);
              await supabase.from('receitas').update(receitaPermutaData).eq('id', servico.receita_ids[1]);
            }
            // Se não, criar novas
            else {
              const { data: dinheiroData } = await supabase.from('receitas').insert([receitaDinheiroData]).select().single();
              const { data: permutaData } = await supabase.from('receitas').insert([receitaPermutaData]).select().single();
              
              if (dinheiroData && permutaData) {
                servicosAtualizados[key] = { 
                  ...servico, 
                  receita_ids: [dinheiroData.id, permutaData.id] 
                };
              }
            }
          }
        }
        // Caso 3: Pagamento foi desmarcado mas serviço continua selecionado
        else if (servico.selecionado && !servico.pagamento_confirmado) {
          if (servicoAntigo?.receita_id) {
            await supabase.from('receitas').delete().eq('id', servicoAntigo.receita_id);
            delete servicosAtualizados[key]!.receita_id;
          }
          if (servicoAntigo?.receita_ids && Array.isArray(servicoAntigo.receita_ids)) {
            for (const receita_id of servicoAntigo.receita_ids) {
              await supabase.from('receitas').delete().eq('id', receita_id);
            }
            delete servicosAtualizados[key]!.receita_ids;
          }
        }
      }

      return servicosAtualizados;
    } catch (error) {
      console.error('Erro na sincronização de serviços únicos:', error);
      toast.error('Erro ao sincronizar serviços únicos com receitas');
      return servicosUnicos;
    }
  }, []);

  return { syncServicosUnicos };
};
