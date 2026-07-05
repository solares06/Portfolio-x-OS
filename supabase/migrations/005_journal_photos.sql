-- =============================================================================
-- Journal Photos — Supabase Postgres Migration
-- =============================================================================

-- 1. Add photos array to journal_entries
ALTER TABLE public.journal_entries
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Create the storage bucket for journal photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-photos', 'journal-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS for storage.objects on the journal-photos bucket
-- Allow authenticated users to view their own photos
CREATE POLICY "Users can view their own journal photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'journal-photos' AND auth.uid() = owner);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own journal photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'journal-photos' AND auth.uid() = owner);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own journal photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'journal-photos' AND auth.uid() = owner);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own journal photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'journal-photos' AND auth.uid() = owner);
