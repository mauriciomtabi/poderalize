-- Atualizar RLS política para project_members para permitir que membros do board vejam outros membros
DROP POLICY IF EXISTS "Members can select their own membership" ON project_members;
DROP POLICY IF EXISTS "Users can view project members" ON project_members;

-- Nova política que permite ver todos os membros se o usuário for dono do board ou membro do mesmo board
CREATE POLICY "Users can view board members" 
ON project_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM project_boards 
    WHERE project_boards.id = project_members.board_id 
    AND (
      project_boards.user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM project_members pm2 
        WHERE pm2.board_id = project_boards.id 
        AND pm2.user_id = auth.uid()
      )
    )
  )
);