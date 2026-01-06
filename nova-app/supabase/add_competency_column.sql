-- Add competency column to icfes_questions table
ALTER TABLE icfes_questions 
ADD COLUMN IF NOT EXISTS competency TEXT;

-- Optional: Add a check constraint to ensure valid competencies
-- ALTER TABLE icfes_questions ADD CONSTRAINT check_competency CHECK (competency IN ('Interpretativa', 'Argumentativa', 'Propositiva', 'Lexical', 'Gramatical', 'Pragmática'));

COMMENT ON COLUMN icfes_questions.competency IS 'The specific skill evaluated: Interpretativa, Argumentativa, Propositiva, etc.';
