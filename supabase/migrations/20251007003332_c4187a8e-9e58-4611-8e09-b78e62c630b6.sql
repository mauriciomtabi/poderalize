-- Relax INSERT RLS on project_cards to allow any authenticated user to create
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

CREATE POLICY "Authenticated users can insert project cards"
ON public.project_cards
FOR INSERT
TO authenticated
WITH CHECK (true);
