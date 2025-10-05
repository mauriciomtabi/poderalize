-- Update RLS policies for leads table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Create new policies that allow access to all leads for users with page permission
CREATE POLICY "Users with leads page permission can view all leads"
ON public.leads
FOR SELECT
TO public
USING (
  user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users with leads page permission can create leads"
ON public.leads
FOR INSERT
TO public
WITH CHECK (
  user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users with leads page permission can update leads"
ON public.leads
FOR UPDATE
TO public
USING (
  user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users with leads page permission can delete leads"
ON public.leads
FOR DELETE
TO public
USING (
  user_has_page_permission(auth.uid(), 'leads'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);

-- Update RLS policies for clientes table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can create their own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete their own clientes" ON public.clientes;

-- Create new policies that allow access to all clientes for users with page permission
CREATE POLICY "Users with clientes page permission can view all clientes"
ON public.clientes
FOR SELECT
TO public
USING (
  user_has_page_permission(auth.uid(), 'clientes'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users with clientes page permission can create clientes"
ON public.clientes
FOR INSERT
TO public
WITH CHECK (
  user_has_page_permission(auth.uid(), 'clientes'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users with clientes page permission can update clientes"
ON public.clientes
FOR UPDATE
TO public
USING (
  user_has_page_permission(auth.uid(), 'clientes'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users with clientes page permission can delete clientes"
ON public.clientes
FOR DELETE
TO public
USING (
  user_has_page_permission(auth.uid(), 'clientes'::page_permission)
  OR has_role(auth.uid(), 'admin'::user_role)
);