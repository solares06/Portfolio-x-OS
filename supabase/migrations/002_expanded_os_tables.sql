-- =============================================================================
-- Expanded OS Tables (Option B) — Supabase Postgres Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. body_metrics
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_value        NUMERIC(6,2),
  weight_unit         TEXT DEFAULT 'kg',
  weight_delta        TEXT,
  body_fat_value      NUMERIC(5,2),
  body_fat_unit       TEXT DEFAULT '%',
  body_fat_delta      TEXT,
  body_fat_progress   INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own body metrics" ON public.body_metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_body_metrics_user_date ON public.body_metrics(user_id, date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. study_classes (Replaces simple study_sessions for the Semester Tracker)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_classes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject          TEXT NOT NULL,
  instructor       TEXT,
  next_due         TEXT,
  next_due_label   TEXT,
  status           TEXT DEFAULT 'In Progress',
  notes            TEXT,
  color            TEXT DEFAULT 'primary',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study classes" ON public.study_classes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. study_workspaces
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_workspaces (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  icon           TEXT DEFAULT 'data_object',
  progress       INTEGER,
  leetcode_count INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study workspaces" ON public.study_workspaces FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. study_tasks
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_tasks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.study_workspaces(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  difficulty     TEXT, -- e.g. 'Hard', 'Medium'
  completed      BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study tasks" ON public.study_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. study_videos
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_videos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.study_workspaces(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  duration       TEXT,
  status         TEXT DEFAULT 'Up next', -- 'Watched', 'Playing'
  thumbnail_url  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study videos" ON public.study_videos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. study_notes
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_notes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.study_workspaces(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  excerpt        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study notes" ON public.study_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. study_messages
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.study_workspaces(id) ON DELETE CASCADE,
  sender_name    TEXT NOT NULL,
  time_ago       TEXT,
  content        TEXT NOT NULL,
  reply          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study messages" ON public.study_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. gym_weekly_splits
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gym_weekly_splits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  day_label      TEXT NOT NULL,
  type           TEXT NOT NULL,
  is_active      BOOLEAN DEFAULT FALSE,
  order_index    INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_weekly_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own gym weekly splits" ON public.gym_weekly_splits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. gym_workout_days
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gym_workout_days (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  day_id         TEXT NOT NULL,
  title          TEXT NOT NULL,
  duration       TEXT,
  intensity      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_workout_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own gym workout days" ON public.gym_workout_days FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. gym_exercises
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gym_exercises (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_day_id UUID REFERENCES public.gym_workout_days(id) ON DELETE CASCADE,
  order_index    TEXT,
  name           TEXT NOT NULL,
  target         TEXT,
  is_faded       BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own gym exercises" ON public.gym_exercises FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. gym_sets
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gym_sets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id    UUID REFERENCES public.gym_exercises(id) ON DELETE CASCADE,
  label          TEXT NOT NULL,
  details        TEXT,
  is_active      BOOLEAN DEFAULT FALSE,
  is_faded       BOOLEAN DEFAULT FALSE,
  order_index    INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own gym sets" ON public.gym_sets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
