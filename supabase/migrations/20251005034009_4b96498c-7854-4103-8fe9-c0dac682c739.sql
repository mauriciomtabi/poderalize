DO $$
DECLARE
  v_admin uuid;
BEGIN
  -- Obter o id do admin pelo email
  SELECT id INTO v_admin FROM auth.users WHERE lower(email) = 'mtabi.adm@gmail.com';

  -- Garantir perfil do admin
  INSERT INTO public.profiles (user_id, full_name, email)
  SELECT v_admin,
         COALESCE((SELECT raw_user_meta_data ->> 'full_name' FROM auth.users WHERE id = v_admin), (SELECT email FROM auth.users WHERE id = v_admin)),
         (SELECT email FROM auth.users WHERE id = v_admin)
  WHERE v_admin IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_admin);

  -- Garantir role admin do admin
  INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
  SELECT v_admin, 'admin', v_admin, now()
  WHERE v_admin IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_admin);

  -- Corrigir colaboradores que foram inseridos com user_id do admin
  UPDATE public.colaboradores c
  SET user_id = p.user_id
  FROM public.profiles p
  WHERE c.email = p.email
    AND p.user_id IS NOT NULL
    AND c.user_id <> p.user_id;
END $$;