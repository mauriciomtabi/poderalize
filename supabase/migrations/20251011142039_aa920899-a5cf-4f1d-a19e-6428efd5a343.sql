-- Add monthly payment fields to clientes table
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS pagamento_mensal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dia_pagamento integer CHECK (dia_pagamento >= 1 AND dia_pagamento <= 31);

COMMENT ON COLUMN public.clientes.pagamento_mensal IS 'Se true, indica que o cliente paga mensalmente';
COMMENT ON COLUMN public.clientes.dia_pagamento IS 'Dia do mês em que o pagamento recorrente ocorre (1-31)';

-- Create despesas table
CREATE TABLE IF NOT EXISTS public.despesas (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS despesas_user_id_idx ON public.despesas(user_id);
CREATE INDEX IF NOT EXISTS despesas_data_idx ON public.despesas(data);

-- Enable RLS
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for despesas
CREATE POLICY "Users can view their own despesas"
  ON public.despesas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own despesas"
  ON public.despesas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own despesas"
  ON public.despesas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own despesas"
  ON public.despesas FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_despesas_updated_at
  BEFORE UPDATE ON public.despesas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();