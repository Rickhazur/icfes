-- Create or Update players_presence table to include avatar details AND grade
CREATE TABLE IF NOT EXISTS players_presence (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    current_view TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    avatar_id TEXT,
    equipped_accessories JSONB,
    grade INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Defensive columns additions
ALTER TABLE players_presence ADD COLUMN IF NOT EXISTS avatar_id TEXT;
ALTER TABLE players_presence ADD COLUMN IF NOT EXISTS equipped_accessories JSONB;
ALTER TABLE players_presence ADD COLUMN IF NOT EXISTS grade INTEGER DEFAULT 1;

-- Enable RLS
ALTER TABLE players_presence ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view presence" ON players_presence;
CREATE POLICY "Public can view presence" ON players_presence FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own presence" ON players_presence;
CREATE POLICY "Users can insert own presence" ON players_presence FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own presence" ON players_presence;
CREATE POLICY "Users can update own presence" ON players_presence FOR UPDATE USING (auth.uid() = user_id);

-- Cleanup function for old presence
CREATE OR REPLACE FUNCTION clean_old_presence()
RETURNS void AS $$
BEGIN
    DELETE FROM players_presence WHERE last_seen < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
