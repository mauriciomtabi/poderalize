-- Enable realtime for project_cards table
ALTER TABLE public.project_cards REPLICA IDENTITY FULL;

-- Add project_cards to realtime publication if not already there
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'project_cards'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_cards;
  END IF;
END $$;