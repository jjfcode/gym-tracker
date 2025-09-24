-- COMPLETE GYM TRACKER DATABASE SCHEMA
-- This file contains everything needed for the gym tracker app
-- Run this once in Supabase SQL Editor

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Create profile table
CREATE TABLE IF NOT EXISTS public.profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  locale TEXT DEFAULT 'en' CHECK (locale IN ('en', 'es')),
  units TEXT DEFAULT 'imperial' CHECK (units IN ('metric', 'imperial')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weight_logs table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(6,2) NOT NULL CHECK (weight > 0 AND weight < 1000),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, measured_at)
);

-- Create weight_entries table (alias/view for weight_logs)
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(6,2) NOT NULL CHECK (weight > 0 AND weight < 1000),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
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

-- Create workouts table with all required columns
CREATE TABLE IF NOT EXISTS public.workouts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id BIGINT REFERENCES public.plans(id) ON DELETE CASCADE,
  template_id BIGINT,
  date DATE DEFAULT CURRENT_DATE,
  title TEXT DEFAULT '',
  name TEXT DEFAULT '', -- Required by app
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'skipped', 'in_progress')),
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing workouts table (simple migration)
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned';
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS template_id BIGINT;

-- Remove NOT NULL constraint from date column to allow defaults
ALTER TABLE public.workouts ALTER COLUMN date DROP NOT NULL;
ALTER TABLE public.workouts ALTER COLUMN date SET DEFAULT CURRENT_DATE;
ALTER TABLE public.workouts ALTER COLUMN title DROP NOT NULL;
ALTER TABLE public.workouts ALTER COLUMN title SET DEFAULT '';

-- Drop unique constraint that might prevent multiple workouts per day
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_user_id_date_key;

-- Create exercises table (exercise definitions/library) - MOVED UP
CREATE TABLE IF NOT EXISTS public.exercises (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  machine_brand TEXT,
  category TEXT DEFAULT 'strength',
  muscle_groups TEXT[],
  primary_muscles TEXT[],
  secondary_muscles TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system equipment
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  model TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  maintenance_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint for equipment slugs per user (similar to exercises)
ALTER TABLE public.equipment DROP CONSTRAINT IF EXISTS equipment_user_id_slug_key;

-- Only add the constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'equipment_user_id_slug_unique' 
        AND table_name = 'equipment'
    ) THEN
        ALTER TABLE public.equipment ADD CONSTRAINT equipment_user_id_slug_unique UNIQUE (user_id, slug);
    END IF;
END $$;

-- Create workout_exercises table (link workouts to exercises) - MOVED UP
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id BIGINT NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  target_sets INTEGER DEFAULT 3 CHECK (target_sets > 0 AND target_sets <= 20),
  target_reps INTEGER DEFAULT 10 CHECK (target_reps > 0 AND target_reps <= 100),
  target_weight NUMERIC(6,2),
  rest_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercise_sets table - MOVED UP AND FIXED
CREATE TABLE IF NOT EXISTS public.exercise_sets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_exercise_id BIGINT NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_index INTEGER NOT NULL CHECK (set_index > 0),
  weight NUMERIC(6,2) CHECK (weight > 0),
  reps INTEGER CHECK (reps > 0 AND reps <= 100),
  rpe NUMERIC(3,1) CHECK (rpe >= 1 AND rpe <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix exercises table to be exercise definitions instead of workout-specific
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_workout_id_fkey;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS workout_id;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS order_index;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS target_sets;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS target_reps;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'strength';
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS muscle_groups TEXT[];
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS primary_muscles TEXT[];
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS secondary_muscles TEXT[];
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id nullable for system exercises
ALTER TABLE public.exercises ALTER COLUMN user_id DROP NOT NULL;

-- Add timezone column to existing profile table if it doesn't exist
ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add unique constraint for exercise slugs per user
ALTER TABLE public.exercises DROP CONSTRAINT IF EXISTS exercises_user_id_slug_key;

-- Only add the constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'exercises_user_id_slug_unique' 
        AND table_name = 'exercises'
    ) THEN
        ALTER TABLE public.exercises ADD CONSTRAINT exercises_user_id_slug_unique UNIQUE (user_id, slug);
    END IF;
END $$;

-- Update existing records to have proper names and status
UPDATE public.workouts 
SET name = COALESCE(NULLIF(name, ''), title, 'Workout'),
    status = COALESCE(status, CASE WHEN is_completed = true THEN 'completed' ELSE 'planned' END),
    date = COALESCE(date, CURRENT_DATE),
    title = COALESCE(NULLIF(title, ''), name, 'Workout')
WHERE name = '' OR name IS NULL OR status IS NULL OR date IS NULL OR title = '' OR title IS NULL;

-- Update status constraint to include in_progress
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_status_check;

-- Only add the constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workouts_status_check' 
        AND table_name = 'workouts'
    ) THEN
        ALTER TABLE public.workouts ADD CONSTRAINT workouts_status_check CHECK (status IN ('planned', 'active', 'completed', 'skipped', 'in_progress'));
    END IF;
END $$;

