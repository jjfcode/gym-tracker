-- Create custom_exercises table for user-created exercises
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  muscle_groups TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT NOT NULL DEFAULT 'bodyweight',
  instructions_en TEXT NOT NULL DEFAULT '',
  instructions_es TEXT NOT NULL DEFAULT '',
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_compound BOOLEAN NOT NULL DEFAULT false,
  variations TEXT[] DEFAULT '{}',
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, slug)
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_custom_exercises_user_id ON public.custom_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_muscle_groups ON public.custom_exercises USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_equipment ON public.custom_exercises(equipment);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_difficulty ON public.custom_exercises(difficulty_level);

-- Enable Row Level Security
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_exercises table
CREATE POLICY "Users can view own custom exercises" ON public.custom_exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom exercises" ON public.custom_exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom exercises" ON public.custom_exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom exercises" ON public.custom_exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_custom_exercises_updated_at 
  BEFORE UPDATE ON public.custom_exercises 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();