-- Add avatar_url field to leads and clientes tables if not exists
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for lead and client avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-avatars', 'lead-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for lead avatars
CREATE POLICY "Anyone can view lead avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-avatars');

CREATE POLICY "Authenticated users can upload lead avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lead-avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their lead avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lead-avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their lead avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lead-avatars' 
  AND auth.role() = 'authenticated'
);