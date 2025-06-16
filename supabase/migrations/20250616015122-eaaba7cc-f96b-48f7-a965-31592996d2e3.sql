
-- Create table for monitoring configurations
CREATE TABLE public.lighthouse_monitoring_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    configuration_id UUID REFERENCES public.lighthouse_configurations(id) ON DELETE CASCADE NOT NULL,
    urls TEXT[] NOT NULL,
    schedule_interval TEXT NOT NULL CHECK (schedule_interval IN ('hourly', 'daily', 'weekly')),
    schedule_time TIME DEFAULT '02:00:00',
    is_active BOOLEAN NOT NULL DEFAULT true,
    performance_thresholds JSONB NOT NULL DEFAULT '{
        "performance": 80,
        "accessibility": 80,
        "bestPractices": 80,
        "seo": 80,
        "pwa": 70
    }',
    alert_channels JSONB DEFAULT '["email"]',
    avoid_peak_hours BOOLEAN DEFAULT true,
    peak_hours_start TIME DEFAULT '09:00:00',
    peak_hours_end TIME DEFAULT '17:00:00',
    max_audits_per_day INTEGER DEFAULT 24,
    retry_failed_audits BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ
);

-- Create table for monitoring runs
CREATE TABLE public.lighthouse_monitoring_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.lighthouse_monitoring_configs(id) ON DELETE CASCADE NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('scheduled', 'deployment', 'manual', 'threshold_breach')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_urls INTEGER DEFAULT 0,
    completed_urls INTEGER DEFAULT 0,
    failed_urls INTEGER DEFAULT 0,
    average_scores JSONB,
    threshold_breaches JSONB DEFAULT '[]',
    deployment_context JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for threshold alerts
