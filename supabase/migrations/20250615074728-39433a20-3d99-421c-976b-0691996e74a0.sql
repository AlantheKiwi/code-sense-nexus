
-- Table to store metrics for each debugging session
CREATE TABLE public.debug_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.debugging_sessions(id) ON DELETE CASCADE NOT NULL,
    issues_found INT DEFAULT 0,
    time_saved_ms BIGINT, -- Storing time in milliseconds
    tools_used JSONB DEFAULT '[]'::jsonb,
    resolution_time_ms BIGINT, -- Storing time in milliseconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(session_id)
);
COMMENT ON TABLE public.debug_metrics IS 'Stores aggregated metrics for each debugging session.';

-- Table for tracking tool usage statistics
CREATE TABLE public.tool_usage_stats (
    id BIGSERIAL PRIMARY KEY,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    usage_count INT DEFAULT 1,
    last_used TIMESTAMPTZ NOT NULL DEFAULT now(),
    success_rate NUMERIC(5, 2) DEFAULT 100.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tool_id, user_id, partner_id)
);
COMMENT ON TABLE public.tool_usage_stats IS 'Tracks usage statistics for each tool by user and partner.';

-- Table for daily user productivity metrics
CREATE TABLE public.productivity_metrics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    debug_sessions_completed INT DEFAULT 0,
    bugs_fixed INT DEFAULT 0,
    code_quality_improvement NUMERIC(5, 2), -- e.g. a score or percentage change
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, partner_id, metric_date)
);
COMMENT ON TABLE public.productivity_metrics IS 'Stores daily productivity metrics for each user.';

-- Table for daily platform-wide analytics
CREATE TABLE public.platform_analytics (
    id BIGSERIAL PRIMARY KEY,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
    daily_active_users INT DEFAULT 0,
    popular_tools JSONB, -- e.g. [{"tool_id": "...", "name": "...", "usage_count": 123}]
    performance_metrics JSONB, -- e.g. {"avg_response_time_ms": 150}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.platform_analytics IS 'Stores daily aggregated analytics for the entire platform.';

-- Enable RLS for all new tables
ALTER TABLE public.debug_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data visibility
CREATE POLICY "Users can access metrics for their accessible debugging sessions"
ON public.debug_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.debugging_sessions ds
    JOIN public.projects p ON ds.project_id = p.id
    WHERE ds.id = debug_metrics.session_id AND p.partner_id = public.get_my_partner_id()
  )
);

CREATE POLICY "Partners can view tool usage stats of their members"
ON public.tool_usage_stats
FOR SELECT
USING (partner_id = public.get_my_partner_id());

CREATE POLICY "Partners can view productivity metrics of their members"
ON public.productivity_metrics
FOR SELECT
USING (partner_id = public.get_my_partner_id());

CREATE POLICY "Authenticated users can view platform analytics"
ON public.platform_analytics
FOR SELECT
USING (auth.role() = 'authenticated');

