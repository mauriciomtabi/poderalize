-- Criar função para verificar se usuários compartilham um board
CREATE OR REPLACE FUNCTION public.users_share_board(_user_id uuid, _other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Verifica se ambos são membros do mesmo board
  SELECT EXISTS (
    SELECT 1
    FROM project_members pm1
    JOIN project_members pm2 ON pm1.board_id = pm2.board_id
    WHERE pm1.user_id = _user_id
      AND pm2.user_id = _other_user_id
  )
  OR EXISTS (
    -- Ou se um é dono do board e o outro é membro
    SELECT 1
    FROM project_boards pb
    JOIN project_members pm ON pm.board_id = pb.id
    WHERE (
      (pb.user_id = _user_id AND pm.user_id = _other_user_id)
      OR (pb.user_id = _other_user_id AND pm.user_id = _user_id)
    )
  );
$$;

-- Adicionar política para permitir que usuários vejam perfis de outros membros do mesmo board
CREATE POLICY "Users can view profiles of board members"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.users_share_board(auth.uid(), user_id)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);