
-- Table for CI/CD platform integrations
CREATE TABLE public.pipeline_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL, -- e.g., 'github', 'gitlab'
    config JSONB,
    webhook_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.pipeline_integrations IS 'Stores configuration for CI/CD integrations for a project.';
CREATE INDEX idx_pipeline_integrations_project_id ON public.pipeline_integrations(project_id);

-- Table for individual pipeline runs
CREATE TABLE public.pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.pipeline_integrations(id) ON DELETE CASCADE NOT NULL,
    external_run_id TEXT NOT NULL, -- e.g., GitHub Actions run ID
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(integration_id, external_run_id)
);
COMMENT ON TABLE public.pipeline_runs IS 'Tracks individual runs from a CI/CD pipeline.';
CREATE INDEX idx_pipeline_runs_integration_id ON public.pipeline_runs(integration_id);

-- Table for analysis results of a pipeline run
CREATE TABLE public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_run_id UUID REFERENCES public.pipeline_runs(id) ON DELETE CASCADE NOT NULL,
    tool_used TEXT NOT NULL,
    issues_found INT,
    quality_score NUMERIC,
    report_url TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.analysis_results IS 'Stores analysis results from tools run during a pipeline.';
CREATE INDEX idx_analysis_results_pipeline_run_id ON public.analysis_results(pipeline_run_id);

-- Table for deployment tracking
CREATE TABLE public.deployment_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_run_id UUID REFERENCES public.pipeline_runs(id) ON DELETE CASCADE NOT NULL,
    environment TEXT NOT NULL,
    deployed_at TIMESTAMPTZ,
    health_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.deployment_tracking IS 'Tracks deployments associated with a pipeline run.';
CREATE INDEX idx_deployment_tracking_pipeline_run_id ON public.deployment_tracking(pipeline_run_id);

-- Enable RLS
ALTER TABLE public.pipeline_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipeline_integrations
CREATE POLICY "Users can view pipeline integrations for their projects"
ON public.pipeline_integrations FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

CREATE POLICY "Users can manage pipeline integrations for their projects"
ON public.pipeline_integrations FOR ALL
USING ( public.is_project_member(project_id, auth.uid()) );

-- RLS Policies for pipeline_runs
CREATE POLICY "Users can view pipeline runs for their projects"
ON public.pipeline_runs FOR SELECT
USING ( EXISTS (
    SELECT 1 FROM public.pipeline_integrations pi
    WHERE pi.id = pipeline_runs.integration_id AND public.is_project_member(pi.project_id, auth.uid())
));

-- RLS Policies for analysis_results
CREATE POLICY "Users can view analysis results for their projects"
ON public.analysis_results FOR SELECT
USING ( EXISTS (
    SELECT 1
    FROM public.pipeline_runs pr
    JOIN public.pipeline_integrations pi ON pr.integration_id = pi.id
    WHERE pr.id = analysis_results.pipeline_run_id AND public.is_project_member(pi.project_id, auth.uid())
));

-- RLS Policies for deployment_tracking
CREATE POLICY "Users can view deployment tracking for their projects"
ON public.deployment_tracking FOR SELECT
USING ( EXISTS (
    SELECT 1
    FROM public.pipeline_runs pr
    JOIN public.pipeline_integrations pi ON pr.integration_id = pi.id
    WHERE pr.id = deployment_tracking.pipeline_run_id AND public.is_project_member(pi.project_id, auth.uid())
));
