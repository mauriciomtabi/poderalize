-- Adicionar campos de status e motivo de inativação na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
ADD COLUMN IF NOT EXISTS motivo_inativo text,
ADD COLUMN IF NOT EXISTS data_inativacao timestamp with time zone;