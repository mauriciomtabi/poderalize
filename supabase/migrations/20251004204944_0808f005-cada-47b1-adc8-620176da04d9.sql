-- Add admin policies for project_members table
-- This allows admins to view and manage all project members

-- Policy for admins to view all members
CREATE POLICY "Admins can view all members"
ON public.project_members
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- Policy for admins to insert members
CREATE POLICY "Admins can insert members"
ON public.project_members
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));

-- Policy for admins to update members
CREATE POLICY "Admins can update members"
ON public.project_members
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role));

-- Policy for admins to delete members
CREATE POLICY "Admins can delete members"
ON public.project_members
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::user_role));