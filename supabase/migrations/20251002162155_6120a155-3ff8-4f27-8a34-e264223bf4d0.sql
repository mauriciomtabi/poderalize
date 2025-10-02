-- Admin and assignees access for Projects + Admin management for colaboradores

-- PROJECT BOARDS: allow admin to view all
DROP POLICY IF EXISTS "Users can view boards they own or are members of" ON public.project_boards;
CREATE POLICY "Users can view boards they own, are members of, or admin"
ON public.project_boards
FOR SELECT
USING (
  (user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.board_id = project_boards.id 
      AND pm.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

-- PROJECT LISTS: allow admin to view all lists
DROP POLICY IF EXISTS "Users can view lists of boards they have access to" ON public.project_lists;
CREATE POLICY "Users can view lists of boards they have access to or admin"
ON public.project_lists
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_boards pb
    WHERE pb.id = project_lists.board_id
      AND (
        pb.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members m 
          WHERE m.board_id = pb.id AND m.user_id = auth.uid()
        )
        OR public.has_role(auth.uid(), 'admin'::user_role)
      )
  )
);

-- PROJECT CARDS: allow admin and assignees to view cards
-- Attempt to replace existing SELECT policy (name may vary); create new robust policy
DROP POLICY IF EXISTS "Users can view cards of boards they have access to" ON public.project_cards;
CREATE POLICY "Users/admins/assignees can view cards"
ON public.project_cards
FOR SELECT
USING (
  -- Board owner or member or admin
  EXISTS (
    SELECT 1
    FROM public.project_lists pl
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pl.id = project_cards.list_id
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
  -- Card assignee (through project_members)
  EXISTS (
    SELECT 1
    FROM public.project_card_assignees a
    JOIN public.project_members pm ON pm.id = a.member_id
    WHERE a.card_id = project_cards.id
      AND pm.user_id = auth.uid()
  )
);

-- ATTACHMENTS: allow admin and assignees to view
DROP POLICY IF EXISTS "Users can view attachments for accessible cards" ON public.project_attachments;
CREATE POLICY "Users/admins/assignees can view attachments"
ON public.project_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_attachments.card_id
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
  EXISTS (
    SELECT 1
    FROM public.project_card_assignees a
    JOIN public.project_members pm ON pm.id = a.member_id
    WHERE a.card_id = project_attachments.card_id
      AND pm.user_id = auth.uid()
  )
);

-- COMMENTS: allow admin and assignees to view
DROP POLICY IF EXISTS "Users can view comments for accessible cards" ON public.project_comments;
CREATE POLICY "Users/admins/assignees can view comments"
ON public.project_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_comments.card_id
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
  EXISTS (
    SELECT 1
    FROM public.project_card_assignees a
    JOIN public.project_members pm ON pm.id = a.member_id
    WHERE a.card_id = project_comments.card_id
      AND pm.user_id = auth.uid()
  )
);

-- CARD LABEL RELATIONS: allow admin and assignees to view
DROP POLICY IF EXISTS "Users can view card labels for accessible cards" ON public.project_card_labels;
CREATE POLICY "Users/admins/assignees can view card labels"
ON public.project_card_labels
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_card_labels.card_id
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
  EXISTS (
    SELECT 1
    FROM public.project_card_assignees a
    JOIN public.project_members pm ON pm.id = a.member_id
    WHERE a.card_id = project_card_labels.card_id
      AND pm.user_id = auth.uid()
  )
);

-- COLABORADORES: allow admins to manage all
DROP POLICY IF EXISTS "Users can create their own colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can delete their own colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can update their own colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can view their own colaboradores" ON public.colaboradores;

CREATE POLICY "Users or admins can create colaboradores"
ON public.colaboradores
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users or admins can delete colaboradores"
ON public.colaboradores
FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users or admins can update colaboradores"
ON public.colaboradores
FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Users or admins can view colaboradores"
ON public.colaboradores
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::user_role));
