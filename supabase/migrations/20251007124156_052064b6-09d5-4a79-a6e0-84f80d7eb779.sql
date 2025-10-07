-- Drop existing restrictive policies on project_members
DROP POLICY IF EXISTS "Users can view members of boards they have access to" ON public.project_members;
DROP POLICY IF EXISTS "Users can view their own member records" ON public.project_members;
DROP POLICY IF EXISTS "Board owners can view members" ON public.project_members;

-- Create new comprehensive policy for viewing members
-- Anyone with board access (owner, member, or admin) can view all members of that board
CREATE POLICY "Users with board access can view all members"
ON public.project_members
FOR SELECT
USING (
  user_has_board_access(auth.uid(), board_id)
);

-- Board owners and admins can manage members
CREATE POLICY "Board owners and admins can manage members"
ON public.project_members
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = project_members.board_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::user_role)
  OR EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = project_members.board_id
    AND user_id = auth.uid()
  )
);