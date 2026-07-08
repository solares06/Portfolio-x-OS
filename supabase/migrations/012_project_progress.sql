-- Migration 012: Add progress column to projects table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'projects'
          AND column_name = 'progress'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN progress INTEGER NOT NULL DEFAULT 50;
    END IF;
END $$;
