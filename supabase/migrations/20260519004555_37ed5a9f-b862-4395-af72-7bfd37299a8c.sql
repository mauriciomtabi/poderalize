-- Funnels: share read + stage management with users that have CRM (leads) page permission
DROP POLICY IF EXISTS "Users can view their own funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can create their own funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can update their own funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can delete their own funnels" ON public.funnels;

CREATE POLICY "CRM users can view funnels"
ON public.funnels FOR SELECT
USING (
  public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM users can create funnels"
ON public.funnels FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
    OR public.has_role(auth.uid(), 'admin'::user_role)
  )
);

CREATE POLICY "Owners or admins can update funnels"
ON public.funnels FOR UPDATE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Owners or admins can delete funnels"
ON public.funnels FOR DELETE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

-- Funnel stages: visible/manageable by anyone with CRM permission for funnels they can see
DROP POLICY IF EXISTS "Users can view funnel stages of their funnels" ON public.funnel_stages;
DROP POLICY IF EXISTS "Users can create funnel stages for their funnels" ON public.funnel_stages;
DROP POLICY IF EXISTS "Users can update funnel stages of their funnels" ON public.funnel_stages;
DROP POLICY IF EXISTS "Users can delete funnel stages of their funnels" ON public.funnel_stages;

CREATE POLICY "CRM users can view funnel stages"
ON public.funnel_stages FOR SELECT
USING (
  public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM users can insert funnel stages"
ON public.funnel_stages FOR INSERT
WITH CHECK (
  public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM users can update funnel stages"
ON public.funnel_stages FOR UPDATE
USING (
  public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM users can delete funnel stages"
ON public.funnel_stages FOR DELETE
USING (
  public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);