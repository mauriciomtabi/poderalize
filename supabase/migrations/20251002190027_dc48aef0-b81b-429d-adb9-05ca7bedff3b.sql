-- Create checklist templates table
CREATE TABLE public.checklist_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  board_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  is_global BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklist template items table
CREATE TABLE public.checklist_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_templates
CREATE POLICY "Users can view their own templates"
ON public.checklist_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.checklist_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.checklist_templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.checklist_templates
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for checklist_template_items
CREATE POLICY "Users can view items of their templates"
ON public.checklist_template_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_templates
    WHERE id = checklist_template_items.template_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create items for their templates"
ON public.checklist_template_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.checklist_templates
    WHERE id = checklist_template_items.template_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update items of their templates"
ON public.checklist_template_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_templates
    WHERE id = checklist_template_items.template_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete items of their templates"
ON public.checklist_template_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_templates
    WHERE id = checklist_template_items.template_id
    AND user_id = auth.uid()
  )
);

-- Trigger to update updated_at on checklist_templates
CREATE TRIGGER update_checklist_templates_updated_at
BEFORE UPDATE ON public.checklist_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on checklist_template_items
CREATE TRIGGER update_checklist_template_items_updated_at
BEFORE UPDATE ON public.checklist_template_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();