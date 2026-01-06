-- Migration: Add Teacher Reporting System
-- Created: 2026-01-04
-- Description: Creates tables for teachers, schools, and automated reporting

-- ============================================
-- 1. SCHOOLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT,
    country TEXT DEFAULT 'Colombia',
    subscription_type TEXT CHECK (subscription_type IN ('basic', 'premium', 'enterprise')),
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_schools_name ON schools(name);

-- ============================================
-- 2. TEACHERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    grade_level TEXT, -- '1', '2', '3', '4', '5', or 'all'
    subjects TEXT[], -- ['math', 'english', 'science', 'all']
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_school ON teachers(school_id);

-- ============================================
-- 3. UPDATE PROFILES TABLE
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS teacher_email TEXT,
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

-- Index for teacher lookups
CREATE INDEX IF NOT EXISTS idx_profiles_teacher_email ON profiles(teacher_email);

-- ============================================
-- 4. STUDENT-TEACHER ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS student_teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
    subject TEXT, -- 'math', 'english', 'science', 'all'
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(student_id, teacher_id, subject)
);

-- Indexes
CREATE INDEX idx_assignments_student ON student_teacher_assignments(student_id);
CREATE INDEX idx_assignments_teacher ON student_teacher_assignments(teacher_id);

-- ============================================
-- 5. TEACHER REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teacher_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- General Metrics
    total_study_time_minutes INTEGER DEFAULT 0,
    active_days INTEGER DEFAULT 0,
    topics_studied INTEGER DEFAULT 0,
    average_comprehension DECIMAL(5,2), -- 0-100
    
    -- Subject Breakdown (JSONB for flexibility)
    math_metrics JSONB DEFAULT '{}'::jsonb,
    english_metrics JSONB DEFAULT '{}'::jsonb,
    science_metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Strengths and Improvements
    strengths JSONB DEFAULT '[]'::jsonb, -- [{ topic, score, subject }]
    areas_for_improvement JSONB DEFAULT '[]'::jsonb, -- [{ topic, score, recommendation, subject }]
    
    -- Study Patterns
    study_patterns JSONB DEFAULT '{}'::jsonb, -- { preferred_hours, consistency_score, engagement_level }
    
    -- AI-Generated Recommendations
    ai_recommendations JSONB DEFAULT '[]'::jsonb, -- [{ priority, topic, recommendation }]
    
    -- Report Status
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id, teacher_id, week_start)
);

-- Indexes
CREATE INDEX idx_reports_student ON teacher_reports(student_id);
CREATE INDEX idx_reports_teacher ON teacher_reports(teacher_id);
CREATE INDEX idx_reports_week ON teacher_reports(week_start, week_end);
CREATE INDEX idx_reports_sent ON teacher_reports(sent_at);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_reports ENABLE ROW LEVEL SECURITY;

-- Schools: Only admins can manage
CREATE POLICY "Admins can manage schools"
ON schools FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
);

-- Teachers: Can view their own data
CREATE POLICY "Teachers can view own data"
ON teachers FOR SELECT
USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
);

-- Assignments: Teachers can view their assignments
CREATE POLICY "Teachers can view their assignments"
ON student_teacher_assignments FOR SELECT
USING (
    teacher_id IN (
        SELECT id FROM teachers WHERE email = (
            SELECT email FROM profiles WHERE id = auth.uid()
        )
    )
    OR
    student_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
);

-- Reports: Teachers can view reports for their students
CREATE POLICY "Teachers can view their student reports"
ON teacher_reports FOR SELECT
USING (
    teacher_id IN (
        SELECT id FROM teachers WHERE email = (
            SELECT email FROM profiles WHERE id = auth.uid()
        )
    )
    OR
    student_id = auth.uid()
    OR
    student_id IN (
        SELECT id FROM profiles WHERE parent_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
);

-- ============================================
-- 7. FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample school
INSERT INTO schools (name, city, country, subscription_type, contact_email)
VALUES ('Colegio Demo', 'Bogotá', 'Colombia', 'basic', 'demo@colegio.edu.co')
ON CONFLICT DO NOTHING;

-- Insert sample teacher
INSERT INTO teachers (name, email, grade_level, subjects)
VALUES ('Profesor Demo', 'profesor@demo.com', '4', ARRAY['math', 'english'])
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE schools IS 'Educational institutions using Nova Schola';
COMMENT ON TABLE teachers IS 'Teachers who receive automated progress reports';
COMMENT ON TABLE student_teacher_assignments IS 'Links students to their teachers';
COMMENT ON TABLE teacher_reports IS 'Automated weekly progress reports for teachers';