-- =====================================================
-- WORKOUT TEMPLATE TABLES
-- =====================================================

-- Create workout_templates table
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create template_exercises table
CREATE TABLE IF NOT EXISTS public.template_exercises (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id BIGINT NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id BIGINT NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  target_sets INTEGER DEFAULT 3 CHECK (target_sets > 0 AND target_sets <= 20),
  target_reps INTEGER DEFAULT 10 CHECK (target_reps > 0 AND target_reps <= 100),
  target_weight NUMERIC(6,2),
  rest_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLANNING TABLES
-- =====================================================

-- Create workout_schedules table
CREATE TABLE IF NOT EXISTS public.workout_schedules (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  time_of_day TIME,
  is_active BOOLEAN DEFAULT TRUE,
  exercises JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create planned_workouts table
CREATE TABLE IF NOT EXISTS public.planned_workouts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_id BIGINT REFERENCES public.workout_schedules(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  exercises JSONB DEFAULT '[]'::JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- =====================================================
-- SECURITY TABLES
-- =====================================================

-- Create security_events table
CREATE TABLE IF NOT EXISTS public.security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('failed_login', 'suspicious_activity', 'rate_limit_exceeded', 'invalid_token')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON public.profile(user_id);

-- Weight logs indexes
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, measured_at DESC);

-- Weight entries indexes
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON public.weight_entries(user_id, date DESC);

-- Plans indexes
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON public.plans(user_id);

-- Workouts indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_plan_id ON public.workouts(plan_id);

-- Exercises indexes
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON public.exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_slug ON public.exercises(user_id, slug);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON public.equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_available ON public.equipment(is_available);
CREATE INDEX IF NOT EXISTS idx_equipment_slug ON public.equipment(user_id, slug);

-- Exercise sets indexes
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_exercise_id ON public.exercise_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_user_id ON public.exercise_sets(user_id);

-- Workout schedules indexes
CREATE INDEX IF NOT EXISTS idx_workout_schedules_user_id ON public.workout_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_schedules_day_active ON public.workout_schedules(day_of_week, is_active);

-- Planned workouts indexes
CREATE INDEX IF NOT EXISTS idx_planned_workouts_user_id ON public.planned_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_workouts_user_date ON public.planned_workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_planned_workouts_schedule_id ON public.planned_workouts(schedule_id);

-- Security events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Workout templates indexes
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON public.workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_active ON public.workout_templates(is_active);

-- Template exercises indexes
CREATE INDEX IF NOT EXISTS idx_template_exercises_template_id ON public.template_exercises(template_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_user_id ON public.template_exercises(user_id);

-- Workout exercises indexes
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_user_id ON public.workout_exercises(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Drop existing ones first to avoid conflicts)
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profile;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profile;

DROP POLICY IF EXISTS "Users can view own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can insert own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can update own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can delete own weight logs" ON public.weight_logs;

DROP POLICY IF EXISTS "Users can view own weight entries" ON public.weight_entries;
DROP POLICY IF EXISTS "Users can insert own weight entries" ON public.weight_entries;
DROP POLICY IF EXISTS "Users can update own weight entries" ON public.weight_entries;
DROP POLICY IF EXISTS "Users can delete own weight entries" ON public.weight_entries;

DROP POLICY IF EXISTS "Users can view own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can update own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON public.plans;

DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON public.workouts;

DROP POLICY IF EXISTS "Users can view own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON public.exercises;

DROP POLICY IF EXISTS "Users can view own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can insert own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can update own equipment" ON public.equipment;
DROP POLICY IF EXISTS "Users can delete own equipment" ON public.equipment;

DROP POLICY IF EXISTS "Users can view own exercise sets" ON public.exercise_sets;
DROP POLICY IF EXISTS "Users can insert own exercise sets" ON public.exercise_sets;
DROP POLICY IF EXISTS "Users can update own exercise sets" ON public.exercise_sets;
DROP POLICY IF EXISTS "Users can delete own exercise sets" ON public.exercise_sets;

DROP POLICY IF EXISTS "Users can view own workout schedules" ON public.workout_schedules;
DROP POLICY IF EXISTS "Users can insert own workout schedules" ON public.workout_schedules;
DROP POLICY IF EXISTS "Users can update own workout schedules" ON public.workout_schedules;
DROP POLICY IF EXISTS "Users can delete own workout schedules" ON public.workout_schedules;

DROP POLICY IF EXISTS "Users can view own planned workouts" ON public.planned_workouts;
DROP POLICY IF EXISTS "Users can insert own planned workouts" ON public.planned_workouts;
DROP POLICY IF EXISTS "Users can update own planned workouts" ON public.planned_workouts;
DROP POLICY IF EXISTS "Users can delete own planned workouts" ON public.planned_workouts;

DROP POLICY IF EXISTS "Users can view own security events" ON public.security_events;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;

DROP POLICY IF EXISTS "Users can view own workout templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Users can insert own workout templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Users can update own workout templates" ON public.workout_templates;
DROP POLICY IF EXISTS "Users can delete own workout templates" ON public.workout_templates;

DROP POLICY IF EXISTS "Users can view own template exercises" ON public.template_exercises;
DROP POLICY IF EXISTS "Users can insert own template exercises" ON public.template_exercises;
DROP POLICY IF EXISTS "Users can update own template exercises" ON public.template_exercises;
DROP POLICY IF EXISTS "Users can delete own template exercises" ON public.template_exercises;

DROP POLICY IF EXISTS "Users can view own workout exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can insert own workout exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can delete own workout exercises" ON public.workout_exercises;

-- Profile policies
CREATE POLICY "Users can view own profile" ON public.profile
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profile
  FOR UPDATE USING (auth.uid() = user_id);

-- Weight logs policies
CREATE POLICY "Users can view own weight logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight logs" ON public.weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight logs" ON public.weight_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight logs" ON public.weight_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Weight entries policies
CREATE POLICY "Users can view own weight entries" ON public.weight_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight entries" ON public.weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight entries" ON public.weight_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight entries" ON public.weight_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Plans policies
CREATE POLICY "Users can view own plans" ON public.plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.plans
  FOR DELETE USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON public.workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON public.workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Exercises policies
CREATE POLICY "Users can view own exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = user_id OR created_by IS NULL);
CREATE POLICY "Users can insert own exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON public.exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON public.exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Equipment policies
CREATE POLICY "Users can view own equipment" ON public.equipment
  FOR SELECT USING (auth.uid() = user_id OR created_by IS NULL);
CREATE POLICY "Users can insert own equipment" ON public.equipment
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own equipment" ON public.equipment
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own equipment" ON public.equipment
  FOR DELETE USING (auth.uid() = user_id);

-- Exercise sets policies
CREATE POLICY "Users can view own exercise sets" ON public.exercise_sets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own exercise sets" ON public.exercise_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercise sets" ON public.exercise_sets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercise sets" ON public.exercise_sets
  FOR DELETE USING (auth.uid() = user_id);

-- Workout schedules policies
CREATE POLICY "Users can view own workout schedules" ON public.workout_schedules
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout schedules" ON public.workout_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout schedules" ON public.workout_schedules
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout schedules" ON public.workout_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Planned workouts policies
CREATE POLICY "Users can view own planned workouts" ON public.planned_workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own planned workouts" ON public.planned_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own planned workouts" ON public.planned_workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own planned workouts" ON public.planned_workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Security events policies
CREATE POLICY "Users can view own security events" ON public.security_events
  FOR SELECT USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Workout templates policies
CREATE POLICY "Users can view own workout templates" ON public.workout_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout templates" ON public.workout_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout templates" ON public.workout_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout templates" ON public.workout_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Template exercises policies
CREATE POLICY "Users can view own template exercises" ON public.template_exercises
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own template exercises" ON public.template_exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own template exercises" ON public.template_exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own template exercises" ON public.template_exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies
CREATE POLICY "Users can view own workout exercises" ON public.workout_exercises
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout exercises" ON public.workout_exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout exercises" ON public.workout_exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout exercises" ON public.workout_exercises
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profile_updated_at ON public.profile;
DROP TRIGGER IF EXISTS update_workout_schedules_updated_at ON public.workout_schedules;
DROP TRIGGER IF EXISTS update_planned_workouts_updated_at ON public.planned_workouts;
DROP TRIGGER IF EXISTS update_workout_templates_updated_at ON public.workout_templates;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profile_updated_at 
  BEFORE UPDATE ON public.profile 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_schedules_updated_at 
  BEFORE UPDATE ON public.workout_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planned_workouts_updated_at 
  BEFORE UPDATE ON public.planned_workouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at 
  BEFORE UPDATE ON public.workout_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile (user_id, display_name, locale, units, theme, timezone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'units', 'imperial'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'dark'),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Suspicious activity detection function
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
  is_suspicious BOOLEAN,
  risk_score INTEGER,
  reasons TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_attempts INTEGER := 0;
  recent_ips TEXT[];
  risk INTEGER := 0;
  suspicious_reasons TEXT[] := '{}';
BEGIN
  -- Check failed login attempts in last hour
  SELECT COUNT(*)
  INTO failed_attempts
  FROM public.security_events
  WHERE user_id = p_user_id
    AND event_type = 'failed_login'
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Add risk for multiple failed attempts
  IF failed_attempts > 3 THEN
    risk := risk + 30;
    suspicious_reasons := array_append(suspicious_reasons, 'Multiple failed login attempts');
  END IF;

  -- Check for multiple IP addresses (if provided)
  IF p_ip_address IS NOT NULL THEN
    SELECT array_agg(DISTINCT ip_address::TEXT)
    INTO recent_ips
    FROM public.security_events
    WHERE user_id = p_user_id
      AND ip_address IS NOT NULL
      AND created_at > NOW() - INTERVAL '24 hours';

    IF array_length(recent_ips, 1) > 3 THEN
      risk := risk + 20;
      suspicious_reasons := array_append(suspicious_reasons, 'Multiple IP addresses');
    END IF;
  END IF;

  -- Return results
  RETURN QUERY
  SELECT 
    risk > 25,
    risk,
    suspicious_reasons;
END;
$$;

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::JSONB,
  p_severity TEXT DEFAULT 'low'
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id BIGINT;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    email,
    ip_address,
    user_agent,
    details,
    severity
  )
  VALUES (
    p_event_type,
    p_user_id,
    p_email,
    p_ip_address::INET,
    p_user_agent,
    p_details,
    p_severity
  )
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

-- Function to safely insert audit logs
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_user_id UUID,
  p_table_name TEXT,
  p_operation TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_changed_fields TEXT[] DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id BIGINT;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    operation,
    old_values,
    new_values,
    changed_fields,
    ip_address,
    user_agent,
    session_id
  )
  VALUES (
    p_user_id,
    p_table_name,
    p_operation,
    p_old_values,
    p_new_values,
    p_changed_fields,
    p_ip_address::INET,
    p_user_agent,
    p_session_id
  )
  RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$$;

-- Function to get current date in user's timezone
CREATE OR REPLACE FUNCTION public.get_user_current_date(
  p_user_id UUID DEFAULT NULL
)
RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_timezone TEXT := 'UTC';
BEGIN
  -- Get user's timezone from profile, default to UTC if not found
  IF p_user_id IS NOT NULL THEN
    SELECT timezone INTO user_timezone 
    FROM public.profile 
    WHERE user_id = p_user_id;
    
    -- If no timezone found, default to UTC
    user_timezone := COALESCE(user_timezone, 'UTC');
  END IF;
  
  -- Return current date in the user's timezone
  RETURN (NOW() AT TIME ZONE user_timezone)::DATE;
END;
$$;

-- Function to get current date with explicit timezone (for manual use)
CREATE OR REPLACE FUNCTION public.get_date_in_timezone(
  p_timezone TEXT DEFAULT 'UTC'
)
RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return current date in the specified timezone
  -- Common timezones: 'America/New_York', 'America/Los_Angeles', 'Europe/Madrid', etc.
  RETURN (NOW() AT TIME ZONE p_timezone)::DATE;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.detect_suspicious_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_current_date TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_date_in_timezone TO authenticated;

-- =====================================================
-- CREATE YOUR PROFILE (Replace with your actual user_id)
-- =====================================================

-- Create your profile now:
INSERT INTO public.profile (user_id, display_name, locale, units, theme, timezone)
VALUES ('d36eb409-c2d6-439a-ae65-24c4231df387', 'Juan', 'en', 'imperial', 'system', 'UTC')
ON CONFLICT (user_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  locale = EXCLUDED.locale,
  units = EXCLUDED.units,
  theme = EXCLUDED.theme,
  timezone = EXCLUDED.timezone,
  updated_at = NOW();

-- Create comprehensive exercise library for your user with all training categories
INSERT INTO public.exercises (user_id, created_by, slug, name_en, name_es, category, muscle_groups, primary_muscles, secondary_muscles) VALUES
-- Strength Training
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'bench-press', 'Bench Press', 'Press de Banca', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['chest'], ARRAY['triceps', 'shoulders']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'squat', 'Squat', 'Sentadilla', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['quadriceps'], ARRAY['glutes', 'hamstrings']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'deadlift', 'Deadlift', 'Peso Muerto', 'strength', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['hamstrings'], ARRAY['glutes', 'back']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'overhead-press', 'Overhead Press', 'Press Militar', 'strength', ARRAY['shoulders', 'triceps', 'core'], ARRAY['shoulders'], ARRAY['triceps', 'core']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'barbell-rows', 'Barbell Rows', 'Remo con Barra', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['lats'], ARRAY['rhomboids', 'biceps']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'lat-pulldown', 'Lat Pulldown', 'Jalón al Pecho', 'strength', ARRAY['lats', 'rhomboids', 'biceps'], ARRAY['lats'], ARRAY['rhomboids', 'biceps']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'leg-press', 'Leg Press', 'Prensa de Piernas', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['quadriceps'], ARRAY['glutes', 'hamstrings']),

-- Cardio / Endurance
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'treadmill-running', 'Treadmill Running', 'Correr en Cinta', 'cardio', ARRAY['cardiovascular'], ARRAY['cardiovascular'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'stationary-bike', 'Stationary Bike', 'Bicicleta Estática', 'cardio', ARRAY['cardiovascular', 'quadriceps'], ARRAY['cardiovascular'], ARRAY['quadriceps']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'rowing-machine', 'Rowing Machine', 'Máquina de Remo', 'cardio', ARRAY['cardiovascular', 'back', 'legs'], ARRAY['cardiovascular'], ARRAY['back', 'legs']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'elliptical', 'Elliptical', 'Elíptica', 'cardio', ARRAY['cardiovascular'], ARRAY['cardiovascular'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'stair-climber', 'Stair Climber', 'Escaladora', 'cardio', ARRAY['cardiovascular', 'glutes', 'calves'], ARRAY['cardiovascular'], ARRAY['glutes', 'calves']),

-- Hypertrophy / Bodybuilding
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'incline-dumbbell-press', 'Incline Dumbbell Press', 'Press Inclinado con Mancuernas', 'hypertrophy', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['chest'], ARRAY['shoulders', 'triceps']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'cable-flyes', 'Cable Flyes', 'Aperturas con Polea', 'hypertrophy', ARRAY['chest'], ARRAY['chest'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'preacher-curls', 'Preacher Curls', 'Curl en Banco Scott', 'hypertrophy', ARRAY['biceps'], ARRAY['biceps'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'tricep-pushdowns', 'Tricep Pushdowns', 'Extensiones de Tríceps', 'hypertrophy', ARRAY['triceps'], ARRAY['triceps'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'leg-extensions', 'Leg Extensions', 'Extensiones de Cuádriceps', 'hypertrophy', ARRAY['quadriceps'], ARRAY['quadriceps'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'leg-curls', 'Leg Curls', 'Curl de Femoral', 'hypertrophy', ARRAY['hamstrings'], ARRAY['hamstrings'], ARRAY[]::TEXT[]),

-- Powerlifting
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'competition-squat', 'Competition Squat', 'Sentadilla de Competición', 'powerlifting', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['quadriceps'], ARRAY['glutes', 'hamstrings']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'competition-bench', 'Competition Bench Press', 'Press de Banca de Competición', 'powerlifting', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['chest'], ARRAY['triceps', 'shoulders']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'competition-deadlift', 'Competition Deadlift', 'Peso Muerto de Competición', 'powerlifting', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['hamstrings'], ARRAY['glutes', 'back']),

-- Olympic Weightlifting
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'snatch', 'Snatch', 'Arrancada', 'olympic_lifting', ARRAY['full_body'], ARRAY['shoulders', 'legs'], ARRAY['back', 'core']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'clean-and-jerk', 'Clean and Jerk', 'Cargada y Envión', 'olympic_lifting', ARRAY['full_body'], ARRAY['shoulders', 'legs'], ARRAY['back', 'core']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'power-clean', 'Power Clean', 'Cargada de Potencia', 'olympic_lifting', ARRAY['full_body'], ARRAY['legs', 'back'], ARRAY['shoulders', 'core']),

-- Cross-Training / Functional Training
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'kettlebell-swings', 'Kettlebell Swings', 'Balanceos con Kettlebell', 'functional', ARRAY['glutes', 'hamstrings', 'core'], ARRAY['glutes'], ARRAY['hamstrings', 'core']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'burpees', 'Burpees', 'Burpees', 'functional', ARRAY['full_body'], ARRAY['chest', 'legs'], ARRAY['shoulders', 'core']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'trx-rows', 'TRX Rows', 'Remo con TRX', 'functional', ARRAY['back', 'biceps', 'core'], ARRAY['back'], ARRAY['biceps', 'core']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'battle-ropes', 'Battle Ropes', 'Cuerdas de Entrenamiento', 'functional', ARRAY['shoulders', 'core', 'cardiovascular'], ARRAY['shoulders'], ARRAY['core', 'cardiovascular']),

-- HIIT
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'mountain-climbers', 'Mountain Climbers', 'Escaladores', 'hiit', ARRAY['core', 'shoulders', 'cardiovascular'], ARRAY['core'], ARRAY['shoulders', 'cardiovascular']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'jump-squats', 'Jump Squats', 'Sentadillas con Salto', 'hiit', ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['quadriceps'], ARRAY['glutes', 'calves']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'high-knees', 'High Knees', 'Rodillas al Pecho', 'hiit', ARRAY['hip_flexors', 'cardiovascular'], ARRAY['hip_flexors'], ARRAY['cardiovascular']),

-- Core Training
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'plank', 'Plank', 'Plancha', 'core', ARRAY['core', 'shoulders'], ARRAY['core'], ARRAY['shoulders']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'russian-twists', 'Russian Twists', 'Giros Rusos', 'core', ARRAY['core', 'obliques'], ARRAY['core'], ARRAY['obliques']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'dead-bugs', 'Dead Bugs', 'Bicho Muerto', 'core', ARRAY['core', 'hip_flexors'], ARRAY['core'], ARRAY['hip_flexors']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'bird-dogs', 'Bird Dogs', 'Perro Pájaro', 'core', ARRAY['core', 'glutes', 'back'], ARRAY['core'], ARRAY['glutes', 'back']),

