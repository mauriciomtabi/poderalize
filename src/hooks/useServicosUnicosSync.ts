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

        // Caso 1: Serviço foi desmarcado e tinha receita
        if (!servico.selecionado && servicoAntigo?.receita_id) {
          const { error } = await supabase
            .from('receitas')
            .delete()
            .eq('id', servicoAntigo.receita_id);

          if (error) {
            console.error('Erro ao deletar receita:', error);
            toast.error(`Erro ao remover receita de ${servicoNome}`);
          }
          continue;
        }

        // Caso 2: Serviço está marcado e pagamento confirmado
        if (servico.selecionado && servico.pagamento_confirmado) {
          const descricaoReceita = key === 'outros' && servico.descricao
            ? `${clienteNome} - ${servico.descricao}`
            : `${clienteNome} - ${servicoNome}`;

          const receitaData = {
            user_id: userId,
            categoria: `Serviços Únicos - ${servicoNome}`,
            descricao: descricaoReceita,
            valor: servico.valor || 0,
            data: servico.data_pagamento || new Date().toISOString().split('T')[0],
            observacoes: `Serviço único vinculado ao cliente ${clienteNome}`,
          };

          // Se já existe receita, atualizar
          if (servico.receita_id) {
            const { error } = await supabase
              .from('receitas')
              .update(receitaData)
              .eq('id', servico.receita_id);

            if (error) {
              console.error('Erro ao atualizar receita:', error);
              toast.error(`Erro ao atualizar receita de ${servicoNome}`);
            }
          } 
          // Se não existe, criar nova receita
          else {
            const { data, error } = await supabase
              .from('receitas')
              .insert([receitaData])
              .select()
              .single();

            if (error) {
              console.error('Erro ao criar receita:', error);
              toast.error(`Erro ao criar receita de ${servicoNome}`);
            } else if (data) {
              // Armazenar receita_id no serviço
              servicosAtualizados[key] = {
                ...servico,
                receita_id: data.id,
              };
            }
          }
        }
        // Caso 3: Pagamento foi desmarcado mas serviço continua selecionado
        else if (servico.selecionado && !servico.pagamento_confirmado && servicoAntigo?.receita_id) {
          const { error } = await supabase
            .from('receitas')
            .delete()
            .eq('id', servicoAntigo.receita_id);

          if (error) {
            console.error('Erro ao deletar receita:', error);
            toast.error(`Erro ao remover receita de ${servicoNome}`);
          } else {
            // Remover receita_id do serviço
            if (servicosAtualizados[key]) {
              delete servicosAtualizados[key]!.receita_id;
            }
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
