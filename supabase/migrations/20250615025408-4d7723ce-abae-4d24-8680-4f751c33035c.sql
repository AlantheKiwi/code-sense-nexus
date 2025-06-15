
-- Create a migration to set up the core debugging and tools schema.

-- Table for debugging sessions
CREATE TABLE public.debugging_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'started',
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_debugging_sessions_project_id ON public.debugging_sessions(project_id);
CREATE INDEX idx_debugging_sessions_user_id ON public.debugging_sessions(user_id);
COMMENT ON TABLE public.debugging_sessions IS 'Stores information about each debugging session.';

-- Table for available tools
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    api_endpoint TEXT,
    version TEXT,
    config_schema JSONB
);
COMMENT ON TABLE public.tools IS 'Lists the available debugging and analysis tools.';

-- Table for tool configurations per partner (organization)
CREATE TABLE public.tool_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    config_data JSONB,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tool_id, partner_id)
);
CREATE INDEX idx_tool_configurations_partner_id ON public.tool_configurations(partner_id);
COMMENT ON TABLE public.tool_configurations IS 'Stores partner-specific configurations for each tool.';

-- Table for debug logs from sessions
CREATE TABLE public.debug_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES public.debugging_sessions(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES public.tools(id) ON DELETE SET NULL,
    log_data JSONB NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_debug_logs_session_id ON public.debug_logs(session_id);
COMMENT ON TABLE public.debug_logs IS 'Aggregates logs generated during a debugging session.';

-- Add new columns to the existing projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS framework TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB;

COMMENT ON COLUMN public.projects.language IS 'The primary programming language of the project.';
COMMENT ON COLUMN public.projects.framework IS 'The primary framework used in the project.';
COMMENT ON COLUMN public.projects.settings IS 'Project-specific settings and configurations.';

-- Enable RLS for new tables
ALTER TABLE public.debugging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for multi-tenancy
-- For tool_configurations, partners can only manage their own configs.
CREATE POLICY "Partners can manage their own tool configurations"
ON public.tool_configurations
FOR ALL
USING (partner_id = public.get_my_partner_id())
WITH CHECK (partner_id = public.get_my_partner_id());

-- For debugging_sessions, users can only access sessions for projects within their partner organization.
CREATE POLICY "Users can access debugging sessions for their partner's projects"
ON public.debugging_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = debugging_sessions.project_id AND p.partner_id = public.get_my_partner_id()
  )
);

-- For debug_logs, access is tied to the parent debugging_session.
CREATE POLICY "Users can access logs for their accessible debugging sessions"
ON public.debug_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.debugging_sessions ds
    WHERE ds.id = debug_logs.session_id
  )
);

-- Tools are public to all authenticated users.
CREATE POLICY "Authenticated users can view tools"
ON public.tools
FOR SELECT
USING (auth.role() = 'authenticated');
