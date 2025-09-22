-- Complete Database Schema with Missing Tables
-- Run this after schema-safe.sql to add missing tables and functions

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_schedules_user_id ON public.workout_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_schedules_day_active ON public.workout_schedules(day_of_week, is_active);
CREATE INDEX IF NOT EXISTS idx_planned_workouts_user_id ON public.planned_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_workouts_user_date ON public.planned_workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_planned_workouts_schedule_id ON public.planned_workouts(schedule_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_schedules
CREATE POLICY "Users can view own workout schedules" ON public.workout_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout schedules" ON public.workout_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout schedules" ON public.workout_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout schedules" ON public.workout_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for planned_workouts
CREATE POLICY "Users can view own planned workouts" ON public.planned_workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own planned workouts" ON public.planned_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planned workouts" ON public.planned_workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planned workouts" ON public.planned_workouts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for security_events (users can only view their own events)
CREATE POLICY "Users can view own security events" ON public.security_events
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for audit_logs (users can only view their own audit logs)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create update triggers for updated_at timestamps
CREATE TRIGGER update_workout_schedules_updated_at 
  BEFORE UPDATE ON public.workout_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planned_workouts_updated_at 
  BEFORE UPDATE ON public.planned_workouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create suspicious activity detection function
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

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.detect_suspicious_activity TO authenticated;

-- Create function to log security events
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

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;

-- Create function to safely insert audit logs
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

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.create_audit_log TO authenticated;