-- Replace RLS on related tables to avoid recursion and use helper function

-- PROJECT COMMENTS
DROP POLICY IF EXISTS "Board members can manage comments" ON public.project_comments;
DROP POLICY IF EXISTS "Users/admins/assignees can view comments" ON public.project_comments;
CREATE POLICY "Users/admins/assignees can view comments via fn"
ON public.project_comments
FOR SELECT
USING (
  public.user_has_card_access(auth.uid(), project_comments.card_id)
);
CREATE POLICY "Board members/admins can manage comments via fn"
ON public.project_comments
FOR ALL
USING (
  public.user_has_card_access(auth.uid(), project_comments.card_id)
)
WITH CHECK (
  public.user_has_card_access(auth.uid(), project_comments.card_id)
);

-- PROJECT ATTACHMENTS
DROP POLICY IF EXISTS "Board members can manage attachments" ON public.project_attachments;
DROP POLICY IF EXISTS "Users/admins/assignees can view attachments" ON public.project_attachments;
CREATE POLICY "Users/admins/assignees can view attachments via fn"
ON public.project_attachments
FOR SELECT
USING (
  public.user_has_card_access(auth.uid(), project_attachments.card_id)
);
CREATE POLICY "Board members/admins can manage attachments via fn"
ON public.project_attachments
FOR ALL
USING (
  public.user_has_card_access(auth.uid(), project_attachments.card_id)
)
WITH CHECK (
  public.user_has_card_access(auth.uid(), project_attachments.card_id)
);

-- PROJECT CARD LABELS
DROP POLICY IF EXISTS "Board members can manage card labels" ON public.project_card_labels;
DROP POLICY IF EXISTS "Users/admins/assignees can view card labels" ON public.project_card_labels;
CREATE POLICY "Users/admins/assignees can view card labels via fn"
ON public.project_card_labels
FOR SELECT
USING (
  public.user_has_card_access(auth.uid(), project_card_labels.card_id)
);
CREATE POLICY "Board members/admins can manage card labels via fn"
ON public.project_card_labels
FOR ALL
USING (
  public.user_has_card_access(auth.uid(), project_card_labels.card_id)
)
WITH CHECK (
  public.user_has_card_access(auth.uid(), project_card_labels.card_id)
);
