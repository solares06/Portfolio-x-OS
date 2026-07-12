-- 022_extracurricular_extensions.sql

-- 1. Create the storage bucket for extracurricular archives
INSERT INTO storage.buckets (id, name, public)
VALUES ('ec-archive', 'ec-archive', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage.objects on the ec-archive bucket
CREATE POLICY "Public can view ec-archive"
ON storage.objects FOR SELECT
USING (bucket_id = 'ec-archive');

CREATE POLICY "Users can upload to ec-archive"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ec-archive' AND auth.uid() = owner);

CREATE POLICY "Users can update their ec-archive"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ec-archive' AND auth.uid() = owner);

CREATE POLICY "Users can delete their ec-archive"
ON storage.objects FOR DELETE
USING (bucket_id = 'ec-archive' AND auth.uid() = owner);

-- 2. Sponsor Pipeline
CREATE TABLE IF NOT EXISTS public.ec_sponsor_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Lead', 'Contacted', 'Negotiating', 'Secured', 'Rejected')),
  amount TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ec_sponsor_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sponsor pipeline"
  ON public.ec_sponsor_pipeline FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_ec_sponsor_updated_at BEFORE UPDATE ON public.ec_sponsor_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Meeting Notes
CREATE TABLE IF NOT EXISTS public.ec_meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ec_meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meeting notes"
  ON public.ec_meeting_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_ec_meeting_notes_updated_at BEFORE UPDATE ON public.ec_meeting_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
