-- =============================================================================
-- Extracurricular Tables — Supabase Postgres Migration
-- =============================================================================

-- 1. ec_directives
CREATE TABLE IF NOT EXISTS public.ec_directives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('deadline', 'meeting', 'task')),
  title       TEXT NOT NULL,
  detail      TEXT,
  due_label   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ec_directives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ec_directives"
  ON public.ec_directives
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ec_directives_user ON public.ec_directives(user_id);

-- 2. ec_sponsorship_stats
CREATE TABLE IF NOT EXISTS public.ec_sponsorship_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  target_amount   TEXT NOT NULL,
  active_leads    TEXT NOT NULL,
  conversion_rate TEXT NOT NULL,
  event_readiness TEXT NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ec_sponsorship_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ec_sponsorship_stats"
  ON public.ec_sponsorship_stats
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ec_sponsorship_stats_user ON public.ec_sponsorship_stats(user_id);

-- 3. ec_team_members
CREATE TABLE IF NOT EXISTS public.ec_team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  email      TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ec_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ec_team_members"
  ON public.ec_team_members
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ec_team_members_user ON public.ec_team_members(user_id);

-- 4. ec_archive
CREATE TABLE IF NOT EXISTS public.ec_archive (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  image_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ec_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ec_archive"
  ON public.ec_archive
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ec_archive_user ON public.ec_archive(user_id);

-- Apply auto-update trigger for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ec_sponsorship_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- Seed Data
-- =============================================================================
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    -- Clear previous seed
    DELETE FROM public.ec_directives WHERE user_id = v_user_id;
    DELETE FROM public.ec_sponsorship_stats WHERE user_id = v_user_id;
    DELETE FROM public.ec_team_members WHERE user_id = v_user_id;
    DELETE FROM public.ec_archive WHERE user_id = v_user_id;

    -- Seed Directives
    INSERT INTO public.ec_directives (user_id, type, title, detail, due_label) VALUES 
    (v_user_id, 'deadline', 'Submit Sponsorship Proposal to TechCorp', 'Assigned to: Lead Team', 'DEADLINE: T-24H'),
    (v_user_id, 'meeting', 'Core Committee Sync', 'Room 4B', '18:00 HRS'),
    (v_user_id, 'task', 'Update Member Roster', NULL, NULL);

    -- Seed Stats
    INSERT INTO public.ec_sponsorship_stats (user_id, target_amount, active_leads, conversion_rate, event_readiness) VALUES
    (v_user_id, '$45K', '24', '18%', '82%');

    -- Seed Team
    INSERT INTO public.ec_team_members (user_id, name, role, email, avatar_url) VALUES
    (v_user_id, 'Alex Vance', 'Head of Sponsorships', 'alex@example.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'),
    (v_user_id, 'Sarah Jenks', 'Event Coordinator', 'sarah@example.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'),
    (v_user_id, 'Marcus Kane', 'Technical Lead', 'marcus@example.com', NULL);

    -- Seed Archive
    INSERT INTO public.ec_archive (user_id, title, image_url) VALUES
    (v_user_id, 'Pitch_Day_01.raw', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'),
    (v_user_id, 'Hackathon_Night.raw', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400');
  END IF;
END $$;
