-- Migration 016: Add spaced repetition columns to study_subtopics

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'study_subtopics'
          AND column_name = 'last_reviewed'
    ) THEN
        ALTER TABLE public.study_subtopics ADD COLUMN last_reviewed TIMESTAMPTZ;
        ALTER TABLE public.study_subtopics ADD COLUMN next_review TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
        ALTER TABLE public.study_subtopics ADD COLUMN interval_days INTEGER DEFAULT 0;
        ALTER TABLE public.study_subtopics ADD COLUMN ease_factor REAL DEFAULT 2.5;

        -- Update existing subtopics to be due immediately
        UPDATE public.study_subtopics SET next_review = timezone('utc'::text, now()) WHERE next_review IS NULL;
    END IF;
END $$;
