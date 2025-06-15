
-- 1. Create profiles table to optimize user data lookups
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ
);
COMMENT ON TABLE public.profiles IS 'Stores public user profile information, kept in sync with auth.users.';

-- 2. Create function and trigger to sync user data to the new profiles table
CREATE OR REPLACE FUNCTION public.sync_user_profile_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_change_sync_profile
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_profile_from_auth();

-- 3. Backfill existing users into the new profiles table
INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
SELECT
    id,
    email,
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'avatar_url',
    now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 4. Enable Row Level Security and set policies for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Add performance-enhancing indexes to key tables

-- Indexes for logging and monitoring
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_partner_user_endpoint ON public.api_usage_logs (partner_id, user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_audit_logs_partner_user_action ON public.audit_logs (partner_id, user_id, action);

-- Indexes for backup system
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON public.backup_history (status);
CREATE INDEX IF NOT EXISTS idx_backup_history_schedule_id ON public.backup_history (schedule_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_partner_id ON public.backup_history (partner_id);

-- Indexes for error tracking
CREATE INDEX IF NOT EXISTS idx_error_reports_project_id_hash ON public.error_reports (project_id, error_hash);
CREATE INDEX IF NOT EXISTS idx_error_instances_error_report_id ON public.error_instances (error_report_id);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_project_id_type ON public.performance_metrics (project_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_resource_usage_project_id_timestamp ON public.resource_usage (project_id, "timestamp" DESC);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue (status);

-- Indexes for foreign keys that may not have them by default
CREATE INDEX IF NOT EXISTS idx_projects_partner_id ON public.projects (partner_id);
CREATE INDEX IF NOT EXISTS idx_teams_partner_id ON public.teams (partner_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_integrations_project_id ON public.pipeline_integrations (project_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_integration_id ON public.pipeline_runs (integration_id);

