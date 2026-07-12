-- Create the storage bucket for portfolio media
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- Allow public access to read files
CREATE POLICY "Portfolio Media Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-media');

-- Allow authenticated users (the owner) to insert files
CREATE POLICY "Portfolio Media Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-media');

-- Allow authenticated users to update their files
CREATE POLICY "Portfolio Media Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-media');

-- Allow authenticated users to delete files
CREATE POLICY "Portfolio Media Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-media');
