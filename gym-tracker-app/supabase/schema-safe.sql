-- Safe Database Schema for Supabase (without superuser-only commands)
-- This version removes commands that require superuser privileges

-- Create profile table
CREATE TABLE IF NOT EXISTS public.profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'es')),
  units TEXT DEFAULT 'imperial' CHECK (units IN ('metric', 'imperial')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weight_logs table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL,
  weight NUMERIC(6,2) NOT NULL CHECK (weight > 0 AND weight < 1000),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, measured_at)
);

-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_days_per_week INTEGER NOT NULL CHECK (goal_days_per_week BETWEEN 1 AND 7),
  plan_scope TEXT NOT NULL DEFAULT 'weekly' CHECK (plan_scope IN ('weekly', 'monthly')),
  start_date DATE NOT NULL,
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id BIGINT REFERENCES public.plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id BIGINT NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  machine_brand TEXT,
  order_index INTEGER DEFAULT 0,
  target_sets INTEGER DEFAULT 3 CHECK (target_sets > 0 AND target_sets <= 20),
  target_reps INTEGER DEFAULT 10 CHECK (target_reps > 0 AND target_reps <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercise_sets table
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_index INTEGER NOT NULL CHECK (set_index > 0),
  weight NUMERIC(6,2) CHECK (weight > 0),
  reps INTEGER CHECK (reps > 0 AND reps <= 100),
  rpe NUMERIC(3,1) CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON public.profile(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON public.plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_plan_id ON public.workouts(plan_id);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON public.exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_id ON public.exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_user_id ON public.exercise_sets(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile table
CREATE POLICY "Users can view own profile" ON public.profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profile
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for weight_logs table
CREATE POLICY "Users can view own weight logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs" ON public.weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs" ON public.weight_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs" ON public.weight_logs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for plans table
CREATE POLICY "Users can view own plans" ON public.plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON public.plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON public.plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON public.plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workouts table
CREATE POLICY "Users can view own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercises table
CREATE POLICY "Users can view own exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercises" ON public.exercises
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for exercise_sets table
CREATE POLICY "Users can view own exercise sets" ON public.exercise_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise sets" ON public.exercise_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise sets" ON public.exercise_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise sets" ON public.exercise_sets
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profile table
CREATE TRIGGER update_profile_updated_at 
  BEFORE UPDATE ON public.profile 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile (user_id, display_name, locale, units, theme)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'units', 'imperial'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'dark')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();