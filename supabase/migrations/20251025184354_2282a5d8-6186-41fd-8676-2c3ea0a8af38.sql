-- Adicionar campos JSONB para serviços recorrentes e únicos na tabela clientes
ALTER TABLE public.clientes
ADD COLUMN servicos_recorrentes jsonb DEFAULT '{}'::jsonb,
ADD COLUMN servicos_unicos jsonb DEFAULT '{}'::jsonb;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.clientes.servicos_recorrentes IS 'Configuração de serviços recorrentes do cliente (social media, tráfego pago, treinamento, google ads, assinatura)';
COMMENT ON COLUMN public.clientes.servicos_unicos IS 'Serviços de projeto único sem recorrência (criação de site, identidade visual, plataforma de vendas, outros)';