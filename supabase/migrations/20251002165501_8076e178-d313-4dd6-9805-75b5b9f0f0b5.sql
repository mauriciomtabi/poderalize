-- Create security definer function to check if user can manage cards on a list
CREATE OR REPLACE FUNCTION public.user_can_manage_card_on_list(_user_id uuid, _list_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Admins can manage all cards
    public.has_role(_user_id, 'admin'::user_role)
    OR
    -- Board owner or member can manage cards
    EXISTS (
      SELECT 1
      FROM public.project_lists pl
      JOIN public.project_boards pb ON pb.id = pl.board_id
      WHERE pl.id = _list_id
        AND (
          pb.user_id = _user_id
          OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.board_id = pb.id AND pm.user_id = _user_id
          )
        )
    );
$$;

-- Drop old policies on project_cards
DROP POLICY IF EXISTS "Board members can create cards" ON public.project_cards;
DROP POLICY IF EXISTS "Board members can update cards" ON public.project_cards;
DROP POLICY IF EXISTS "Board members can delete cards" ON public.project_cards;

-- Create new policies using the security definer function
CREATE POLICY "Users/admins can create cards via fn"
ON public.project_cards
FOR INSERT
WITH CHECK (
  public.user_can_manage_card_on_list(auth.uid(), list_id)
);

CREATE POLICY "Users/admins can update cards via fn"
ON public.project_cards
FOR UPDATE
USING (
  public.user_can_manage_card_on_list(auth.uid(), list_id)
);

CREATE POLICY "Users/admins can delete cards via fn"
ON public.project_cards
FOR DELETE
USING (
  public.user_can_manage_card_on_list(auth.uid(), list_id)
);