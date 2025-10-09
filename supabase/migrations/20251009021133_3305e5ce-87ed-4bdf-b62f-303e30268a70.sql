-- Add position field to checklist_templates table
ALTER TABLE public.checklist_templates
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_checklist_templates_position 
ON public.checklist_templates(position);

-- Update existing templates to have sequential positions
WITH ranked_templates AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 AS new_position
  FROM public.checklist_templates
)
UPDATE public.checklist_templates
SET position = ranked_templates.new_position
FROM ranked_templates
WHERE checklist_templates.id = ranked_templates.id;