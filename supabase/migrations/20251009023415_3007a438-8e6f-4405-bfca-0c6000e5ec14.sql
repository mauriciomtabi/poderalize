-- Recreate user_has_card_access function to fix permissions
-- Collaborators should only see cards where they are assigned, not all board cards
CREATE OR REPLACE FUNCTION public.user_has_card_access(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    -- Admins have access to all cards
    public.has_role(_user_id, 'admin'::user_role)
    OR
    -- Card creator has access
    EXISTS (
      SELECT 1
      FROM public.project_cards pc
      WHERE pc.id = _card_id
        AND pc.created_by = _user_id
    )
    OR
    -- Board owner has access to all cards in their board
    EXISTS (
      SELECT 1
      FROM public.project_cards pc
      JOIN public.project_lists pl ON pl.id = pc.list_id
      JOIN public.project_boards pb ON pb.id = pl.board_id
      WHERE pc.id = _card_id
        AND pb.user_id = _user_id
    )
    OR
    -- Users assigned to the card have access
    EXISTS (
      SELECT 1 
      FROM public.project_card_assignees pca
      JOIN public.project_members pm ON pm.id = pca.member_id
      WHERE pca.card_id = _card_id
        AND pm.user_id = _user_id
    );
$$;