CREATE TABLE public.lighthouse_threshold_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitoring_run_id UUID REFERENCES public.lighthouse_monitoring_runs(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    current_score NUMERIC NOT NULL,
    threshold_score NUMERIC NOT NULL,
    previous_score NUMERIC,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for deployment integration
CREATE TABLE public.lighthouse_deployment_hooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    monitoring_config_id UUID REFERENCES public.lighthouse_monitoring_configs(id) ON DELETE CASCADE NOT NULL,
    webhook_url TEXT,
    deployment_stage TEXT NOT NULL CHECK (deployment_stage IN ('pre_deployment', 'post_deployment', 'both')),
    is_active BOOLEAN DEFAULT true,
    auth_token_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_lighthouse_monitoring_configs_project ON public.lighthouse_monitoring_configs(project_id);
CREATE INDEX idx_lighthouse_monitoring_configs_active ON public.lighthouse_monitoring_configs(is_active);
CREATE INDEX idx_lighthouse_monitoring_configs_next_run ON public.lighthouse_monitoring_configs(next_run_at) WHERE is_active = true;
CREATE INDEX idx_lighthouse_monitoring_runs_config ON public.lighthouse_monitoring_runs(config_id);
CREATE INDEX idx_lighthouse_monitoring_runs_status ON public.lighthouse_monitoring_runs(status);
CREATE INDEX idx_lighthouse_monitoring_runs_created_at ON public.lighthouse_monitoring_runs(created_at);
CREATE INDEX idx_lighthouse_threshold_alerts_run ON public.lighthouse_threshold_alerts(monitoring_run_id);
CREATE INDEX idx_lighthouse_threshold_alerts_unacknowledged ON public.lighthouse_threshold_alerts(is_acknowledged) WHERE is_acknowledged = false;
CREATE INDEX idx_lighthouse_deployment_hooks_project ON public.lighthouse_deployment_hooks(project_id);

-- Enable Row Level Security
ALTER TABLE public.lighthouse_monitoring_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_monitoring_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_threshold_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_deployment_hooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monitoring configs
CREATE POLICY "Users can view monitoring configs for their projects"
ON public.lighthouse_monitoring_configs FOR SELECT
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Users can create monitoring configs for their projects"
ON public.lighthouse_monitoring_configs FOR INSERT
WITH CHECK (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Users can update monitoring configs for their projects"
ON public.lighthouse_monitoring_configs FOR UPDATE
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Users can delete monitoring configs for their projects"
ON public.lighthouse_monitoring_configs FOR DELETE
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

-- Similar RLS policies for other tables
CREATE POLICY "Users can view monitoring runs for their projects"
ON public.lighthouse_monitoring_runs FOR SELECT
USING (
    config_id IN (
        SELECT id FROM public.lighthouse_monitoring_configs
        WHERE project_id IN (
            SELECT p.id FROM public.projects p
            WHERE public.is_project_member(p.id, auth.uid())
        )
    )
);

CREATE POLICY "Users can view alerts for their projects"
ON public.lighthouse_threshold_alerts FOR SELECT
USING (
    monitoring_run_id IN (
        SELECT mr.id FROM public.lighthouse_monitoring_runs mr
        JOIN public.lighthouse_monitoring_configs mc ON mr.config_id = mc.id
        WHERE mc.project_id IN (
            SELECT p.id FROM public.projects p
            WHERE public.is_project_member(p.id, auth.uid())
        )
    )
);

CREATE POLICY "Users can acknowledge alerts for their projects"
ON public.lighthouse_threshold_alerts FOR UPDATE
USING (
    monitoring_run_id IN (
        SELECT mr.id FROM public.lighthouse_monitoring_runs mr
        JOIN public.lighthouse_monitoring_configs mc ON mr.config_id = mc.id
        WHERE mc.project_id IN (
            SELECT p.id FROM public.projects p
            WHERE public.is_project_member(p.id, auth.uid())
        )
    )
);

CREATE POLICY "Users can manage deployment hooks for their projects"
ON public.lighthouse_deployment_hooks FOR ALL
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

-- Service role policies for automated processing
CREATE POLICY "Service role can manage monitoring configs"
ON public.lighthouse_monitoring_configs FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage monitoring runs"
ON public.lighthouse_monitoring_runs FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage threshold alerts"
ON public.lighthouse_threshold_alerts FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage deployment hooks"
ON public.lighthouse_deployment_hooks FOR ALL
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_lighthouse_monitoring_configs
    BEFORE UPDATE ON public.lighthouse_monitoring_configs
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_lighthouse_deployment_hooks
    BEFORE UPDATE ON public.lighthouse_deployment_hooks
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to calculate next run time
CREATE OR REPLACE FUNCTION calculate_next_lighthouse_run(
    interval_type TEXT,
    schedule_time TIME,
    avoid_peak_hours BOOLEAN DEFAULT true,
    peak_start TIME DEFAULT '09:00:00',
    peak_end TIME DEFAULT '17:00:00'
) RETURNS TIMESTAMPTZ AS $$
DECLARE
    next_run TIMESTAMPTZ;
    current_time TIMESTAMPTZ := now();
BEGIN
    -- Calculate base next run time
    CASE interval_type
        WHEN 'hourly' THEN
            next_run := date_trunc('hour', current_time) + INTERVAL '1 hour';
        WHEN 'daily' THEN
            next_run := date_trunc('day', current_time) + schedule_time;
            IF next_run <= current_time THEN
                next_run := next_run + INTERVAL '1 day';
            END IF;
        WHEN 'weekly' THEN
            next_run := date_trunc('week', current_time) + schedule_time;
            IF next_run <= current_time THEN
                next_run := next_run + INTERVAL '1 week';
            END IF;
        ELSE
            RAISE EXCEPTION 'Invalid interval type: %', interval_type;
    END CASE;

    -- Adjust for peak hours if needed
    IF avoid_peak_hours AND interval_type = 'hourly' THEN
        WHILE EXTRACT(HOUR FROM next_run AT TIME ZONE 'UTC')::TIME BETWEEN peak_start AND peak_end LOOP
            next_run := next_run + INTERVAL '1 hour';
        END LOOP;
    END IF;

    RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set next_run_at
CREATE OR REPLACE FUNCTION set_next_lighthouse_run() RETURNS TRIGGER AS $$
BEGIN
    NEW.next_run_at := calculate_next_lighthouse_run(
        NEW.schedule_interval,
        NEW.schedule_time,
        NEW.avoid_peak_hours,
        NEW.peak_hours_start,
        NEW.peak_hours_end
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_next_run_trigger
    BEFORE INSERT OR UPDATE ON public.lighthouse_monitoring_configs
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION set_next_lighthouse_run();

-- Add comments for documentation
COMMENT ON TABLE public.lighthouse_monitoring_configs IS 'Configuration for autonomous Lighthouse monitoring with scheduling and thresholds';
COMMENT ON TABLE public.lighthouse_monitoring_runs IS 'Execution history of autonomous monitoring runs';
COMMENT ON TABLE public.lighthouse_threshold_alerts IS 'Alerts generated when performance thresholds are breached';
COMMENT ON TABLE public.lighthouse_deployment_hooks IS 'Integration hooks for deployment pipeline auditing';
