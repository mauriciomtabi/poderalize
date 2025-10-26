import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type TipoPlano = 
  | 'social_media'
  | 'trafego_pago'
  | 'treinamento_vendas'
  | 'google_ads'
  | 'assinatura_jornada'
  | 'criacao_site'
  | 'identidade_visual'
  | 'plataforma_vendas';

export interface ConfiguracaoPlano {
  qtde_feed?: number;
  qtde_reels?: number;
  stories_semanais?: number;
  qtde_campanhas?: number;
  [key: string]: any;
}

export interface Plano {
  id: string;
  user_id: string;
  nome: string;
  tipo: TipoPlano;
  descricao?: string;
  ativo: boolean;
  configuracoes: ConfiguracaoPlano;
  valor_sugerido?: number;
  modo_pagamento_padrao: 'dinheiro' | 'permuta' | 'dinheiro_permuta';
  created_at: string;
  updated_at: string;
}

export type CreatePlanoData = Omit<Plano, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdatePlanoData = Partial<CreatePlanoData>;

export function usePlanos() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const loadPlanos = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('user_id', user.id)
        .order('tipo', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setPlanos((data || []) as Plano[]);
    } catch (error: any) {
      toast.error('Erro ao carregar planos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPlanos();
  }, [loadPlanos]);

  const createPlano = async (data: CreatePlanoData): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: newPlano, error } = await supabase
        .from('planos')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Atualização otimista: adicionar ao estado imediatamente
      if (newPlano) {
        setPlanos(prevPlanos => [...prevPlanos, newPlano as Plano]);
      }
      
      toast.success('Plano criado com sucesso!');
      
      // Sincronizar com servidor em background
      loadPlanos();
      
      return true;
    } catch (error: any) {
      toast.error('Erro ao criar plano: ' + error.message);
      return false;
    }
  };

  const updatePlano = async (id: string, data: UpdatePlanoData): Promise<boolean> => {
    try {
      const { data: updatedPlano, error } = await supabase
        .from('planos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Atualização otimista: atualizar no estado imediatamente
      if (updatedPlano) {
        setPlanos(prevPlanos => 
          prevPlanos.map(p => p.id === id ? updatedPlano as Plano : p)
        );
      }
      
      toast.success('Plano atualizado com sucesso!');
      
      // Sincronizar com servidor em background
      loadPlanos();
      
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar plano: ' + error.message);
      return false;
    }
  };

  const deletePlano = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualização otimista: remover do estado imediatamente
      setPlanos(prevPlanos => prevPlanos.filter(p => p.id !== id));
      
      toast.success('Plano excluído com sucesso!');
      
      // Sincronizar com servidor em background
      loadPlanos();
      
      return true;
    } catch (error: any) {
      toast.error('Erro ao excluir plano: ' + error.message);
      return false;
    }
  };

  const getPlanosByTipo = (tipo: TipoPlano) => {
    return planos.filter(p => p.tipo === tipo && p.ativo);
  };

  return {
    planos,
    isLoading,
    createPlano,
    updatePlano,
    deletePlano,
    loadPlanos,
    getPlanosByTipo,
  };
}
