-- 1) Corrigir políticas RLS recursivas em public.user_roles usando função SECURITY DEFINER
-- Obs: A função public.has_role(_user_id uuid, _role user_role) já existe no projeto

-- Garantir RLS habilitado
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas que causam recursão
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Políticas novas, seguras, usando public.has_role (SECURITY DEFINER)
-- Usuários podem ver seus próprios papéis
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins podem ver tudo
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- Admins podem inserir papéis
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

-- Admins podem atualizar papéis
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- Admins podem deletar papéis
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- 2) Garantir o papel ADMIN para o usuário mtabi.adm@gmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'mtabi.adm@gmail.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found in auth.users', 'mtabi.adm@gmail.com';
  ELSE
    -- Remover papel pending (opcional)
    DELETE FROM public.user_roles 
    WHERE user_id = v_user_id AND role = 'pending'::user_role;

    -- Inserir admin se não existir
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = v_user_id AND role = 'admin'::user_role
    ) THEN
      INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
      VALUES (v_user_id, 'admin'::user_role, v_user_id, now());
    END IF;
  END IF;
END $$;