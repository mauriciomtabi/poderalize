-- Simplify project_cards RLS policies to allow any authenticated user to create cards
-- and allow users to manage their own created cards

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Project cards insert via list permission" ON public.project_cards;

-- Create new simplified INSERT policy: any authenticated user can create cards in existing lists
CREATE POLICY "Any authenticated user can create cards"
ON public.project_cards
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.project_lists
    WHERE id = list_id
  )
);

-- Update user_has_card_access function to include created_by access
CREATE OR REPLACE FUNCTION public.user_has_card_access(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    -- Admins see everything
    public.has_role(_user_id, 'admin'::user_role)
    OR
    -- User who created the card can access it
    EXISTS (
      SELECT 1
      FROM public.project_cards
      WHERE id = _card_id
        AND created_by = _user_id
    )
    OR
    -- Board owner sees all cards on their boards
    EXISTS (
      SELECT 1
      FROM public.project_lists pl
      JOIN public.project_boards pb ON pb.id = pl.board_id
      WHERE pl.id = (SELECT list_id FROM public.project_cards WHERE id = _card_id)
        AND pb.user_id = _user_id
    )
    OR
    -- Assigned users see the card
    EXISTS (
      SELECT 1
      FROM public.project_card_assignees a
      JOIN public.project_members pm ON pm.id = a.member_id
      WHERE a.card_id = _card_id AND pm.user_id = _user_id
    )
    OR
    -- Board members (not just owner) can view cards on boards they belong to
    EXISTS (
      SELECT 1
      FROM public.project_lists pl
      JOIN public.project_boards pb ON pb.id = pl.board_id
      JOIN public.project_members pm ON pm.board_id = pb.id
      WHERE pl.id = (SELECT list_id FROM public.project_cards WHERE id = _card_id)
        AND pm.user_id = _user_id
    );
$$;