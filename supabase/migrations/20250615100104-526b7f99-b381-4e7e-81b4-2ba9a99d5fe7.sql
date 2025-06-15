
-- Create a custom type for error status
CREATE TYPE error_status AS ENUM ('unresolved', 'resolved', 'ignored', 'in_progress');

-- Table for aggregated error reports
CREATE TABLE public.error_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    error_hash TEXT NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    context JSONB,
    count INT NOT NULL DEFAULT 1,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, error_hash)
);
CREATE INDEX idx_error_reports_project_id ON public.error_reports(project_id);
COMMENT ON TABLE public.error_reports IS 'Aggregated error reports, grouped by a unique hash.';

-- Table for individual error instances
CREATE TABLE public.error_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_report_id UUID REFERENCES public.error_reports(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent TEXT,
    url TEXT,
    session_data JSONB
);
CREATE INDEX idx_error_instances_error_report_id ON public.error_instances(error_report_id);
COMMENT ON TABLE public.error_instances IS 'Individual occurrences of an error.';

-- Table for tracking resolution of error reports
CREATE TABLE public.error_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_report_id UUID REFERENCES public.error_reports(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status error_status NOT NULL DEFAULT 'unresolved',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    fixed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.error_resolutions IS 'Tracks the resolution status and details for an error report.';

-- Table for performance issues
CREATE TABLE public.performance_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    threshold_exceeded NUMERIC,
    impact_score NUMERIC,
    context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_performance_issues_project_id ON public.performance_issues(project_id);
COMMENT ON TABLE public.performance_issues IS 'Stores detected performance issues and metrics.';

-- Enable RLS for all new tables
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view data for projects they are a member of.
CREATE POLICY "Users can view error reports for their projects"
ON public.error_reports FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

CREATE POLICY "Users can view error instances for their projects"
ON public.error_instances FOR SELECT
USING ( EXISTS (
    SELECT 1 FROM public.error_reports er
    WHERE er.id = error_instances.error_report_id AND public.is_project_member(er.project_id, auth.uid())
));

CREATE POLICY "Users can view error resolutions for their projects"
ON public.error_resolutions FOR SELECT
USING ( EXISTS (
    SELECT 1 FROM public.error_reports er
    WHERE er.id = error_resolutions.error_report_id AND public.is_project_member(er.project_id, auth.uid())
));

CREATE POLICY "Users can manage error resolutions for their projects"
ON public.error_resolutions FOR ALL
USING ( EXISTS (
    SELECT 1 FROM public.error_reports er
    WHERE er.id = error_resolutions.error_report_id AND public.is_project_member(er.project_id, auth.uid())
));

CREATE POLICY "Users can view performance issues for their projects"
ON public.performance_issues FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

-- For inserting, we will handle permission checks in an edge function.
-- Allowing any authenticated user to insert for now, to be secured by the API layer.
CREATE POLICY "Authenticated users can insert error reports"
ON public.error_reports FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert error instances"
ON public.error_instances FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert performance issues"
ON public.performance_issues FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
