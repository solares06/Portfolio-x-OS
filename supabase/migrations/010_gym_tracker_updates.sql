-- Migration 010: Gym Tracker Updates
-- Adds a JSONB column to gym_sets to store the set logging data (kg, reps, rpe, completed)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                     AND table_name = 'gym_sets' 
                     AND column_name = 'logs') THEN
                     
        ALTER TABLE public.gym_sets ADD COLUMN logs JSONB DEFAULT '[]'::jsonb;
        
    END IF;
END $$;
