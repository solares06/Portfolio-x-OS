-- Create os_profile table
CREATE TABLE IF NOT EXISTS os_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url TEXT
);

-- Enable RLS
ALTER TABLE os_profile ENABLE ROW LEVEL SECURITY;

-- Policies for os_profile
CREATE POLICY "Users can view their own profile" ON os_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON os_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON os_profile FOR UPDATE USING (auth.uid() = user_id);

-- Create vision_board table
CREATE TABLE IF NOT EXISTS vision_board (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE vision_board ENABLE ROW LEVEL SECURITY;

-- Policies for vision_board
CREATE POLICY "Users can view their own vision board" ON vision_board FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vision board images" ON vision_board FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vision board images" ON vision_board FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vision board images" ON vision_board FOR DELETE USING (auth.uid() = user_id);
