-- STEP-BY-STEP DATABASE SETUP GUIDE
-- Copy and paste each section separately into Supabase SQL Editor

-- ==================================================
-- STEP 1: Basic Schema (Run this first)
-- ==================================================
-- Copy the contents of schema-safe.sql and run it first

-- ==================================================
-- STEP 2: Missing Tables and Functions (Run this second)
-- ==================================================
-- Copy the contents of schema-missing-tables.sql and run it second

-- ==================================================
-- STEP 3: Verify Setup (Run this third to check everything)
-- ==================================================

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profile', 
    'weight_logs', 
    'plans', 
    'workouts', 
    'exercises', 
    'exercise_sets',
    'workout_schedules',
    'planned_workouts',
    'security_events',
    'audit_logs'
  )
ORDER BY table_name;

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'handle_new_user',
    'update_updated_at_column',
    'detect_suspicious_activity',
    'log_security_event',
    'create_audit_log'
  )
ORDER BY routine_name;

-- Check if your user has a profile (replace with your actual user_id)
SELECT * FROM auth.users WHERE id = 'd36eb409-c2d6-439a-ae65-24c4231df387';
SELECT * FROM public.profile WHERE user_id = 'd36eb409-c2d6-439a-ae65-24c4231df387';

-- If no profile exists, create one manually:
-- INSERT INTO public.profile (user_id, display_name, locale, units, theme)
-- VALUES ('d36eb409-c2d6-439a-ae65-24c4231df387', 'Your Name', 'en', 'imperial', 'system');