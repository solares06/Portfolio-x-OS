-- 020_public_portfolio.sql

-- 1. portfolio_posts
CREATE TABLE IF NOT EXISTS public.portfolio_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content_mdx TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts"
  ON public.portfolio_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Users can manage their own posts"
  ON public.portfolio_posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.portfolio_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. portfolio_reading_list
CREATE TABLE IF NOT EXISTS public.portfolio_reading_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL CHECK (status IN ('reading', 'read')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_reading_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reading list"
  ON public.portfolio_reading_list FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their reading list"
  ON public.portfolio_reading_list FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 3. portfolio_page_views
CREATE TABLE IF NOT EXISTS public.portfolio_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_page_views ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert (for tracking) and view
CREATE POLICY "Public can insert page views"
  ON public.portfolio_page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view page views"
  ON public.portfolio_page_views FOR SELECT
  USING (true);


-- 4. portfolio_guestbook
CREATE TABLE IF NOT EXISTS public.portfolio_guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_guestbook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view guestbook"
  ON public.portfolio_guestbook FOR SELECT
  USING (true);

CREATE POLICY "Public can insert into guestbook"
  ON public.portfolio_guestbook FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage guestbook"
  ON public.portfolio_guestbook FOR ALL
  USING (auth.role() = 'authenticated');
