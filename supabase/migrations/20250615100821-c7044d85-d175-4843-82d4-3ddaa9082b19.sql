
-- Table for raw performance metrics
CREATE TABLE public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB
);
COMMENT ON TABLE public.performance_metrics IS 'Stores raw performance metric data points for projects.';
CREATE INDEX idx_performance_metrics_project_id_timestamp ON public.performance_metrics(project_id, "timestamp" DESC);
CREATE INDEX idx_performance_metrics_metric_type ON public.performance_metrics(metric_type);

-- Table for performance alerts configuration
CREATE TABLE public.performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL,
    threshold NUMERIC NOT NULL,
    alert_type TEXT NOT NULL, -- e.g., 'above', 'below'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.performance_alerts IS 'Configuration for performance-based alerts.';
CREATE INDEX idx_performance_alerts_project_id ON public.performance_alerts(project_id);

-- Table for generated performance reports
CREATE TABLE public.performance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    report_period_start TIMESTAMPTZ NOT NULL,
    report_period_end TIMESTAMPTZ NOT NULL,
    summary_data JSONB,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.performance_reports IS 'Stores generated performance summary reports.';
CREATE INDEX idx_performance_reports_project_id ON public.performance_reports(project_id);

-- Table for resource usage metrics
CREATE TABLE public.resource_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    cpu_usage NUMERIC,
    memory_usage NUMERIC,
    disk_io NUMERIC,
    network_io NUMERIC,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.resource_usage IS 'Stores specific resource usage metrics over time.';
CREATE INDEX idx_resource_usage_project_id_timestamp ON public.resource_usage(project_id, "timestamp" DESC);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view performance metrics for their projects"
ON public.performance_metrics FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

CREATE POLICY "Authenticated users can insert performance metrics"
ON public.performance_metrics FOR INSERT
WITH CHECK ( public.is_project_member(project_id, auth.uid()) );

-- RLS Policies for performance_alerts
CREATE POLICY "Users can view performance alerts for their projects"
ON public.performance_alerts FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

CREATE POLICY "Users can manage performance alerts for their projects"
ON public.performance_alerts FOR ALL
USING ( public.is_project_member(project_id, auth.uid()) );

-- RLS Policies for performance_reports
CREATE POLICY "Users can view performance reports for their projects"
ON public.performance_reports FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

-- RLS Policies for resource_usage
CREATE POLICY "Users can view resource usage for their projects"
ON public.resource_usage FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

CREATE POLICY "Authenticated users can insert resource usage data"
ON public.resource_usage FOR INSERT
WITH CHECK ( public.is_project_member(project_id, auth.uid()) );
