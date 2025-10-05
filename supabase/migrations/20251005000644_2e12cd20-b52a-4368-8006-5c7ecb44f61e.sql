-- Add behavior and potential fields to clientes table
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS nivel_consciencia TEXT,
ADD COLUMN IF NOT EXISTS etapa_jornada TEXT,
ADD COLUMN IF NOT EXISTS indicador_potencial TEXT,
ADD COLUMN IF NOT EXISTS equipe_atual TEXT,
ADD COLUMN IF NOT EXISTS observacoes_comportamento TEXT;