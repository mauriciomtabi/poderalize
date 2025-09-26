export interface Colaborador {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  funcao: string;
  telefone?: string | null;
  departamento?: string | null;
  status: string;
  data_contratacao?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ColaboradorFormData {
  nome: string;
  email: string;
  funcao: string;
  telefone?: string;
  departamento?: string;
  status?: string;
}

export const DEPARTAMENTOS_DISPONIVEIS = [
  'RH',
  'TI', 
  'Vendas',
  'Marketing',
  'Financeiro',
  'Operações'
] as const;

export const STATUS_DISPONIVEIS = [
  'ativo',
  'inativo',
  'afastado'
] as const;