-- Balance & Coordination
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'bosu-squats', 'BOSU Squats', 'Sentadillas en BOSU', 'balance', ARRAY['quadriceps', 'glutes', 'core'], ARRAY['quadriceps'], ARRAY['glutes', 'core']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'single-leg-stance', 'Single Leg Stance', 'Apoyo Unipodal', 'balance', ARRAY['glutes', 'core', 'ankles'], ARRAY['glutes'], ARRAY['core', 'ankles']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'stability-ball-plank', 'Stability Ball Plank', 'Plancha en Pelota Suiza', 'balance', ARRAY['core', 'shoulders'], ARRAY['core'], ARRAY['shoulders']),

-- Mobility / Flexibility
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'hip-flexor-stretch', 'Hip Flexor Stretch', 'Estiramiento de Flexores', 'mobility', ARRAY['hip_flexors'], ARRAY['hip_flexors'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'thoracic-spine-rotation', 'Thoracic Spine Rotation', 'Rotación Torácica', 'mobility', ARRAY['thoracic_spine'], ARRAY['thoracic_spine'], ARRAY[]::TEXT[]),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'foam-rolling', 'Foam Rolling', 'Rodillo de Espuma', 'mobility', ARRAY['full_body'], ARRAY['full_body'], ARRAY[]::TEXT[]),

