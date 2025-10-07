-- Ensure RLS and correct policies on project_cards
ALTER TABLE public.project_cards ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'project_cards' AND policyname = 'Project cards select via fn'
  ) THEN
    CREATE POLICY "Project cards select via fn"
    ON public.project_cards
    FOR SELECT
    USING (public.user_has_card_access(auth.uid(), id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'project_cards' AND policyname = 'Project cards insert via list permission'
  ) THEN
    CREATE POLICY "Project cards insert via list permission"
    ON public.project_cards
    FOR INSERT
    WITH CHECK (public.user_can_manage_card_on_list(auth.uid(), list_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'project_cards' AND policyname = 'Project cards update via fn'
  ) THEN
    CREATE POLICY "Project cards update via fn"
    ON public.project_cards
    FOR UPDATE
    USING (public.user_has_card_access(auth.uid(), id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'project_cards' AND policyname = 'Project cards delete via fn'
  ) THEN
    CREATE POLICY "Project cards delete via fn"
    ON public.project_cards
    FOR DELETE
    USING (public.user_has_card_access(auth.uid(), id));
  END IF;
END $$;