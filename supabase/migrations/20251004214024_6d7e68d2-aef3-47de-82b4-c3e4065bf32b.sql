-- Update RLS policies for project_cards to restrict visibility based on user role and assignment

-- Drop existing policies for project_cards
DROP POLICY IF EXISTS "Users can view cards of accessible boards" ON project_cards;
DROP POLICY IF EXISTS "Board members can create cards" ON project_cards;
DROP POLICY IF EXISTS "Board members can update cards" ON project_cards;
DROP POLICY IF EXISTS "Board members can delete cards" ON project_cards;

-- Create new SELECT policy: admins see all, users see only cards assigned to them
CREATE POLICY "Admins can view all cards or users view their assigned cards"
ON project_cards
FOR SELECT
TO authenticated
USING (
  -- Admins can see all cards
  has_role(auth.uid(), 'admin'::user_role)
  OR
  -- Users can see cards they are assigned to
  EXISTS (
    SELECT 1
    FROM project_card_assignees pca
    JOIN project_members pm ON pm.id = pca.member_id
    WHERE pca.card_id = project_cards.id
      AND pm.user_id = auth.uid()
  )
  OR
  -- Board owners can see all cards on their boards
  EXISTS (
    SELECT 1
    FROM project_lists pl
    JOIN project_boards pb ON pb.id = pl.board_id
    WHERE pl.id = project_cards.list_id
      AND pb.user_id = auth.uid()
  )
);

-- Board members/owners can create cards
CREATE POLICY "Board members can create cards"
ON project_cards
FOR INSERT
TO authenticated
WITH CHECK (
  user_can_manage_card_on_list(auth.uid(), list_id)
);

-- Board members/owners can update cards (or admins)
CREATE POLICY "Board members can update cards"
ON project_cards
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR
  user_can_manage_card_on_list(auth.uid(), list_id)
);

-- Board members/owners can delete cards (or admins)
CREATE POLICY "Board members can delete cards"
ON project_cards
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR
  user_can_manage_card_on_list(auth.uid(), list_id)
);