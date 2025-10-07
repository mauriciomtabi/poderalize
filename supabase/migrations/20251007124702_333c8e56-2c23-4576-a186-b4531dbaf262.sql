-- Drop ALL existing policies on project_members to fix recursion
DROP POLICY IF EXISTS "Users with board access can view all members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners and admins can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners can view all members" ON public.project_members;
DROP POLICY IF EXISTS "Board members can view other members" ON public.project_members;
DROP POLICY IF EXISTS "Admins can view all members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Admins can manage all members" ON public.project_members;

-- Create new non-recursive policies for project_members

-- 1. Allow viewing members if user is board owner
CREATE POLICY "Board owners can view all members"
ON public.project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = project_members.board_id
    AND user_id = auth.uid()
  )
);

-- 2. Allow viewing members if user is also a member of the same board
CREATE POLICY "Board members can view other members"
ON public.project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.board_id = project_members.board_id
    AND pm.user_id = auth.uid()
  )
);

-- 3. Admins can view all members
CREATE POLICY "Admins can view all members"
ON public.project_members
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::user_role)
);

-- 4. Board owners can manage members (INSERT, UPDATE, DELETE)
CREATE POLICY "Board owners can manage members"
ON public.project_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = project_members.board_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = project_members.board_id
    AND user_id = auth.uid()
  )
);

-- 5. Admins can manage all members (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage all members"
ON public.project_members
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::user_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::user_role)
);