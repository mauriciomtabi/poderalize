-- Create function to sync all active collaborators to project_members for a board
CREATE OR REPLACE FUNCTION public.sync_board_members(p_board_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that the user has access to this board
  IF NOT user_has_board_access(auth.uid(), p_board_id) THEN
    RAISE EXCEPTION 'You do not have access to this board';
  END IF;

  -- Get the board owner's user_id
  DECLARE
    v_board_owner_id uuid;
  BEGIN
    SELECT user_id INTO v_board_owner_id
    FROM project_boards
    WHERE id = p_board_id;

    -- Upsert all active collaborators into project_members for this board
    INSERT INTO project_members (
      board_id,
      user_id,
      name,
      email,
      avatar,
      role,
      added_by,
      added_at
    )
    SELECT 
      p_board_id,
      c.user_id,
      c.nome,
      c.email,
      COALESCE(p.avatar_url, c.avatar_url),
      'member',
      v_board_owner_id,
      now()
    FROM colaboradores c
    LEFT JOIN profiles p ON p.user_id = c.user_id
    WHERE c.status = 'ativo'
    ON CONFLICT (board_id, user_id) 
    DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      avatar = COALESCE(EXCLUDED.avatar, project_members.avatar),
      updated_at = now();
  END;
END;
$$;