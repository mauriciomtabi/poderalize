-- Create planos table
CREATE TABLE IF NOT EXISTS public.planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Identificação
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  
  -- Configurações específicas do plano (JSONB)
  configuracoes JSONB DEFAULT '{}'::jsonb,
  
  -- Valores padrão
  valor_sugerido DECIMAL(10,2),
  modo_pagamento_padrao VARCHAR(50) DEFAULT 'dinheiro',
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planos_user_id ON public.planos(user_id);
CREATE INDEX IF NOT EXISTS idx_planos_tipo ON public.planos(tipo);
CREATE INDEX IF NOT EXISTS idx_planos_ativo ON public.planos(ativo);

-- Enable RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own planos"
  ON public.planos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planos"
  ON public.planos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planos"
  ON public.planos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planos"
  ON public.planos FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_planos_updated_at
  BEFORE UPDATE ON public.planos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();