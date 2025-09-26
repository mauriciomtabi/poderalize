-- Atualizar perfil do usuário pendente existente com email
UPDATE public.profiles 
SET email = 'mauricio.maciel03@gmail.com' 
WHERE user_id = '9433118c-56b4-47e9-a146-75123403c700' AND email IS NULL;