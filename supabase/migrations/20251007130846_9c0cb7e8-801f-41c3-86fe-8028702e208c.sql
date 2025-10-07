-- Recreate user_has_card_access function with improved logic
CREATE OR REPLACE FUNCTION public.user_has_card_access(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _list_id uuid;
  _board_id uuid;
BEGIN
  -- Get list_id and board_id for the card
  SELECT pc.list_id, pl.board_id INTO _list_id, _board_id
  FROM project_cards pc
  JOIN project_lists pl ON pl.id = pc.list_id
  WHERE pc.id = _card_id;

  -- If card doesn't exist, deny access
  IF _list_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check access conditions
  RETURN (
    -- Admins see everything
    has_role(_user_id, 'admin'::user_role)
    OR
    -- User who created the card can access it
    EXISTS (
      SELECT 1 FROM project_cards
      WHERE id = _card_id AND created_by = _user_id
    )
    OR
    -- Board owner sees all cards on their boards
    EXISTS (
      SELECT 1 FROM project_boards
      WHERE id = _board_id AND user_id = _user_id
    )
    OR
    -- Board members can view cards on boards they belong to
    EXISTS (
      SELECT 1 FROM project_members
      WHERE board_id = _board_id AND user_id = _user_id
    )
    OR
    -- Assigned users see the card
    EXISTS (
      SELECT 1 
      FROM project_card_assignees a
      JOIN project_members pm ON pm.id = a.member_id
      WHERE a.card_id = _card_id AND pm.user_id = _user_id
    )
  );
END;
$$;