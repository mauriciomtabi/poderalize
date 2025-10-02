-- Fix user_id in colaboradores table to match auth.users
-- This corrects the issue where all colaboradores were associated with admin's user_id

UPDATE public.colaboradores c
SET user_id = au.id
FROM auth.users au
WHERE c.email = au.email
AND c.user_id != au.id;

-- Update project_members to have correct user_id based on email match
UPDATE public.project_members pm
SET user_id = au.id
FROM auth.users au
WHERE pm.email = au.email
AND pm.user_id != au.id;