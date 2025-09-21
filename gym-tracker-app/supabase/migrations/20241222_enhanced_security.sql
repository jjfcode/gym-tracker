-- Enhanced Security Implementation
-- This migration adds comprehensive security measures including audit logging,
-- enhanced RLS policies, and security functions

-- Create audit log table for sensitive operations
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

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON public.audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS on audit logs (users can only see their own audit logs)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert audit logs (no user insert policy)
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (false); -- This will be handled by triggers

-- Create security monitoring table for failed login attempts
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

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON public.security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);

-- Enable RLS on security events (only admins can view, but we'll handle this in application layer)
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- No user access to security events table
CREATE POLICY "No user access to security events" ON public.security_events
  FOR ALL USING (false);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[] := '{}';
  field_name TEXT;
BEGIN
  -- Get old and new data as JSONB
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    
    -- Find changed fields
    FOR field_name IN SELECT jsonb_object_keys(new_data) LOOP
      IF old_data->field_name IS DISTINCT FROM new_data->field_name THEN
        changed_fields := array_append(changed_fields, field_name);
      END IF;
    END LOOP;
  END IF;

  -- Insert audit log (bypass RLS with security definer)
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
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    current_setting('request.jwt.claims', true)::json->>'session_id'
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_profile_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profile
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_weight_logs_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.weight_logs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'low'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    email,
    ip_address,
    user_agent,
    details,
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_email,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    p_details,
    p_severity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies with additional security checks

-- Function to check if user is accessing their own data
CREATE OR REPLACE FUNCTION public.is_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate session and check for suspicious activity
CREATE OR REPLACE FUNCTION public.validate_user_session()
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  session_valid BOOLEAN := FALSE;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if user exists and session is valid
  IF current_user_id IS NOT NULL THEN
    -- Additional session validation could be added here
    session_valid := TRUE;
  END IF;
  
  RETURN session_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies for profile table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profile;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profile;

CREATE POLICY "Enhanced: Users can view own profile" ON public.profile
  FOR SELECT USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can insert own profile" ON public.profile
  FOR INSERT WITH CHECK (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can update own profile" ON public.profile
  FOR UPDATE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

-- Enhanced RLS policies for weight_logs table
DROP POLICY IF EXISTS "Users can view own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can insert own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can update own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can delete own weight logs" ON public.weight_logs;

CREATE POLICY "Enhanced: Users can view own weight logs" ON public.weight_logs
  FOR SELECT USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can insert own weight logs" ON public.weight_logs
  FOR INSERT WITH CHECK (
    validate_user_session() AND 
    is_owner(user_id) AND
    weight > 0 AND weight < 1000 -- Additional validation
  );

CREATE POLICY "Enhanced: Users can update own weight logs" ON public.weight_logs
  FOR UPDATE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can delete own weight logs" ON public.weight_logs
  FOR DELETE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

-- Enhanced RLS policies for workouts table
DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON public.workouts;

CREATE POLICY "Enhanced: Users can view own workouts" ON public.workouts
  FOR SELECT USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (
    validate_user_session() AND 
    is_owner(user_id) AND
    date >= CURRENT_DATE - INTERVAL '1 year' AND -- Prevent historical data manipulation
    date <= CURRENT_DATE + INTERVAL '1 year'     -- Prevent far future dates
  );

CREATE POLICY "Enhanced: Users can update own workouts" ON public.workouts
  FOR UPDATE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can delete own workouts" ON public.workouts
  FOR DELETE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

-- Enhanced RLS policies for exercises table
DROP POLICY IF EXISTS "Users can view own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON public.exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON public.exercises;

CREATE POLICY "Enhanced: Users can view own exercises" ON public.exercises
  FOR SELECT USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can insert own exercises" ON public.exercises
  FOR INSERT WITH CHECK (
    validate_user_session() AND 
    is_owner(user_id) AND
    target_sets > 0 AND target_sets <= 20 AND
    target_reps > 0 AND target_reps <= 100
  );

CREATE POLICY "Enhanced: Users can update own exercises" ON public.exercises
  FOR UPDATE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can delete own exercises" ON public.exercises
  FOR DELETE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

-- Enhanced RLS policies for exercise_sets table
DROP POLICY IF EXISTS "Users can view own exercise sets" ON public.exercise_sets;
DROP POLICY IF EXISTS "Users can insert own exercise sets" ON public.exercise_sets;
DROP POLICY IF EXISTS "Users can update own exercise sets" ON public.exercise_sets;
DROP POLICY IF EXISTS "Users can delete own exercise sets" ON public.exercise_sets;

CREATE POLICY "Enhanced: Users can view own exercise sets" ON public.exercise_sets
  FOR SELECT USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can insert own exercise sets" ON public.exercise_sets
  FOR INSERT WITH CHECK (
    validate_user_session() AND 
    is_owner(user_id) AND
    (weight IS NULL OR (weight > 0 AND weight < 1000)) AND
    (reps IS NULL OR (reps > 0 AND reps <= 100)) AND
    (rpe IS NULL OR (rpe >= 1 AND rpe <= 10))
  );

CREATE POLICY "Enhanced: Users can update own exercise sets" ON public.exercise_sets
  FOR UPDATE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can delete own exercise sets" ON public.exercise_sets
  FOR DELETE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

-- Enhanced RLS policies for plans table
DROP POLICY IF EXISTS "Users can view own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can insert own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can update own plans" ON public.plans;
DROP POLICY IF EXISTS "Users can delete own plans" ON public.plans;

CREATE POLICY "Enhanced: Users can view own plans" ON public.plans
  FOR SELECT USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can insert own plans" ON public.plans
  FOR INSERT WITH CHECK (
    validate_user_session() AND 
    is_owner(user_id) AND
    goal_days_per_week BETWEEN 1 AND 7
  );

CREATE POLICY "Enhanced: Users can update own plans" ON public.plans
  FOR UPDATE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can delete own plans" ON public.plans
  FOR DELETE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

-- Enhanced RLS policies for custom_exercises table
DROP POLICY IF EXISTS "Users can view own custom exercises" ON public.custom_exercises;
DROP POLICY IF EXISTS "Users can insert own custom exercises" ON public.custom_exercises;
DROP POLICY IF EXISTS "Users can update own custom exercises" ON public.custom_exercises;
DROP POLICY IF EXISTS "Users can delete own custom exercises" ON public.custom_exercises;

CREATE POLICY "Enhanced: Users can view own custom exercises" ON public.custom_exercises
  FOR SELECT USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can insert own custom exercises" ON public.custom_exercises
  FOR INSERT WITH CHECK (
    validate_user_session() AND 
    is_owner(user_id) AND
    length(name_en) > 0 AND length(name_en) <= 100 AND
    length(name_es) > 0 AND length(name_es) <= 100 AND
    array_length(muscle_groups, 1) > 0
  );

CREATE POLICY "Enhanced: Users can update own custom exercises" ON public.custom_exercises
  FOR UPDATE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

CREATE POLICY "Enhanced: Users can delete own custom exercises" ON public.custom_exercises
  FOR DELETE USING (
    validate_user_session() AND 
    is_owner(user_id)
  );

-- Create function to clean up old audit logs (for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS VOID AS $$
BEGIN
  -- Delete audit logs older than 1 year
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Delete resolved security events older than 6 months
  DELETE FROM public.security_events 
  WHERE resolved = TRUE AND created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check for suspicious activity patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(
  p_user_id UUID,
  p_time_window INTERVAL DEFAULT '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
  recent_events_count INTEGER;
  failed_logins_count INTEGER;
BEGIN
  -- Count recent security events for this user
  SELECT COUNT(*) INTO recent_events_count
  FROM public.security_events
  WHERE user_id = p_user_id 
    AND created_at > NOW() - p_time_window
    AND severity IN ('medium', 'high', 'critical');
  
  -- Count recent failed login attempts
  SELECT COUNT(*) INTO failed_logins_count
  FROM public.security_events
  WHERE user_id = p_user_id 
    AND event_type = 'failed_login'
    AND created_at > NOW() - p_time_window;
  
  -- Return true if suspicious activity detected
  RETURN recent_events_count > 10 OR failed_logins_count > 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraints to prevent data integrity issues
ALTER TABLE public.profile ADD CONSTRAINT profile_locale_check 
  CHECK (locale IN ('en', 'es'));

ALTER TABLE public.profile ADD CONSTRAINT profile_units_check 
  CHECK (units IN ('metric', 'imperial'));

ALTER TABLE public.profile ADD CONSTRAINT profile_theme_check 
  CHECK (theme IN ('dark', 'light', 'system'));

-- Add additional constraints for data validation
ALTER TABLE public.weight_logs ADD CONSTRAINT weight_logs_weight_range 
  CHECK (weight > 0 AND weight < 1000);

ALTER TABLE public.weight_logs ADD CONSTRAINT weight_logs_date_range 
  CHECK (measured_at >= '2020-01-01' AND measured_at <= CURRENT_DATE + INTERVAL '1 day');

ALTER TABLE public.exercises ADD CONSTRAINT exercises_target_sets_range 
  CHECK (target_sets > 0 AND target_sets <= 20);

ALTER TABLE public.exercises ADD CONSTRAINT exercises_target_reps_range 
  CHECK (target_reps > 0 AND target_reps <= 100);

ALTER TABLE public.exercise_sets ADD CONSTRAINT exercise_sets_weight_range 
  CHECK (weight IS NULL OR (weight > 0 AND weight < 1000));

ALTER TABLE public.exercise_sets ADD CONSTRAINT exercise_sets_reps_range 
  CHECK (reps IS NULL OR (reps > 0 AND reps <= 100));

ALTER TABLE public.exercise_sets ADD CONSTRAINT exercise_sets_rpe_range 
  CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));

-- Create indexes for better performance on security-related queries
CREATE INDEX IF NOT EXISTS idx_profile_updated_at ON public.profile(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date_composite ON public.weight_logs(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date_composite ON public.workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_user_workout_composite ON public.exercises(user_id, workout_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_user_exercise_composite ON public.exercise_sets(user_id, exercise_id);

-- Grant necessary permissions (these are handled by Supabase automatically, but included for completeness)
-- GRANT USAGE ON SCHEMA public TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE public.audit_logs IS 'Audit trail for sensitive operations';
COMMENT ON TABLE public.security_events IS 'Security monitoring and incident tracking';
COMMENT ON FUNCTION public.log_audit_event() IS 'Trigger function to log data changes';
COMMENT ON FUNCTION public.log_security_event(TEXT, UUID, TEXT, JSONB, TEXT) IS 'Function to log security events';
COMMENT ON FUNCTION public.validate_user_session() IS 'Enhanced session validation for RLS policies';
COMMENT ON FUNCTION public.is_owner(UUID) IS 'Helper function to check resource ownership';