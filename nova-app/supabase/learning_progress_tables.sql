-- supabase/learning_progress_tables.sql
-- Tables for tracking pedagogical quest progress

-- Table for individual quest completions
CREATE TABLE IF NOT EXISTS quest_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    quest_title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('math', 'science', 'language')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    was_correct BOOLEAN NOT NULL,
    coins_earned INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for aggregated learning progress
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    total_quests_completed INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    quests_by_category JSONB DEFAULT '{"math": 0, "science": 0, "language": 0}'::jsonb,
    quests_by_difficulty JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}'::jsonb,
    accuracy_rate INTEGER DEFAULT 0,
    last_completed_date TIMESTAMP WITH TIME ZONE,
    unlocked_badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quest_completions_user_id ON quest_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_completions_completed_at ON quest_completions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quest_completions_category ON quest_completions(category);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own quest completions
CREATE POLICY "Users can view own quest completions"
    ON quest_completions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own quest completions
CREATE POLICY "Users can insert own quest completions"
    ON quest_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only see their own learning progress
CREATE POLICY "Users can view own learning progress"
    ON learning_progress FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert/update their own learning progress
CREATE POLICY "Users can upsert own learning progress"
    ON learning_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress"
    ON learning_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_learning_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_learning_progress_timestamp
    BEFORE UPDATE ON learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_progress_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT ON quest_completions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON learning_progress TO authenticated;

COMMENT ON TABLE quest_completions IS 'Records of individual pedagogical quest completions';
COMMENT ON TABLE learning_progress IS 'Aggregated learning progress statistics for users';
