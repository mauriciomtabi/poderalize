-- Finalize RLS for project_cards: drop all and recreate minimal, permissive where needed

-- Ensure RLS is enabled
ALTER TABLE public.project_cards ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on project_cards (any command)
DO $$
DECLARE p record;
BEGIN
  FOR p IN (
    SELECT policyname FROM pg_policies 
    WHERE schemaname='public' AND tablename='project_cards'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_cards', p.policyname);
  END LOOP;
END $$;

-- SELECT: allow creator and users with board/card access function
CREATE POLICY "Cards select by access or creator"
ON public.project_cards
FOR SELECT
USING (
  created_by = auth.uid() OR public.user_has_card_access(auth.uid(), id)
);

-- INSERT: allow any authenticated user to insert
CREATE POLICY "Cards insert (any authenticated)"
ON public.project_cards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: allow creator and users with access function
CREATE POLICY "Cards update by access or creator"
ON public.project_cards
FOR UPDATE
USING (
  created_by = auth.uid() OR public.user_has_card_access(auth.uid(), id)
);

-- DELETE: allow creator and users with access function
CREATE POLICY "Cards delete by access or creator"
ON public.project_cards
FOR DELETE
USING (
  created_by = auth.uid() OR public.user_has_card_access(auth.uid(), id)
);