-- Rehabilitation / Prehab
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'glute-bridges', 'Glute Bridges', 'Puentes de Glúteo', 'rehabilitation', ARRAY['glutes', 'hamstrings'], ARRAY['glutes'], ARRAY['hamstrings']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'clamshells', 'Clamshells', 'Almejas', 'rehabilitation', ARRAY['glutes', 'hip_abductors'], ARRAY['glutes'], ARRAY['hip_abductors']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'wall-slides', 'Wall Slides', 'Deslizamientos en Pared', 'rehabilitation', ARRAY['shoulders', 'upper_back'], ARRAY['shoulders'], ARRAY['upper_back']),

-- Sports Performance
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'agility-ladder', 'Agility Ladder', 'Escalera de Agilidad', 'sports_performance', ARRAY['legs', 'coordination'], ARRAY['legs'], ARRAY['coordination']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'box-jumps', 'Box Jumps', 'Saltos al Cajón', 'sports_performance', ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['quadriceps'], ARRAY['glutes', 'calves']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'cone-drills', 'Cone Drills', 'Ejercicios con Conos', 'sports_performance', ARRAY['legs', 'agility'], ARRAY['legs'], ARRAY['agility']),

-- Mind-Body
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'child-pose', 'Child Pose', 'Postura del Niño', 'mind_body', ARRAY['back', 'hips'], ARRAY['back'], ARRAY['hips']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'downward-dog', 'Downward Dog', 'Perro Boca Abajo', 'mind_body', ARRAY['shoulders', 'hamstrings', 'calves'], ARRAY['shoulders'], ARRAY['hamstrings', 'calves']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'breathing-exercises', 'Breathing Exercises', 'Ejercicios de Respiración', 'mind_body', ARRAY['diaphragm'], ARRAY['diaphragm'], ARRAY[]::TEXT[]),

