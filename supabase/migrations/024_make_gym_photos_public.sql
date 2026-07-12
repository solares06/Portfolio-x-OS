-- Make gym-photos bucket public so getPublicUrl works
UPDATE storage.buckets
SET public = true
WHERE id = 'gym-photos';

-- Allow everyone to view photos (if it's public, they should be able to read without auth if they have the URL, but let's just make it public)
CREATE POLICY "Public can view gym photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'gym-photos');
