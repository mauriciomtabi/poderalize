-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lead_id uuid,
  nome text NOT NULL,
  empresa text NOT NULL,
  email text NOT NULL,
  telefone text,
  valor_fechamento numeric DEFAULT 0,
  data_fechamento date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  
  -- Presença Digital
  site text,
  instagram text,
  facebook text,
  outras_redes_sociais text,
  
  -- Faturamento
  faturamento_atual numeric,
  faturamento_desejado numeric,
  
  -- Dados do lead original
  fonte_original text,
  vendedor_id uuid,
  vendedor_nome text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own clientes" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clientes" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clientes" 
ON public.clientes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();