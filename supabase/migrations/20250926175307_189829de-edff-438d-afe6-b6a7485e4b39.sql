-- Recriar função para criar perfil e papel automaticamente no signup
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

  -- Inserir profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Inserir role
  INSERT INTO public.user_roles (user_id, role, assigned_by, assigned_at)
  VALUES (NEW.id, v_role, NEW.id, now());

  RETURN NEW;
END;
$$;

-- Garantir o trigger após criação de usuário no auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();