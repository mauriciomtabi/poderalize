-- Fix infinite recursion in RLS policies
-- The issue: project_cards policy references project_card_assignees, 
-- and project_card_assignees policy references project_cards, creating infinite loop

-- Drop problematic policies on project_card_assignees
DROP POLICY IF EXISTS "Users can view card assignees for accessible cards" ON public.project_card_assignees;
DROP POLICY IF EXISTS "Board members can manage card assignees" ON public.project_card_assignees;

-- Recreate project_card_assignees policies WITHOUT referencing project_cards
-- Instead, go directly through the card_id to lists/boards to avoid circular reference
CREATE POLICY "Users/admins can view card assignees"
ON public.project_card_assignees
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.project_lists pl
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pl.id = (SELECT list_id FROM public.project_cards WHERE id = project_card_assignees.card_id)
      AND (
        pb.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members pm 
          WHERE pm.board_id = pb.id AND pm.user_id = auth.uid()
        )
        OR public.has_role(auth.uid(), 'admin'::user_role)
      )
  )
  OR
  -- User is the assignee themselves
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.id = project_card_assignees.member_id
      AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Board members/admins can manage card assignees"
ON public.project_card_assignees
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.project_lists pl
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pl.id = (SELECT list_id FROM public.project_cards WHERE id = project_card_assignees.card_id)
      AND (
        pb.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members pm 
          WHERE pm.board_id = pb.id AND pm.user_id = auth.uid()
        )
        OR public.has_role(auth.uid(), 'admin'::user_role)
      )
  )
);