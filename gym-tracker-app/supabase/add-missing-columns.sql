-- Add missing columns to existing workouts table
-- Run this in Supabase SQL Editor to fix the 400 errors

-- Add the missing columns if they don't exist
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'skipped')),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Update existing records to populate the new columns
UPDATE public.workouts 
SET 
  name = COALESCE(NULLIF(name, ''), title),
  status = CASE 
    WHEN status IS NULL THEN 
      CASE WHEN is_completed = true THEN 'completed' ELSE 'planned' END 
    ELSE status 
  END
WHERE name = '' OR name IS NULL OR status IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'workouts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;