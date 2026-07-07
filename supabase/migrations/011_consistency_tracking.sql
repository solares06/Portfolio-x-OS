-- Migration 011: Consistency Tracking
-- Table to track dates the user successfully worked out

CREATE TABLE IF NOT EXISTS public.gym_consistency_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    cycle_id INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- RLS Policies
ALTER TABLE public.gym_consistency_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consistency logs"
    ON public.gym_consistency_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consistency logs"
    ON public.gym_consistency_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consistency logs"
    ON public.gym_consistency_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consistency logs"
    ON public.gym_consistency_logs FOR DELETE
    USING (auth.uid() = user_id);
