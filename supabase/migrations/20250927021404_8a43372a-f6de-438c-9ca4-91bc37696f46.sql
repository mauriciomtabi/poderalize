-- Break RLS recursion between project_boards and project_members

-- 1) Drop existing project_members policies to start clean
DROP POLICY IF EXISTS "Board owners can manage members" ON project_members;
DROP POLICY IF EXISTS "Users can view members of boards they own" ON project_members;
DROP POLICY IF EXISTS "Members can view other members of same board" ON project_members;
DROP POLICY IF EXISTS "Users can view members of boards they have access to" ON project_members;

-- 2) Recreate NON-RECURSIVE policies on project_members
-- Only allow selecting own membership rows (no references to project_boards or project_members again)
CREATE POLICY "Members can select their own membership"
ON project_members
FOR SELECT
USING (user_id = auth.uid());

-- Owners can INSERT members (safe to reference project_boards here as this isn't used while selecting boards)
CREATE POLICY "Board owners can insert members"
ON project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE project_boards.id = project_members.board_id
      AND project_boards.user_id = auth.uid()
  )
);

-- Owners can UPDATE members
CREATE POLICY "Board owners can update members"
ON project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE project_boards.id = project_members.board_id
      AND project_boards.user_id = auth.uid()
  )
);

-- Owners can DELETE members
CREATE POLICY "Board owners can delete members"
ON project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE project_boards.id = project_members.board_id
      AND project_boards.user_id = auth.uid()
  )
);

-- Note: The existing project_boards SELECT policy may reference project_members to allow members to see boards.
-- With the above change, project_members SELECT no longer references project_boards, breaking the recursion cycle.