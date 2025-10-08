-- Fix: Remove existing policies first to avoid duplication

-- project_card_assignees
DROP POLICY IF EXISTS "Board members/admins can manage card assignees via fn" ON public.project_card_assignees;
DROP POLICY IF EXISTS "Users/admins can view card assignees via fn" ON public.project_card_assignees;
DROP POLICY IF EXISTS "Manage assignees if can view card" ON public.project_card_assignees;
DROP POLICY IF EXISTS "View assignees if can view card" ON public.project_card_assignees;

-- project_card_labels
DROP POLICY IF EXISTS "Board members/admins can manage card labels via fn" ON public.project_card_labels;
DROP POLICY IF EXISTS "Users/admins/assignees can view card labels via fn" ON public.project_card_labels;
DROP POLICY IF EXISTS "Manage labels if can view card" ON public.project_card_labels;
DROP POLICY IF EXISTS "View labels if can view card" ON public.project_card_labels;

-- project_attachments
DROP POLICY IF EXISTS "Users can view attachments of accessible cards" ON public.project_attachments;
DROP POLICY IF EXISTS "Users can add attachments to accessible cards" ON public.project_attachments;
DROP POLICY IF EXISTS "Users can delete attachments from accessible cards" ON public.project_attachments;
DROP POLICY IF EXISTS "View attachments if can view card" ON public.project_attachments;
DROP POLICY IF EXISTS "Add attachments if can view card" ON public.project_attachments;
DROP POLICY IF EXISTS "Delete attachments if can view card" ON public.project_attachments;

-- project_activities
DROP POLICY IF EXISTS "Users can view activities of accessible cards" ON public.project_activities;
DROP POLICY IF EXISTS "Users can create activities on accessible cards" ON public.project_activities;
DROP POLICY IF EXISTS "View activities if can view card" ON public.project_activities;
DROP POLICY IF EXISTS "Create activities if can view card" ON public.project_activities;

-- Now create new policies for all tables using user_can_view_card

-- project_card_assignees
CREATE POLICY "Admins and creators can manage assignees"
ON public.project_card_assignees
FOR ALL
USING (public.user_can_view_card(auth.uid(), card_id))
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));

-- project_card_labels
CREATE POLICY "Admins and creators can manage labels"
ON public.project_card_labels
FOR ALL
USING (public.user_can_view_card(auth.uid(), card_id))
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));

-- project_attachments
CREATE POLICY "Admins and creators can view attachments"
ON public.project_attachments
FOR SELECT
USING (public.user_can_view_card(auth.uid(), card_id));

CREATE POLICY "Admins and creators can add attachments"
ON public.project_attachments
FOR INSERT
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));

CREATE POLICY "Admins and creators can delete attachments"
ON public.project_attachments
FOR DELETE
USING (public.user_can_view_card(auth.uid(), card_id));

-- project_activities
CREATE POLICY "Admins and creators can view activities"
ON public.project_activities
FOR SELECT
USING (public.user_can_view_card(auth.uid(), card_id));

CREATE POLICY "Admins and creators can create activities"
ON public.project_activities
FOR INSERT
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));