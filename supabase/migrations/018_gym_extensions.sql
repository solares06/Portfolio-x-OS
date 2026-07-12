-- gym_extensions

-- Templates
CREATE TABLE IF NOT EXISTS public.gym_workout_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gym_workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout templates" 
  ON public.gym_workout_templates 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.gym_workout_template_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.gym_workout_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets_reps_string TEXT NOT NULL,
  intensity TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

ALTER TABLE public.gym_workout_template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own template exercises"
  ON public.gym_workout_template_exercises
  FOR ALL
  USING (
    template_id IN (
      SELECT id FROM public.gym_workout_templates WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM public.gym_workout_templates WHERE user_id = auth.uid()
    )
  );

-- Settings
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  cycle_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cycle_length_weeks INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own gym settings"
  ON public.gym_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
