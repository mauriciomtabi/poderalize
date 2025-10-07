-- Broaden manage permission to collaborators across boards of the same owner
CREATE OR REPLACE FUNCTION public.user_can_manage_card_on_list(_user_id uuid, _list_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Admins can manage all cards
    public.has_role(_user_id, 'admin'::user_role)
    OR
    -- Board owner can manage
    EXISTS (
      SELECT 1
      FROM public.project_lists pl
      JOIN public.project_boards pb ON pb.id = pl.board_id
      WHERE pl.id = _list_id
        AND pb.user_id = _user_id
    )
    OR
    -- Direct board members can manage
    EXISTS (
      SELECT 1
      FROM public.project_lists pl
      JOIN public.project_boards pb ON pb.id = pl.board_id
      JOIN public.project_members pm ON pm.board_id = pb.id
      WHERE pl.id = _list_id
        AND pm.user_id = _user_id
    )
    OR
    -- Collaborators of any board owned by the same owner can manage
    EXISTS (
      SELECT 1
      FROM public.project_lists pl_target
      JOIN public.project_boards pb_target ON pb_target.id = pl_target.board_id
      JOIN public.project_members pm_any ON pm_any.user_id = _user_id
      JOIN public.project_boards pb_member ON pb_member.id = pm_any.board_id
      WHERE pl_target.id = _list_id
        AND pb_member.user_id = pb_target.user_id
    );
$$;