-- Traditional favorites
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'pull-ups', 'Pull-ups', 'Dominadas', 'strength', ARRAY['lats', 'biceps', 'rhomboids'], ARRAY['lats'], ARRAY['biceps', 'rhomboids']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'dips', 'Dips', 'Fondos', 'strength', ARRAY['triceps', 'chest', 'shoulders'], ARRAY['triceps'], ARRAY['chest', 'shoulders']),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'lunges', 'Lunges', 'Zancadas', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['quadriceps'], ARRAY['glutes', 'hamstrings'])
ON CONFLICT (user_id, slug) DO NOTHING;

-- Insert comprehensive system exercises (available to all users) organized by training categories
INSERT INTO public.exercises (user_id, created_by, slug, name_en, name_es, category, muscle_groups, primary_muscles, secondary_muscles) VALUES
-- System Strength Training Exercises
(NULL, NULL, 'system-bench-press', 'Bench Press', 'Press de Banca', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['chest'], ARRAY['triceps', 'shoulders']),
(NULL, NULL, 'system-squat', 'Squat', 'Sentadilla', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['quadriceps'], ARRAY['glutes', 'hamstrings']),
(NULL, NULL, 'system-deadlift', 'Deadlift', 'Peso Muerto', 'strength', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['hamstrings'], ARRAY['glutes', 'back']),
(NULL, NULL, 'system-overhead-press', 'Overhead Press', 'Press Militar', 'strength', ARRAY['shoulders', 'triceps', 'core'], ARRAY['shoulders'], ARRAY['triceps', 'core']),
(NULL, NULL, 'system-pull-ups', 'Pull-ups', 'Dominadas', 'strength', ARRAY['lats', 'biceps', 'rhomboids'], ARRAY['lats'], ARRAY['biceps', 'rhomboids']),

