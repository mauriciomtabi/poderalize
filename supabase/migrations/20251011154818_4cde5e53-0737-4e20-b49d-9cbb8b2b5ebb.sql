-- Create pagamentos_salarios table
CREATE TABLE public.pagamentos_salarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  valor_pago NUMERIC NOT NULL,
  data_pagamento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pago',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_colaborador_periodo UNIQUE (colaborador_id, ano, mes)
);

-- Enable RLS
ALTER TABLE public.pagamentos_salarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pagamentos_salarios"
ON public.pagamentos_salarios
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pagamentos_salarios"
ON public.pagamentos_salarios
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pagamentos_salarios"
ON public.pagamentos_salarios
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pagamentos_salarios"
ON public.pagamentos_salarios
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_pagamentos_salarios_colaborador ON public.pagamentos_salarios(colaborador_id);
CREATE INDEX idx_pagamentos_salarios_periodo ON public.pagamentos_salarios(ano, mes);

-- Create trigger to update updated_at
CREATE TRIGGER update_pagamentos_salarios_updated_at
BEFORE UPDATE ON public.pagamentos_salarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();