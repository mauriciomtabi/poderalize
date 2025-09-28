-- Remover a política problemática
DROP POLICY IF EXISTS "Users can view board members" ON project_members;

-- Criar função security definer para verificar se usuário tem acesso ao board
CREATE OR REPLACE FUNCTION public.user_has_board_access(_user_id uuid, _board_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM project_boards 
    WHERE id = _board_id 
    AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 
    FROM project_members 
    WHERE board_id = _board_id 
    AND user_id = _user_id
  );
$$;

-- Criar nova política usando a função security definer
CREATE POLICY "Users can view board members" 
ON project_members 
FOR SELECT 
USING (public.user_has_board_access(auth.uid(), board_id));