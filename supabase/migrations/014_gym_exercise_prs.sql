-- Migration 014: Add gym_exercise_prs table
CREATE TABLE IF NOT EXISTS public.gym_exercise_prs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name  TEXT NOT NULL,
  max_weight     NUMERIC(6,2) DEFAULT 0,
  max_reps       INTEGER DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_name)
);

ALTER TABLE public.gym_exercise_prs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own PRs" ON public.gym_exercise_prs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
