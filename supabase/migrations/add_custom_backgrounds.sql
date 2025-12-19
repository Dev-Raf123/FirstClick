-- Add background_url column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS background_url TEXT;

-- Add columns for background positioning/styling
ALTER TABLE projects ADD COLUMN IF NOT EXISTS background_position TEXT DEFAULT 'center';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS background_size TEXT DEFAULT 'cover';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS background_repeat TEXT DEFAULT 'no-repeat';

-- Create storage bucket for card backgrounds
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-backgrounds', 'card-backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for card backgrounds
CREATE POLICY "Users can upload their own backgrounds"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'card-backgrounds' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view backgrounds"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'card-backgrounds');

CREATE POLICY "Users can update their own backgrounds"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-backgrounds' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own backgrounds"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-backgrounds' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
