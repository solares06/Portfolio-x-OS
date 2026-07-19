-- Migration 025: Study Nexus Overhaul
-- Adds subject types, deadlines system, and class test tracking

-- 1. Add 'type' column to study_classes
ALTER TABLE public.study_classes 
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'theory' 
  CHECK (type IN ('theory', 'lab', 'minor_project', 'major_project'));

-- 2. Study Deadlines table (tasks/assignments under each subject)
CREATE TABLE IF NOT EXISTS public.study_deadlines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id   UUID NOT NULL REFERENCES public.study_classes(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  due_date   DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study deadlines" 
  ON public.study_deadlines FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- 3. Study Class Tests table (CT1 and CT2 per theory subject)
CREATE TABLE IF NOT EXISTS public.study_class_tests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id       UUID NOT NULL REFERENCES public.study_classes(id) ON DELETE CASCADE,
  ct_number      INTEGER NOT NULL CHECK (ct_number IN (1, 2)),
  date           DATE,
  max_marks      INTEGER DEFAULT 30,
  marks_obtained INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, ct_number)
);

ALTER TABLE public.study_class_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own study class tests" 
  ON public.study_class_tests FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);
