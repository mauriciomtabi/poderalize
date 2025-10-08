-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view profiles of board members" ON public.profiles;

-- Create new policy: All authenticated users can view all profiles
CREATE POLICY "All authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
