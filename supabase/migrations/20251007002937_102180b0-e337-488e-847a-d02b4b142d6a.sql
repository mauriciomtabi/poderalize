-- Normalize project_cards INSERT policies: drop all and create a single permissive one
DO $$
DECLARE p record;
BEGIN
  FOR p IN (
    SELECT policyname FROM pg_policies 
    WHERE schemaname='public' AND tablename='project_cards' AND cmd='INSERT'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_cards', p.policyname);
  END LOOP;
END $$;

-- Create a clear permissive INSERT policy
CREATE POLICY "Insert cards if list exists (any authenticated)"
ON public.project_cards
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.project_lists WHERE id = list_id)
);
