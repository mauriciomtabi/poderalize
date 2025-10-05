-- Habilitar realtime para project_members 
ALTER TABLE public.project_members REPLICA IDENTITY FULL;

-- Adicionar project_members ao realtime (se não estiver já)
DO $$
BEGIN
  -- Tentar adicionar a tabela à publicação realtime
  -- Ignorar erro se já existir
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Ignorar se já estiver na publicação
  END;
END $$;