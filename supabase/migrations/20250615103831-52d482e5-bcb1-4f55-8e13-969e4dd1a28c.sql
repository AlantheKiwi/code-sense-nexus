
-- Custom types for the backup system to ensure data consistency
CREATE TYPE public.backup_type AS ENUM ('full_database', 'storage', 'configuration');
CREATE TYPE public.backup_frequency AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE public.backup_status AS ENUM ('pending', 'in_progress', 'succeeded', 'failed', 'deleted');

-- Table for managing automated backup schedules
CREATE TABLE public.backup_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    backup_type public.backup_type NOT NULL,
    frequency public.backup_frequency NOT NULL,
    retention_days INT NOT NULL CHECK (retention_days > 0),
    time_of_day_utc TIME WITHOUT TIME ZONE NOT NULL DEFAULT '02:00:00',
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.backup_schedules IS 'Defines automated backup schedules for partners.';
CREATE TRIGGER on_backup_schedules_update
BEFORE UPDATE ON public.backup_schedules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX idx_backup_schedules_next_run ON public.backup_schedules (is_active, next_run_at);

-- Table for logging the history of all backup jobs
CREATE TABLE public.backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.backup_schedules(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    backup_type public.backup_type NOT NULL,
    status public.backup_status NOT NULL DEFAULT 'pending',
    file_path TEXT, -- Path to the backup file in Supabase Storage
    size_bytes BIGINT,
    checksum TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    logs JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.backup_history IS 'Logs the execution and results of backup jobs.';
CREATE INDEX idx_backup_history_partner ON public.backup_history (partner_id, created_at DESC);

-- Table for partner-specific disaster recovery configurations
CREATE TABLE public.disaster_recovery_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL UNIQUE REFERENCES public.partners(id) ON DELETE CASCADE,
    rpo_hours INT NOT NULL CHECK (rpo_hours > 0), -- Recovery Point Objective
    rto_hours INT NOT NULL CHECK (rto_hours > 0), -- Recovery Time Objective
    backup_regions JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.disaster_recovery_configs IS 'Stores disaster recovery settings like RPO, RTO, and failover regions for partners.';
CREATE TRIGGER on_dr_configs_update
BEFORE UPDATE ON public.disaster_recovery_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security to ensure data is isolated between partners
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own backup schedules"
ON public.backup_schedules FOR ALL
USING (partner_id = public.get_my_partner_id())
WITH CHECK (partner_id = public.get_my_partner_id());

ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own backup history"
ON public.backup_history FOR SELECT
USING (partner_id = public.get_my_partner_id());

ALTER TABLE public.disaster_recovery_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own DR configs"
ON public.disaster_recovery_configs FOR ALL
USING (partner_id = public.get_my_partner_id())
WITH CHECK (partner_id = public.get_my_partner_id());
