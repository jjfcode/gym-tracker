-- Add onboarding fields to profile table
-- Run this in Supabase SQL Editor to add missing onboarding fields

-- Add missing onboarding columns to profile table
ALTER TABLE public.profile 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS fitness_goal TEXT CHECK (fitness_goal IN ('Weight Loss', 'Muscle Gain', 'General Fitness', 'Endurance', 'Strength')),
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
ADD COLUMN IF NOT EXISTS workout_frequency INTEGER CHECK (workout_frequency >= 1 AND workout_frequency <= 7),
ADD COLUMN IF NOT EXISTS weight NUMERIC(6,2) CHECK (weight > 0 AND weight < 1000),
ADD COLUMN IF NOT EXISTS height NUMERIC(6,2) CHECK (height > 0 AND height < 300);

-- Update the updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profile table
DROP TRIGGER IF EXISTS update_profile_updated_at ON public.profile;
CREATE TRIGGER update_profile_updated_at
    BEFORE UPDATE ON public.profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profile' 
  AND table_schema = 'public'
ORDER BY ordinal_position;