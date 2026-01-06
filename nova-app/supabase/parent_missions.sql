-- Table for parent-assigned missions
CREATE TABLE IF NOT EXISTS parent_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES auth.users(id),
    student_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    reward_coins INTEGER DEFAULT 50,
    reward_xp INTEGER DEFAULT 100,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE parent_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their students' missions"
    ON parent_missions
    FOR ALL
    TO authenticated
    USING (
        parent_id = auth.uid() OR student_id = auth.uid()
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_parent_missions_student ON parent_missions(student_id);
