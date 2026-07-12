-- =============================================================================
-- Gym Photos — Supabase Postgres Migration
-- =============================================================================

-- 1. Add photo_url to body_metrics
ALTER TABLE public.body_metrics
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Create the storage bucket for gym photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gym-photos', 'gym-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS for storage.objects on the gym-photos bucket
-- Allow authenticated users to view their own photos
CREATE POLICY "Users can view their own gym photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'gym-photos' AND auth.uid() = owner);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own gym photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gym-photos' AND auth.uid() = owner);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own gym photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gym-photos' AND auth.uid() = owner);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own gym photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'gym-photos' AND auth.uid() = owner);
