-- Real-time Presence Table
CREATE TABLE IF NOT EXISTS players_presence (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    user_name TEXT,
    avatar_url TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    current_view TEXT, -- dashboard, arena, shop, etc.
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0
);

-- Pet System Table
CREATE TABLE IF NOT EXISTS student_pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'dragon', 'robot', 'unicorn', etc.
    level INTEGER DEFAULT 1,
    hunger INTEGER DEFAULT 100,
    happiness INTEGER DEFAULT 100,
    last_fed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Learning Preferences for Personalized AI
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS learning_interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_animals TEXT[] DEFAULT '{}';

-- RLS
ALTER TABLE players_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see online players"
    ON players_presence FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own presence"
    ON players_presence FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Students can manage their pets"
    ON student_pets FOR ALL TO authenticated USING (auth.uid() = student_id);

-- Real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE players_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE student_pets;
