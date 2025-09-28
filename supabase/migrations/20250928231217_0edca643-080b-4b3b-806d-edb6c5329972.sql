-- Add motivo_perda column to leads table
ALTER TABLE public.leads 
ADD COLUMN motivo_perda TEXT;