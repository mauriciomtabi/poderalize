-- Restaurar role de admin para Maurício Maciel
INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
SELECT 
  '1a7cbda3-2fef-4fa4-a6e7-4f207f372372'::uuid,
  'admin'::user_role,
  '1a7cbda3-2fef-4fa4-a6e7-4f207f372372'::uuid,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '1a7cbda3-2fef-4fa4-a6e7-4f207f372372' 
  AND role = 'admin'
);

COMMENT ON TABLE public.user_roles IS 'Armazena roles de usuários com proteção contra remoção acidental de admins';
