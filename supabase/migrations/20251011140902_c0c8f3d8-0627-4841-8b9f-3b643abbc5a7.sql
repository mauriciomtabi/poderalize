-- Adicionar coluna salario na tabela colaboradores
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS salario numeric DEFAULT 0;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.colaboradores.salario IS 'Salário mensal do colaborador em Reais';