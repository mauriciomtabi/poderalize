-- Habilitar realtime para a tabela colaboradores
ALTER TABLE public.colaboradores REPLICA IDENTITY FULL;

-- Adicionar tabela ao realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.colaboradores;

-- Habilitar realtime para user_roles (para quando usuários são promovidos/removidos)
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;

-- Habilitar realtime para profiles
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;