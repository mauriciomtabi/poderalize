-- Update handle_new_user function to promote grace.tj.cardoso@gmail.com to admin as well
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_role user_role := 'pending';
BEGIN
  -- Promover automaticamente estes e-mails para admin
  IF lower(NEW.email) IN ('mtabi.adm@gmail.com', 'grace.tj.cardoso@gmail.com') THEN
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
$function$;