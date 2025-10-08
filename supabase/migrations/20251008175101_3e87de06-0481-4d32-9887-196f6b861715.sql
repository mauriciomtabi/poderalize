-- Replace the function with board access verification
-- No need to DROP, CREATE OR REPLACE will handle it
CREATE OR REPLACE FUNCTION public.user_has_card_access(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- User can view card if:
  -- 1. They created the card
  -- 2. They are assigned to the card
  -- 3. They have access to the board (owner, member, or admin)
  SELECT
    -- Creator of the card
    EXISTS (
      SELECT 1
      FROM public.project_cards pc
      WHERE pc.id = _card_id
        AND pc.created_by = _user_id
    )
    OR
    -- Assigned to the card
    EXISTS (
      SELECT 1 
      FROM public.project_card_assignees a
      JOIN public.project_members pm ON pm.id = a.member_id
      WHERE a.card_id = _card_id
        AND pm.user_id = _user_id
    )
    OR
    -- Has access to the board containing the card
    EXISTS (
      SELECT 1
      FROM public.project_cards pc
      JOIN public.project_lists pl ON pl.id = pc.list_id
      WHERE pc.id = _card_id
        AND user_has_board_access(_user_id, pl.board_id)
    );
$$;