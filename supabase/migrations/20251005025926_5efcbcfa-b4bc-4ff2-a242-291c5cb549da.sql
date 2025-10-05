-- Drop all existing policies on checklist_templates
DROP POLICY IF EXISTS "Users can manage their own templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Users can update their own or board templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Users can delete their own, global, or board templates" ON public.checklist_templates;

-- Create separate policies for better control
CREATE POLICY "Users can insert their own templates"
ON public.checklist_templates
FOR INSERT
TO public
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own or board templates"
ON public.checklist_templates
FOR UPDATE
TO public
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM project_boards pb
    WHERE checklist_templates.board_id = pb.id
    AND pb.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users can delete their own, global, or board templates"
ON public.checklist_templates
FOR DELETE
TO public
USING (
  user_id = auth.uid()
  OR is_global = true
  OR EXISTS (
    SELECT 1 FROM project_boards pb
    WHERE checklist_templates.board_id = pb.id
    AND pb.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::user_role)
);