-- Update RLS policies for checklist_templates to allow viewing by all board members

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create items for their templates" ON public.checklist_template_items;
DROP POLICY IF EXISTS "Users can delete items of their templates" ON public.checklist_template_items;
DROP POLICY IF EXISTS "Users can update items of their templates" ON public.checklist_template_items;
DROP POLICY IF EXISTS "Users can view items of their templates" ON public.checklist_template_items;

-- Create new policies that allow board members to view templates
CREATE POLICY "Board members can view template items"
ON public.checklist_template_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.checklist_templates ct
    WHERE ct.id = checklist_template_items.template_id
    AND (
      ct.user_id = auth.uid()
      OR ct.is_global = true
      OR EXISTS (
        SELECT 1 FROM public.project_members pm
        JOIN public.project_boards pb ON pb.id = pm.board_id
        WHERE ct.board_id = pb.id AND pm.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.project_boards pb
        WHERE ct.board_id = pb.id AND pb.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Template owners can manage items"
ON public.checklist_template_items
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.checklist_templates ct
    WHERE ct.id = checklist_template_items.template_id
    AND ct.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.checklist_templates ct
    WHERE ct.id = checklist_template_items.template_id
    AND ct.user_id = auth.uid()
  )
);