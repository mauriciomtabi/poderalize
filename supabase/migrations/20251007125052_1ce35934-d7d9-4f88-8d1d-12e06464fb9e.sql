-- Simplify project_members RLS to eliminate recursion and restore boards access
-- 1) Drop existing project_members policies
DROP POLICY IF EXISTS "Board owners can view all members" ON public.project_members;
DROP POLICY IF EXISTS "Board members can view other members" ON public.project_members;
DROP POLICY IF EXISTS "Admins can view all members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Admins can manage all members" ON public.project_members;
DROP POLICY IF EXISTS "Users with board access can view all members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners and admins can manage members" ON public.project_members;

-- 2) Create minimal, non-recursive policies
-- View: any authenticated user can read project members (avoids cross-table recursion)
CREATE POLICY "Authenticated users can view project members"
ON public.project_members
FOR SELECT
USING (true);

-- Manage: only admins can insert/update/delete members
CREATE POLICY "Admins can manage project members"
ON public.project_members
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));