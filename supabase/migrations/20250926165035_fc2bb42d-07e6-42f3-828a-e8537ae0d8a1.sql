-- Create collaborators table
CREATE TABLE public.colaboradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  funcao TEXT NOT NULL,
  telefone TEXT,
  departamento TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  data_contratacao DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_email_per_user UNIQUE (user_id, email),
  CONSTRAINT valid_status CHECK (status IN ('ativo', 'inativo', 'afastado')),
  CONSTRAINT valid_departamento CHECK (departamento IS NULL OR departamento IN ('RH', 'TI', 'Vendas', 'Marketing', 'Financeiro', 'Operações'))
);

-- Enable Row Level Security
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own colaboradores" 
ON public.colaboradores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own colaboradores" 
ON public.colaboradores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own colaboradores" 
ON public.colaboradores 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own colaboradores" 
ON public.colaboradores 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_colaboradores_updated_at
BEFORE UPDATE ON public.colaboradores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();