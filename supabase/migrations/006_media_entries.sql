-- =============================================================================
-- Media Entries — Supabase Postgres Migration
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.media_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('book', 'movie')),
  status      TEXT NOT NULL CHECK (status IN ('watched', 'watching', 'watchlist')),
  rating      NUMERIC(3,1),
  cover_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_entries ENABLE ROW LEVEL SECURITY;

-- Readable by anyone
CREATE POLICY "Media entries are viewable by everyone"
  ON public.media_entries
  FOR SELECT
  USING (true);

-- Writable only by the owner
CREATE POLICY "Users can insert their own media entries"
  ON public.media_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media entries"
  ON public.media_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media entries"
  ON public.media_entries
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_media_entries_user ON public.media_entries(user_id);

-- Seed data for media_entries
INSERT INTO public.media_entries (user_id, title, type, status, rating, cover_url)
VALUES
  ((SELECT id FROM auth.users LIMIT 1), 'The Pragmatic Programmer', 'book', 'watched', 5.0, 'https://picsum.photos/seed/pragprog/300/400'),
  ((SELECT id FROM auth.users LIMIT 1), 'Dune', 'movie', 'watched', 4.5, 'https://picsum.photos/seed/dune/300/400'),
  ((SELECT id FROM auth.users LIMIT 1), 'Designing Data-Intensive Applications', 'book', 'watching', NULL, 'https://picsum.photos/seed/ddia/300/400'),
  ((SELECT id FROM auth.users LIMIT 1), 'Blade Runner 2049', 'movie', 'watchlist', NULL, 'https://picsum.photos/seed/br2049/300/400')
ON CONFLICT DO NOTHING;
