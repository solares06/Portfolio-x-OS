-- Study Topics Table
CREATE TABLE IF NOT EXISTS study_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, -- 'ml', 'dsa', or 'web-dev'
  title TEXT NOT NULL,
  source_name TEXT,
  source_url TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Study Subtopics Table
CREATE TABLE IF NOT EXISTS study_subtopics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES study_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Study Projects Table
CREATE TABLE IF NOT EXISTS study_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, -- 'ml' or 'web-dev'
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'Planning', -- 'Planning', 'In Progress', 'Completed'
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_projects ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own study topics" ON study_topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study topics" ON study_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study topics" ON study_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study topics" ON study_topics FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own study subtopics" ON study_subtopics FOR SELECT USING (
  topic_id IN (SELECT id FROM study_topics WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert their own study subtopics" ON study_subtopics FOR INSERT WITH CHECK (
  topic_id IN (SELECT id FROM study_topics WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update their own study subtopics" ON study_subtopics FOR UPDATE USING (
  topic_id IN (SELECT id FROM study_topics WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete their own study subtopics" ON study_subtopics FOR DELETE USING (
  topic_id IN (SELECT id FROM study_topics WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view their own study projects" ON study_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own study projects" ON study_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own study projects" ON study_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own study projects" ON study_projects FOR DELETE USING (auth.uid() = user_id);

-- Optional trigger to auto-update 'updated_at' on topics and projects
CREATE OR REPLACE FUNCTION update_study_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_topics_modtime
  BEFORE UPDATE ON study_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_study_updated_at_column();

CREATE TRIGGER update_study_projects_modtime
  BEFORE UPDATE ON study_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_study_updated_at_column();
