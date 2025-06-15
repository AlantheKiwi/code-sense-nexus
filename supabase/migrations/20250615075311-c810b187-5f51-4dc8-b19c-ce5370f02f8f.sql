
-- Add quality_score to repository_analyses table
ALTER TABLE public.repository_analyses
ADD COLUMN IF NOT EXISTS quality_score NUMERIC(5, 2);

COMMENT ON COLUMN public.repository_analyses.quality_score IS 'A numeric score from 0-100 representing the repository''s health.';


-- Table to manage GitHub App installations per partner
CREATE TABLE public.github_app_installations (
    id BIGINT PRIMARY KEY, -- This is the installation_id from GitHub
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    github_account_id BIGINT NOT NULL,
    github_account_login TEXT NOT NULL,
    repository_selection TEXT NOT NULL, -- e.g., 'all' or 'selected'
    suspended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (github_account_id) -- A GitHub account can only have one installation of an app
);
COMMENT ON TABLE public.github_app_installations IS 'Stores GitHub App installation data for each partner.';

-- Enable RLS for github_app_installations
ALTER TABLE public.github_app_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can manage their own GitHub installations"
ON public.github_app_installations
FOR ALL
USING (partner_id = public.get_my_partner_id())
WITH CHECK (partner_id = public.get_my_partner_id());


-- Table to log incoming webhook events from GitHub
CREATE TABLE public.github_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installation_id BIGINT NOT NULL,
    github_delivery_id UUID NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'received', -- received, processing, success, error
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.github_webhook_events IS 'Logs incoming webhook events from GitHub.';

-- Enable RLS for github_webhook_events
ALTER TABLE public.github_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view webhooks for their installations"
ON public.github_webhook_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.github_app_installations gai
    WHERE gai.id = github_webhook_events.installation_id AND gai.partner_id = public.get_my_partner_id()
  )
);
