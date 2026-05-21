-- Migration: Fix CRM access for non-admin users with crm/leads page permissions

-- 1. Drop existing policies on funnels
DROP POLICY IF EXISTS "CRM users can view funnels" ON public.funnels;
DROP POLICY IF EXISTS "CRM users can create funnels" ON public.funnels;
DROP POLICY IF EXISTS "Owners or admins can update funnels" ON public.funnels;
DROP POLICY IF EXISTS "Owners or admins can delete funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can view their own funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can create their own funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can update their own funnels" ON public.funnels;
DROP POLICY IF EXISTS "Users can delete their own funnels" ON public.funnels;

-- 2. Create new policies on funnels
CREATE POLICY "CRM/Leads users can view funnels"
ON public.funnels FOR SELECT
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can create funnels"
ON public.funnels FOR INSERT
WITH CHECK (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can update funnels"
ON public.funnels FOR UPDATE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can delete funnels"
ON public.funnels FOR DELETE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);


-- 3. Drop existing policies on funnel_stages
DROP POLICY IF EXISTS "CRM users can view funnel stages" ON public.funnel_stages;
DROP POLICY IF EXISTS "CRM users can insert funnel stages" ON public.funnel_stages;
DROP POLICY IF EXISTS "CRM users can update funnel stages" ON public.funnel_stages;
DROP POLICY IF EXISTS "CRM users can delete funnel stages" ON public.funnel_stages;
DROP POLICY IF EXISTS "Users can view funnel stages of their funnels" ON public.funnel_stages;
DROP POLICY IF EXISTS "Users can create funnel stages for their funnels" ON public.funnel_stages;
DROP POLICY IF EXISTS "Users can update funnel stages of their funnels" ON public.funnel_stages;
DROP POLICY IF EXISTS "Users can delete funnel stages of their funnels" ON public.funnel_stages;

-- 4. Create new policies on funnel_stages
CREATE POLICY "CRM/Leads users can view funnel stages"
ON public.funnel_stages FOR SELECT
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can create funnel stages"
ON public.funnel_stages FOR INSERT
WITH CHECK (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can update funnel stages"
ON public.funnel_stages FOR UPDATE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can delete funnel stages"
ON public.funnel_stages FOR DELETE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);


-- 5. Drop existing policies on leads
DROP POLICY IF EXISTS "Users with leads page permission can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Users with leads page permission can create leads" ON public.leads;
DROP POLICY IF EXISTS "Users with leads page permission can update leads" ON public.leads;
DROP POLICY IF EXISTS "Users with leads page permission can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- 6. Create new policies on leads
CREATE POLICY "CRM/Leads users can view leads"
ON public.leads FOR SELECT
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can create leads"
ON public.leads FOR INSERT
WITH CHECK (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can update leads"
ON public.leads FOR UPDATE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can delete leads"
ON public.leads FOR DELETE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);


-- 7. Drop existing policies on follow_ups
DROP POLICY IF EXISTS "Users can view their own follow_ups" ON public.follow_ups;
DROP POLICY IF EXISTS "Users can create their own follow_ups" ON public.follow_ups;
DROP POLICY IF EXISTS "Users can update their own follow_ups" ON public.follow_ups;
DROP POLICY IF EXISTS "Users can delete their own follow_ups" ON public.follow_ups;

-- 8. Create new policies on follow_ups
CREATE POLICY "CRM/Leads users can view follow_ups"
ON public.follow_ups FOR SELECT
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can create follow_ups"
ON public.follow_ups FOR INSERT
WITH CHECK (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can update follow_ups"
ON public.follow_ups FOR UPDATE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can delete follow_ups"
ON public.follow_ups FOR DELETE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);


-- 9. Drop existing policies on lead_interactions
DROP POLICY IF EXISTS "Users can view interactions of their leads" ON public.lead_interactions;
DROP POLICY IF EXISTS "Users can create interactions for their leads" ON public.lead_interactions;
DROP POLICY IF EXISTS "Users can update interactions of their leads" ON public.lead_interactions;
DROP POLICY IF EXISTS "Users can delete interactions of their leads" ON public.lead_interactions;

-- 10. Create new policies on lead_interactions
CREATE POLICY "CRM/Leads users can view lead_interactions"
ON public.lead_interactions FOR SELECT
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can create lead_interactions"
ON public.lead_interactions FOR INSERT
WITH CHECK (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can update lead_interactions"
ON public.lead_interactions FOR UPDATE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "CRM/Leads users can delete lead_interactions"
ON public.lead_interactions FOR DELETE
USING (
  public.user_has_page_permission(auth.uid(), 'crm'::page_permission)
  OR public.user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR public.has_role(auth.uid(), 'admin'::user_role)
);