-- System Cardio Exercises
(NULL, NULL, 'system-treadmill', 'Treadmill', 'Cinta de Correr', 'cardio', ARRAY['cardiovascular'], ARRAY['cardiovascular'], ARRAY[]::TEXT[]),
(NULL, NULL, 'system-bike', 'Exercise Bike', 'Bicicleta de Ejercicio', 'cardio', ARRAY['cardiovascular', 'quadriceps'], ARRAY['cardiovascular'], ARRAY['quadriceps']),
(NULL, NULL, 'system-rowing', 'Rowing Machine', 'Máquina de Remo', 'cardio', ARRAY['cardiovascular', 'back', 'legs'], ARRAY['cardiovascular'], ARRAY['back', 'legs']),

-- System HIIT Exercises
(NULL, NULL, 'system-burpees', 'Burpees', 'Burpees', 'hiit', ARRAY['full_body'], ARRAY['chest', 'legs'], ARRAY['shoulders', 'core']),
(NULL, NULL, 'system-jump-squats', 'Jump Squats', 'Sentadillas con Salto', 'hiit', ARRAY['quadriceps', 'glutes', 'calves'], ARRAY['quadriceps'], ARRAY['glutes', 'calves']),

-- System Core Training
(NULL, NULL, 'system-plank', 'Plank', 'Plancha', 'core', ARRAY['core', 'shoulders'], ARRAY['core'], ARRAY['shoulders']),
(NULL, NULL, 'system-crunches', 'Crunches', 'Abdominales', 'core', ARRAY['core'], ARRAY['core'], ARRAY[]::TEXT[]),

