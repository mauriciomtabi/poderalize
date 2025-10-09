-- Fix user_can_view_card to allow board members to manage assignees
CREATE OR REPLACE FUNCTION public.user_can_view_card(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin'::user_role)
  OR EXISTS (
    -- User is already assigned to this card
    SELECT 1
    FROM public.project_card_assignees a
    JOIN public.project_members pm ON pm.id = a.member_id
    WHERE a.card_id = _card_id
      AND pm.user_id = _user_id
  )
  OR EXISTS (
    -- User is owner of the board
    SELECT 1
    FROM public.project_cards pc
    JOIN public.project_lists pl ON pl.id = pc.list_id
    JOIN public.project_boards pb ON pb.id = pl.board_id
    WHERE pc.id = _card_id
      AND pb.user_id = _user_id
  )
  OR EXISTS (
    -- User is a member of the board
    SELECT 1
    FROM public.project_cards pc
    JOIN public.project_lists pl ON pl.id = pc.list_id
    JOIN public.project_members pm ON pm.board_id = pl.board_id
    WHERE pc.id = _card_id
      AND pm.user_id = _user_id
  );
$$;