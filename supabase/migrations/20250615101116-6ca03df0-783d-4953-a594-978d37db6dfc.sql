
-- Table for auto-update configurations per partner and tool
CREATE TABLE public.tool_autoupdate_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
    auto_update_enabled BOOLEAN NOT NULL DEFAULT false,
    update_window TEXT, -- e.g., 'weekends', or a cron pattern
    rollback_policy TEXT NOT NULL DEFAULT 'manual', -- e.g., 'manual', 'automatic'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(partner_id, tool_id)
);
COMMENT ON TABLE public.tool_autoupdate_configs IS 'Configuration for automatic tool updates for each partner.';
CREATE INDEX idx_tool_autoupdate_configs_partner_id ON public.tool_autoupdate_configs(partner_id);

-- Enable RLS
ALTER TABLE public.tool_autoupdate_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tool_autoupdate_configs
CREATE POLICY "Partners can view their own auto-update configs"
ON public.tool_autoupdate_configs FOR SELECT
USING ( public.get_my_partner_id() = partner_id );

CREATE POLICY "Partners can manage their own auto-update configs"
ON public.tool_autoupdate_configs FOR ALL
USING ( public.get_my_partner_id() = partner_id );
