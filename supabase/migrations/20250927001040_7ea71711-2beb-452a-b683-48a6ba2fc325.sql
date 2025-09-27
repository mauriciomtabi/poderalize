-- Add funnel relationship fields to leads table
ALTER TABLE public.leads 
ADD COLUMN funnel_id uuid REFERENCES public.funnels(id) ON DELETE SET NULL,
ADD COLUMN funnel_stage_id uuid REFERENCES public.funnel_stages(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_leads_funnel_id ON public.leads(funnel_id);
CREATE INDEX idx_leads_funnel_stage_id ON public.leads(funnel_stage_id);

-- Add a check constraint to ensure funnel consistency
-- (if funnel_stage_id is set, funnel_id must also be set)
ALTER TABLE public.leads 
ADD CONSTRAINT check_funnel_stage_consistency 
CHECK (
  (funnel_stage_id IS NULL AND funnel_id IS NULL) OR 
  (funnel_stage_id IS NOT NULL AND funnel_id IS NOT NULL)
);