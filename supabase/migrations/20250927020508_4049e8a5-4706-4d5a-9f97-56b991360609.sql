-- Fix infinite recursion in project_members policies
DROP POLICY IF EXISTS "Users can view members of boards they have access to" ON project_members;
DROP POLICY IF EXISTS "Board owners can manage members" ON project_members;

-- Create corrected policies that avoid recursion
CREATE POLICY "Board owners can manage members" 
ON project_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 
  FROM project_boards 
  WHERE project_boards.id = project_members.board_id 
  AND project_boards.user_id = auth.uid()
));

CREATE POLICY "Users can view members of boards they own" 
ON project_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM project_boards 
  WHERE project_boards.id = project_members.board_id 
  AND project_boards.user_id = auth.uid()
));

CREATE POLICY "Members can view other members of same board" 
ON project_members 
FOR SELECT 
USING (user_id = auth.uid());