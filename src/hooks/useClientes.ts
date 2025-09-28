import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

// Cliente validation schema
const clienteSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  empresa: z.string().trim().min(1, "Empresa é obrigatória").max(100, "Empresa deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
  telefone: z.string().trim().optional(),
  valor_fechamento: z.number().min(0, "Valor deve ser positivo").optional(),
  data_fechamento: z.string().optional(),
  observacoes: z.string().trim().max(1000, "Observações devem ter no máximo 1000 caracteres").optional(),
  
  // Presença Digital
  site: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
  outras_redes_sociais: z.string().trim().optional(),
  
  // Faturamento
  faturamento_atual: z.number().min(0).optional(),
  faturamento_desejado: z.number().min(0).optional(),
  
  // Dados do lead original
  fonte_original: z.string().trim().optional(),
  vendedor_id: z.string().optional(),
  vendedor_nome: z.string().trim().optional(),
  lead_id: z.string().uuid().optional(),
});

export interface Cliente {
  id: string;
  user_id: string;
  lead_id?: string;
  nome: string;
  empresa: string;
  email: string;
  telefone?: string;
  valor_fechamento?: number;
  data_fechamento: string;
  observacoes?: string;
  
  // Presença Digital
  site?: string;
  instagram?: string;
  facebook?: string;
  outras_redes_sociais?: string;
  
  // Faturamento
  faturamento_atual?: number;
  faturamento_desejado?: number;
  
  // Dados do lead original
  fonte_original?: string;
  vendedor_id?: string;
  vendedor_nome?: string;
  
  created_at: string;
  updated_at: string;
}

export type CreateClienteData = Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateClienteData = Partial<CreateClienteData>;

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load clientes from Supabase
  const loadClientes = useCallback(async () => {
    if (!user) {
      setClientes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.error('Erro ao carregar clientes');
        return;
      }

      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add new cliente
  const addCliente = useCallback(async (clienteData: CreateClienteData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      // Validate input data
      const validatedData = clienteSchema.parse(clienteData);

      // Normalize data
      const normalizedData = {
        ...validatedData,
        user_id: user.id,
        valor_fechamento: clienteData.valor_fechamento || 0,
        data_fechamento: clienteData.data_fechamento || new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('clientes')
        .insert([normalizedData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar cliente:', error);
        toast.error(`Erro ao adicionar cliente: ${error.message}`);
        return null;
      }

      setClientes(prev => [data, ...prev]);
      toast.success('Cliente adicionado com sucesso!');
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`Dados inválidos: ${firstError.message}`);
      } else {
        console.error('Erro ao adicionar cliente:', error);
        toast.error('Erro ao adicionar cliente');
      }
      return null;
    }
  }, [user]);

  // Update cliente
  const updateCliente = useCallback(async (id: string, clienteData: UpdateClienteData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      // Filter out undefined and null
      const providedData = Object.fromEntries(
        Object.entries(clienteData).filter(([, value]) => value !== undefined && value !== null)
      );

      if (Object.keys(providedData).length === 0) {
        toast.error('Nenhum dado fornecido para atualização');
        return null;
      }

      // Validate the provided data
      const validatedData = clienteSchema.partial().parse(providedData);

      const { data, error } = await supabase
        .from('clientes')
        .update(validatedData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast.error(`Erro ao atualizar cliente: ${error.message}`);
        return null;
      }

      setClientes(prev => prev.map(cliente => cliente.id === id ? data : cliente));
      toast.success('Cliente atualizado com sucesso!');
      return data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`Dados inválidos: ${firstError.message}`);
      } else {
        console.error('Erro ao atualizar cliente:', error);
        toast.error('Erro ao atualizar cliente');
      }
      return null;
    }
  }, [user]);

  // Delete cliente
  const deleteCliente = useCallback(async (id: string) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao deletar cliente:', error);
        toast.error(`Erro ao deletar cliente: ${error.message}`);
        return false;
      }

      setClientes(prev => prev.filter(cliente => cliente.id !== id));
      toast.success('Cliente deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      toast.error('Erro ao deletar cliente');
      return false;
    }
  }, [user]);

  // Load clientes on mount and user change
  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return {
    clientes,
    isLoading,
    addCliente,
    updateCliente,
    deleteCliente,
    refreshClientes: loadClientes,
  };
}