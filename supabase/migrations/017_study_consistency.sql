-- study_consistency_logs

CREATE TABLE IF NOT EXISTS public.study_consistency_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE public.study_consistency_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study consistency logs" 
  ON public.study_consistency_logs 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);