-- System Functional Training
(NULL, NULL, 'system-kettlebell-swings', 'Kettlebell Swings', 'Balanceos con Kettlebell', 'functional', ARRAY['glutes', 'hamstrings', 'core'], ARRAY['glutes'], ARRAY['hamstrings', 'core']),

-- System Mobility Exercises
(NULL, NULL, 'system-stretching', 'Stretching', 'Estiramientos', 'mobility', ARRAY['full_body'], ARRAY['full_body'], ARRAY[]::TEXT[]),

-- System Group Class Exercises
(NULL, NULL, 'system-spinning', 'Spinning', 'Spinning', 'group_classes', ARRAY['cardiovascular', 'quadriceps'], ARRAY['cardiovascular'], ARRAY['quadriceps']),
(NULL, NULL, 'system-bootcamp', 'Bootcamp', 'Bootcamp', 'group_classes', ARRAY['full_body'], ARRAY['full_body'], ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

-- =====================================================
-- EQUIPMENT LIBRARY
-- =====================================================

-- Insert comprehensive gym equipment for your user
INSERT INTO public.equipment (user_id, created_by, slug, name_en, name_es, category, subcategory, description) VALUES
-- Cardio Equipment
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'treadmill', 'Treadmill', 'Cinta de Correr', 'cardio', 'running', 'Motorized treadmill for walking and running'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'elliptical-machine', 'Elliptical', 'Elíptica', 'cardio', 'low_impact', 'Low-impact cardio machine with arm and leg movement'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'stationary-bike', 'Stationary Bike', 'Bicicleta Estática', 'cardio', 'cycling', 'Upright or recumbent stationary exercise bike'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'stair-climber', 'Stair Climber/Stepper', 'Escaladora', 'cardio', 'stepping', 'Machine that simulates stair climbing motion'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'rowing-machine', 'Rowing Machine', 'Máquina de Remo', 'cardio', 'rowing', 'Full-body cardio machine simulating rowing motion'),

-- Free Weights / Strength Equipment
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'dumbbells', 'Dumbbells (Range)', 'Mancuernas (Rango)', 'free_weights', 'dumbbells', 'Complete set of dumbbells from light to heavy weights'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'barbells-plates', 'Barbells + Plates', 'Barras + Discos', 'free_weights', 'barbells', 'Olympic barbells with weight plates'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'flat-bench', 'Flat Bench', 'Banco Plano', 'free_weights', 'benches', 'Flat weight bench for pressing exercises'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'incline-bench', 'Incline Bench', 'Banco Inclinado', 'free_weights', 'benches', 'Adjustable incline bench for various angles'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'decline-bench', 'Decline Bench', 'Banco Declinado', 'free_weights', 'benches', 'Decline bench for decline pressing movements'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'squat-rack', 'Squat Rack/Power Rack', 'Rack de Sentadillas', 'free_weights', 'racks', 'Safety rack for squats and other barbell exercises'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'smith-machine', 'Smith Machine', 'Máquina Smith', 'free_weights', 'machines', 'Guided barbell machine with safety features'),

-- Plate-loaded and Selectorized Machines
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'plate-loaded-machines', 'Plate-loaded Machines', 'Máquinas con Discos', 'machines', 'plate_loaded', 'Machines that use weight plates for resistance'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'selectorized-machines', 'Selectorized Machines', 'Máquinas Selectorizadas', 'machines', 'selectorized', 'Pin-selected weight stack machines'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'chest-press-machine', 'Chest Press', 'Prensa de Pecho', 'machines', 'chest', 'Machine for chest pressing movements'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'leg-press-machine', 'Leg Press', 'Prensa de Piernas', 'machines', 'legs', 'Machine for leg pressing exercises'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'lat-pulldown-machine', 'Lat Pulldown', 'Jalón al Pecho', 'machines', 'back', 'Cable machine for lat pulldown exercises'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'leg-extension-machine', 'Leg Extension', 'Extensión de Cuádriceps', 'machines', 'legs', 'Machine for quadriceps extension'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'seated-leg-curl', 'Seated Leg Curl', 'Curl de Femoral Sentado', 'machines', 'legs', 'Machine for hamstring curls in seated position'),

