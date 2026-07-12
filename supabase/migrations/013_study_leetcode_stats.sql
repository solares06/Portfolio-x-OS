-- Migration 013: Add study_leetcode_stats table
CREATE TABLE IF NOT EXISTS public.study_leetcode_stats (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  count          INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.study_leetcode_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own leetcode stats" ON public.study_leetcode_stats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
