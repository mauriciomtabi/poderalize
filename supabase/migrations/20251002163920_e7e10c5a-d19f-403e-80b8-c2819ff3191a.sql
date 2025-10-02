-- Create helper function to avoid RLS recursion and centralize access logic
CREATE OR REPLACE FUNCTION public.user_has_card_access(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Admins see everything
    public.has_role(_user_id, 'admin'::user_role)
    OR
    -- Board owner or member of the board that owns the card's list
    EXISTS (
      SELECT 1
      FROM public.project_lists pl
      JOIN public.project_boards pb ON pb.id = pl.board_id
      WHERE pl.id = (SELECT list_id FROM public.project_cards WHERE id = _card_id)
        AND (
          pb.user_id = _user_id
          OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.board_id = pb.id AND pm.user_id = _user_id
          )
        )
    )
    OR
    -- User is assigned to the card
    EXISTS (
      SELECT 1
      FROM public.project_card_assignees a
      JOIN public.project_members pm ON pm.id = a.member_id
      WHERE a.card_id = _card_id AND pm.user_id = _user_id
    );
$$;

-- Update project_cards SELECT policy to use the helper function (removes circular refs)
DROP POLICY IF EXISTS "Users/admins/assignees can view cards" ON public.project_cards;
CREATE POLICY "Users/admins/assignees can view cards via fn"
ON public.project_cards
FOR SELECT
USING (
  public.user_has_card_access(auth.uid(), id)
);

-- Ensure assignee policies also use the helper function (no joins to project_cards/project_members in policy body)
DROP POLICY IF EXISTS "Users/admins can view card assignees" ON public.project_card_assignees;
DROP POLICY IF EXISTS "Board members/admins can manage card assignees" ON public.project_card_assignees;

CREATE POLICY "Users/admins can view card assignees via fn"
ON public.project_card_assignees
FOR SELECT
USING (
  public.user_has_card_access(auth.uid(), project_card_assignees.card_id)
);

CREATE POLICY "Board members/admins can manage card assignees via fn"
ON public.project_card_assignees
FOR ALL
USING (
  public.user_has_card_access(auth.uid(), project_card_assignees.card_id)
)
WITH CHECK (
  public.user_has_card_access(auth.uid(), project_card_assignees.card_id)
);
