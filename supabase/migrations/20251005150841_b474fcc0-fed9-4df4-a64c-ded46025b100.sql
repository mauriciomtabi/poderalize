-- Adicionar campo CNPJ na tabela leads
ALTER TABLE public.leads
ADD COLUMN cnpj text;

-- Adicionar campo CNPJ na tabela clientes
ALTER TABLE public.clientes
ADD COLUMN cnpj text;