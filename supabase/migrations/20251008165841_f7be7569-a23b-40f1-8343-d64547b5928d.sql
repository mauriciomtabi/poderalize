-- Configure RLS for project_activities table
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Users can view activities of cards they have access to
CREATE POLICY "Users can view activities of accessible cards"
ON project_activities
FOR SELECT
USING (user_has_card_access(auth.uid(), card_id));

-- Users can create activities on cards they have access to
CREATE POLICY "Users can create activities on accessible cards"
ON project_activities
FOR INSERT
WITH CHECK (user_has_card_access(auth.uid(), card_id));

-- Configure RLS for project_attachments table
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments of cards they have access to
CREATE POLICY "Users can view attachments of accessible cards"
ON project_attachments
FOR SELECT
USING (user_has_card_access(auth.uid(), card_id));

-- Users can add attachments to cards they have access to
CREATE POLICY "Users can add attachments to accessible cards"
ON project_attachments
FOR INSERT
WITH CHECK (user_has_card_access(auth.uid(), card_id));

-- Users can delete attachments from cards they have access to
CREATE POLICY "Users can delete attachments from accessible cards"
ON project_attachments
FOR DELETE
USING (user_has_card_access(auth.uid(), card_id));