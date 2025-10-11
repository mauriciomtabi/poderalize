-- Create receitas table
CREATE TABLE IF NOT EXISTS public.receitas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL CHECK (valor >= 0),
  categoria text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create pagamentos_clientes table
CREATE TABLE IF NOT EXISTS public.pagamentos_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  ano integer NOT NULL CHECK (ano >= 2000 AND ano <= 2100),
  mes integer NOT NULL CHECK (mes >= 1 AND mes <= 12),
  valor_pago numeric NOT NULL CHECK (valor_pago >= 0),
  data_pagamento date NOT NULL,
  status text NOT NULL DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'atrasado')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, ano, mes)
);

-- Indexes for receitas
CREATE INDEX receitas_user_id_idx ON public.receitas(user_id);
CREATE INDEX receitas_data_idx ON public.receitas(data);

-- Indexes for pagamentos_clientes
CREATE INDEX pagamentos_clientes_user_id_idx ON public.pagamentos_clientes(user_id);
CREATE INDEX pagamentos_clientes_cliente_id_idx ON public.pagamentos_clientes(cliente_id);
CREATE INDEX pagamentos_clientes_ano_mes_idx ON public.pagamentos_clientes(ano, mes);

-- Enable RLS for receitas
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own receitas"
  ON public.receitas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receitas"
  ON public.receitas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receitas"
  ON public.receitas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receitas"
  ON public.receitas FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS for pagamentos_clientes
ALTER TABLE public.pagamentos_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pagamentos_clientes"
  ON public.pagamentos_clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pagamentos_clientes"
  ON public.pagamentos_clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pagamentos_clientes"
  ON public.pagamentos_clientes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pagamentos_clientes"
  ON public.pagamentos_clientes FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_receitas_updated_at
  BEFORE UPDATE ON public.receitas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_clientes_updated_at
  BEFORE UPDATE ON public.pagamentos_clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();