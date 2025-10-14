-- Create storage bucket for project attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-attachments',
  'project-attachments',
  true,
  52428800, -- 50MB limit
  ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/*', 'video/*', 'audio/*']
);

-- Policy: Authenticated users can upload attachments to their cards
CREATE POLICY "Users can upload project attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-attachments' AND
  (storage.foldername(name))[1] = 'projects'
);

-- Policy: Anyone can view public attachments
CREATE POLICY "Public read access to project attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-attachments');

-- Policy: Users can delete their own attachments
CREATE POLICY "Users can delete project attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-attachments' AND
  (storage.foldername(name))[1] = 'projects'
);

-- Policy: Users can update their own attachments
CREATE POLICY "Users can update project attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-attachments' AND
  (storage.foldername(name))[1] = 'projects'
);

-- Index for faster attachment queries
CREATE INDEX IF NOT EXISTS idx_project_cards_attachments 
ON project_cards USING gin ((custom_fields->'attachments'));