-- Add technique_tip column to icfes_questions table
ALTER TABLE icfes_questions 
ADD COLUMN IF NOT EXISTS technique_tip TEXT;
