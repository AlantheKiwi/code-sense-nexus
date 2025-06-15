
-- Create a table to store the history of tool updates
CREATE TABLE public.tool_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
    from_version TEXT,
    to_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'installing', 'completed', 'failed', 'rolled_back')),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.tool_updates IS 'Tracks the version history and status of updates for integrated tools.';
COMMENT ON COLUMN public.tool_updates.status IS 'The current status of the update (e.g., available, completed, failed).';
COMMENT ON COLUMN public.tool_updates.details IS 'JSONB column for storing changelogs or error messages related to the update.';

-- Enable Row Level Security
ALTER TABLE public.tool_updates ENABLE ROW LEVEL SECURITY;

-- Allow service roles (like cron jobs) to manage updates
CREATE POLICY "Allow full access for service_role"
ON public.tool_updates
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow authenticated users (partners) to view the update history
CREATE POLICY "Allow partners to read update history"
ON public.tool_updates
FOR SELECT
USING (auth.role() = 'authenticated');

