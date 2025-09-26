-- Set mtabi.adm@gmail.com as administrator
-- First, find the user ID for mtabi.adm@gmail.com and set as admin
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  au.id,
  'admin'::user_role,
  au.id
FROM auth.users au 
WHERE au.email = 'mtabi.adm@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;