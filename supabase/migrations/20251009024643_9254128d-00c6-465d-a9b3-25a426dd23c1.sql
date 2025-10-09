-- Drop and recreate policies for project_members to allow board members to view and insert
-- Fixes: collaborators seeing only themselves and inability to add members to cards

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can delete members" ON public.project_members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.project_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners and members can view members" ON public.project_members;

-- Create new comprehensive policies
CREATE POLICY "Users can view members of accessible boards"
ON public.project_members
FOR SELECT
USING (public.user_has_board_access(auth.uid(), board_id));

CREATE POLICY "Board members can insert members to their board"
ON public.project_members
FOR INSERT
WITH CHECK (public.user_has_board_access(auth.uid(), board_id));

CREATE POLICY "Board owners and admins can update members"
ON public.project_members
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::user_role) OR
  EXISTS (SELECT 1 FROM public.project_boards WHERE id = board_id AND user_id = auth.uid())
);

CREATE POLICY "Board owners and admins can delete members"
ON public.project_members
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::user_role) OR
  EXISTS (SELECT 1 FROM public.project_boards WHERE id = board_id AND user_id = auth.uid())
);