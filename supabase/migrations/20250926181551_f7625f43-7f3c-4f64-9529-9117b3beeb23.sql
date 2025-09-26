-- Adicionar coluna email à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Atualizar a função handle_new_user para salvar o email também
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role := 'pending';
BEGIN
  -- Promover automaticamente este e-mail para admin
  IF lower(NEW.email) = 'mtabi.adm@gmail.com' THEN
    v_role := 'admin';
  END IF;

  -- Inserir profile com email
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  -- Inserir role
  INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
  VALUES (NEW.id, v_role, NEW.id, now());

  RETURN NEW;
END;
$$;