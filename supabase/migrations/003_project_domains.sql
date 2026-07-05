-- =============================================================================
-- 9. project_domains
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_domains (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  icon         TEXT,
  status_label TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own project domains"
  ON public.project_domains
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_project_domains_user ON public.project_domains(user_id);

-- =============================================================================
-- Add domain_id to projects
-- =============================================================================
ALTER TABLE public.projects 
ADD COLUMN domain_id UUID REFERENCES public.project_domains(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_domain ON public.projects(domain_id);

-- =============================================================================
-- Seed Domains
-- =============================================================================
DO $$
DECLARE
  v_user_id UUID;
  v_web_id UUID;
  v_ai_id UUID;
  v_hw_id UUID;
  v_res_id UUID;
BEGIN
  -- Get the first user in the database (local dev environment)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Delete existing domains if any (for idempotency in local dev)
    DELETE FROM public.project_domains WHERE user_id = v_user_id;

    -- Seed 4 domains
    INSERT INTO public.project_domains (user_id, name, icon, status_label) VALUES 
    (v_user_id, 'Web Development', 'Code', 'HEALTHY') RETURNING id INTO v_web_id;
    
    INSERT INTO public.project_domains (user_id, name, icon, status_label) VALUES 
    (v_user_id, 'AI & Analytics', 'BrainCircuit', 'TRAINING') RETURNING id INTO v_ai_id;
    
    INSERT INTO public.project_domains (user_id, name, icon, status_label) VALUES 
    (v_user_id, 'Hardware & IoT', 'Cpu', 'IDLE') RETURNING id INTO v_hw_id;
    
    INSERT INTO public.project_domains (user_id, name, icon, status_label) VALUES 
    (v_user_id, 'Research', 'FlaskConical', 'HEALTHY') RETURNING id INTO v_res_id;
    
    -- Also update existing projects to belong to Web Development by default
    UPDATE public.projects SET domain_id = v_web_id WHERE user_id = v_user_id AND domain_id IS NULL;
  END IF;
END $$;
