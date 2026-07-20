-- Migration 028: Weekly Study Goals
-- Task board for weekly study planning (intern season prep)

CREATE TABLE IF NOT EXISTS public.study_weekly_goals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own weekly study goals"
  ON public.study_weekly_goals
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast weekly queries
CREATE INDEX IF NOT EXISTS idx_study_weekly_goals_user_week 
  ON public.study_weekly_goals(user_id, week_start);
