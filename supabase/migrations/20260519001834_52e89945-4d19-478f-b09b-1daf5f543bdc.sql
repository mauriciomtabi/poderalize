
-- 1. clientes: drop blanket SELECT, scope to owner or admin or page permission with ownership
DROP POLICY IF EXISTS "All authenticated users can view clientes" ON public.clientes;
CREATE POLICY "Users can view their own clientes"
ON public.clientes FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::user_role));

-- 2. profiles: drop blanket SELECT (admin + own + shared board still allow needed access)
DROP POLICY IF EXISTS "All authenticated users can view all profiles" ON public.profiles;
-- Allow viewing profiles of users you share a board with (for member name resolution)
CREATE POLICY "Users can view profiles of board collaborators"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::user_role)
  OR users_share_board(auth.uid(), user_id)
);

-- 3. project_members: drop the wide-open SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view project members" ON public.project_members;

-- 4. notifications: replace permissive INSERT
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. automation_logs: replace permissive INSERT
DROP POLICY IF EXISTS "System can insert logs" ON public.automation_logs;
CREATE POLICY "Users can insert logs for accessible boards"
ON public.automation_logs FOR INSERT
TO authenticated
WITH CHECK (user_has_board_access(auth.uid(), board_id));

-- 6. Storage: lead-avatars ownership checks (folder = auth.uid())
DROP POLICY IF EXISTS "Users can update their lead avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their lead avatars" ON storage.objects;

CREATE POLICY "Users can update their own lead avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lead-avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own lead avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lead-avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Also tighten INSERT to require folder = auth.uid()
DROP POLICY IF EXISTS "Authenticated users can upload lead avatars" ON storage.objects;
CREATE POLICY "Users can upload their own lead avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lead-avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 7. Fix function search_path on functions missing it
ALTER FUNCTION public.atualizar_saldo_conta() SET search_path = public;
ALTER FUNCTION public.atualizar_valor_atual_metas() SET search_path = public;
ALTER FUNCTION public.atualizar_metas_after_delete() SET search_path = public;
ALTER FUNCTION public.calcular_valor_inicial_meta() SET search_path = public;
