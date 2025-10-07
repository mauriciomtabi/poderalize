-- Adjust clientes RLS: allow all authenticated users to SELECT (for card association)
-- Keep INSERT/UPDATE/DELETE restricted to users with page permission

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users with clientes page permission can view all clientes" ON public.clientes;

-- Create new SELECT policy: all authenticated users can view clientes
CREATE POLICY "All authenticated users can view clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (true);

-- Keep other policies as-is (INSERT/UPDATE/DELETE still require page permission)