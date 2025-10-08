-- Update RLS policy for project_members to allow board members to view all members

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Board members can view project_members" ON public.project_members;

-- Create new SELECT policy that allows board members to see all members
CREATE POLICY "Board members can view all members of the board"
ON public.project_members
FOR SELECT
USING (
  user_has_board_access(auth.uid(), board_id) OR has_role(auth.uid(), 'admin'::user_role)
);