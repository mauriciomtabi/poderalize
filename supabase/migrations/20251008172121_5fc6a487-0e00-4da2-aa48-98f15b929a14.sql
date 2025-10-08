-- Allow admins to see full card details (members, labels, attachments, activities)
-- by switching RLS checks to user_can_view_card (which includes admins)

-- project_card_assignees
ALTER TABLE public.project_card_assignees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Board members/admins can manage card assignees via fn" ON public.project_card_assignees;
DROP POLICY IF EXISTS "Users/admins can view card assignees via fn" ON public.project_card_assignees;
CREATE POLICY "Manage assignees if can view card"
ON public.project_card_assignees
FOR ALL
USING (public.user_can_view_card(auth.uid(), card_id))
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));
CREATE POLICY "View assignees if can view card"
ON public.project_card_assignees
FOR SELECT
USING (public.user_can_view_card(auth.uid(), card_id));

-- project_card_labels
ALTER TABLE public.project_card_labels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Board members/admins can manage card labels via fn" ON public.project_card_labels;
DROP POLICY IF EXISTS "Users/admins/assignees can view card labels via fn" ON public.project_card_labels;
CREATE POLICY "Manage labels if can view card"
ON public.project_card_labels
FOR ALL
USING (public.user_can_view_card(auth.uid(), card_id))
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));
CREATE POLICY "View labels if can view card"
ON public.project_card_labels
FOR SELECT
USING (public.user_can_view_card(auth.uid(), card_id));

-- project_attachments
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view attachments of accessible cards" ON public.project_attachments;
DROP POLICY IF EXISTS "Users can add attachments to accessible cards" ON public.project_attachments;
DROP POLICY IF EXISTS "Users can delete attachments from accessible cards" ON public.project_attachments;
CREATE POLICY "View attachments if can view card"
ON public.project_attachments
FOR SELECT
USING (public.user_can_view_card(auth.uid(), card_id));
CREATE POLICY "Add attachments if can view card"
ON public.project_attachments
FOR INSERT
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));
CREATE POLICY "Delete attachments if can view card"
ON public.project_attachments
FOR DELETE
USING (public.user_can_view_card(auth.uid(), card_id));

-- project_activities
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view activities of accessible cards" ON public.project_activities;
DROP POLICY IF EXISTS "Users can create activities on accessible cards" ON public.project_activities;
CREATE POLICY "View activities if can view card"
ON public.project_activities
FOR SELECT
USING (public.user_can_view_card(auth.uid(), card_id));
CREATE POLICY "Create activities if can view card"
ON public.project_activities
FOR INSERT
WITH CHECK (public.user_can_view_card(auth.uid(), card_id));