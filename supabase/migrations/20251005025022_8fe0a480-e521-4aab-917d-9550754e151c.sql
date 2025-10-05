-- Update RLS policies for checklist_templates to allow viewing by all board members

-- First, let's see what policies exist
-- Drop and recreate policies for checklist_templates

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.checklist_templates;
DROP POLICY IF EXISTS "Users can view their own templates" ON public.checklist_templates;

-- Create new policies that allow board members to view templates
CREATE POLICY "Board members can view templates"
ON public.checklist_templates
FOR SELECT
USING (
  user_id = auth.uid()
  OR is_global = true
  OR EXISTS (
    SELECT 1 FROM public.project_members pm
    JOIN public.project_boards pb ON pb.id = pm.board_id
    WHERE checklist_templates.board_id = pb.id 
    AND pm.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.project_boards pb
    WHERE checklist_templates.board_id = pb.id 
    AND pb.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own templates"
ON public.checklist_templates
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());