-- Cable Machines
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'cable-crossover', 'Cable Crossover', 'Cruce de Poleas', 'machines', 'cables', 'Dual cable machine for crossover movements'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'cable-pulldown', 'Cable Pulldown', 'Jalón con Polea', 'machines', 'cables', 'High cable pulldown station'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'cable-pushdown', 'Cable Pushdown', 'Extensión con Polea', 'machines', 'cables', 'Cable station for tricep pushdowns'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'shoulder-press-machine', 'Shoulder Press', 'Prensa de Hombros', 'machines', 'shoulders', 'Machine for overhead pressing movements'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'pec-deck', 'Pec Deck', 'Máquina de Pectorales', 'machines', 'chest', 'Machine for chest fly movements'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'back-extension-machine', 'Back Extension/Hyperextension', 'Extensión de Espalda', 'machines', 'back', 'Machine for lower back extension exercises'),

-- Functional / Accessory Equipment
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'kettlebells', 'Kettlebells', 'Kettlebells', 'functional', 'kettlebells', 'Cast iron weights with handles for dynamic movements'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'resistance-bands', 'Resistance Bands', 'Bandas de Resistencia', 'functional', 'bands', 'Elastic bands for resistance training'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'medicine-balls', 'Medicine Balls', 'Pelotas Medicinales', 'functional', 'balls', 'Weighted balls for functional training'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'battle-ropes', 'Battle Ropes', 'Cuerdas de Entrenamiento', 'functional', 'ropes', 'Heavy ropes for high-intensity cardio and strength'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'bosu-ball', 'BOSU Ball', 'Pelota BOSU', 'functional', 'balance', 'Half-sphere balance trainer'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'stability-ball', 'Stability Ball', 'Pelota Suiza', 'functional', 'balance', 'Large inflatable ball for core and stability training'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'trx-suspension', 'TRX Suspension', 'TRX Suspensión', 'functional', 'suspension', 'Suspension trainer using body weight'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'punching-bag', 'Punching/Boxing Bags', 'Sacos de Boxeo', 'functional', 'boxing', 'Heavy bags for boxing and martial arts training'),

-- Amenities
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'pool-spa', 'Pool & Spa', 'Piscina y Spa', 'amenities', 'water', 'Swimming pool and spa facilities'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'locker-rooms', 'Locker Rooms & Showers', 'Vestuarios y Duchas', 'amenities', 'facilities', 'Changing rooms with lockers and showers'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'sauna-steam', 'Sauna/Steam Rooms', 'Sauna/Vapor', 'amenities', 'wellness', 'Dry sauna and steam room facilities'),
('d36eb409-c2d6-439a-ae65-24c4231df387', 'd36eb409-c2d6-439a-ae65-24c4231df387', 'juice-bar', 'Juice Bar/Refreshment Area', 'Barra de Jugos', 'amenities', 'nutrition', 'Area for healthy drinks and snacks')
ON CONFLICT (user_id, slug) DO NOTHING;

-- Insert system equipment (available to all users)
INSERT INTO public.equipment (user_id, created_by, slug, name_en, name_es, category, subcategory, description) VALUES
-- System Cardio Equipment
(NULL, NULL, 'system-treadmill', 'Treadmill', 'Cinta de Correr', 'cardio', 'running', 'Standard gym treadmill'),
(NULL, NULL, 'system-elliptical', 'Elliptical', 'Elíptica', 'cardio', 'low_impact', 'Standard elliptical machine'),
(NULL, NULL, 'system-bike', 'Stationary Bike', 'Bicicleta Estática', 'cardio', 'cycling', 'Standard exercise bike'),
(NULL, NULL, 'system-rowing', 'Rowing Machine', 'Máquina de Remo', 'cardio', 'rowing', 'Standard rowing machine'),

-- System Strength Equipment
(NULL, NULL, 'system-dumbbells', 'Dumbbells', 'Mancuernas', 'free_weights', 'dumbbells', 'Standard dumbbell set'),
(NULL, NULL, 'system-barbells', 'Barbells', 'Barras', 'free_weights', 'barbells', 'Standard barbell set'),
(NULL, NULL, 'system-bench', 'Weight Bench', 'Banco de Pesas', 'free_weights', 'benches', 'Standard flat bench'),
(NULL, NULL, 'system-squat-rack', 'Squat Rack', 'Rack de Sentadillas', 'free_weights', 'racks', 'Standard squat rack'),

-- System Machines
(NULL, NULL, 'system-chest-press', 'Chest Press Machine', 'Máquina Prensa de Pecho', 'machines', 'chest', 'Standard chest press machine'),
(NULL, NULL, 'system-leg-press', 'Leg Press Machine', 'Máquina Prensa de Piernas', 'machines', 'legs', 'Standard leg press machine'),
(NULL, NULL, 'system-lat-pulldown', 'Lat Pulldown Machine', 'Máquina Jalón', 'machines', 'back', 'Standard lat pulldown machine'),

-- System Functional Equipment
(NULL, NULL, 'system-kettlebells', 'Kettlebells', 'Kettlebells', 'functional', 'kettlebells', 'Standard kettlebell set'),
(NULL, NULL, 'system-medicine-balls', 'Medicine Balls', 'Pelotas Medicinales', 'functional', 'balls', 'Standard medicine ball set')
ON CONFLICT DO NOTHING;