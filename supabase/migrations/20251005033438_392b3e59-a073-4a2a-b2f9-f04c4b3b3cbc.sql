
-- Primeiro, vamos atualizar o perfil do usuário Maurício Maciel com o email correto
-- e criar a role de admin para ele
DO $$
DECLARE
  v_user_id uuid := '1a7cbda3-2fef-4fa4-a6e7-4f207f372372';
BEGIN
  -- Atualizar o email no profile (pegando do auth.users)
  UPDATE public.profiles
  SET email = (
    SELECT email FROM auth.users WHERE id = v_user_id
  )
  WHERE user_id = v_user_id AND email IS NULL;

  -- Criar role de admin se o email for mtabi.adm@gmail.com
  INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
  SELECT 
    v_user_id,
    'admin',
    v_user_id,
    now()
  WHERE EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = v_user_id 
    AND lower(email) = 'mtabi.adm@gmail.com'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = v_user_id
  );
END $$;

-- Agora vamos corrigir a função handle_new_user para garantir que sempre insira o email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role := 'pending';
BEGIN
  -- Promover automaticamente estes e-mails para admin
  IF lower(NEW.email) IN ('mtabi.adm@gmail.com', 'grace.tj.cardoso@gmail.com') THEN
    v_role := 'admin';
  END IF;

  -- Inserir profile com email
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), 
    NEW.email
  );
  
  -- Inserir role
  INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
  VALUES (NEW.id, v_role, NEW.id, now());

  RETURN NEW;
END;
$$;
