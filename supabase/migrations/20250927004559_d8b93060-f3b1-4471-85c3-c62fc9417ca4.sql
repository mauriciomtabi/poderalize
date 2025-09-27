-- Create negotiation temperature enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'negotiation_temperature') THEN
    CREATE TYPE negotiation_temperature AS ENUM (
      'muito_fraca',
      'fraca', 
      'mediana',
      'forte',
      'muito_forte'
    );
  END IF;
END $$;

-- Add negotiation temperature field to leads table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'temperatura_negociacao') THEN
    ALTER TABLE public.leads 
    ADD COLUMN temperatura_negociacao negotiation_temperature DEFAULT 'mediana';
  END IF;
END $$;

-- Create indexes only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_temperatura_negociacao') THEN
    CREATE INDEX idx_leads_temperatura_negociacao ON public.leads(temperatura_negociacao);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_follow_ups_data_agendada') THEN
    CREATE INDEX idx_follow_ups_data_agendada ON public.follow_ups(data_agendada);
  END IF;
END $$;