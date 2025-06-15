
-- Enum for channel types to ensure consistency
CREATE TYPE notification_channel_type AS ENUM ('email', 'slack', 'discord', 'sms', 'webhook', 'in_app');

-- Enum for notification status
CREATE TYPE notification_status AS ENUM ('pending', 'processing', 'sent', 'failed', 'retrying');

-- 1. Table for notification channel configurations per partner
CREATE TABLE public.notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    type notification_channel_type NOT NULL,
    config JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(partner_id, type)
);
COMMENT ON TABLE public.notification_channels IS 'Stores configuration for notification channels for each partner (e.g., Slack webhook URL).';

-- RLS for notification_channels
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own notification channels"
ON public.notification_channels FOR ALL
USING ( public.get_my_partner_id() = partner_id );

-- 2. Table for user notification preferences
CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- e.g., 'tool_update', 'security_warning'
    channel_type notification_channel_type NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    settings JSONB, -- For future use, e.g., digest frequency
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, notification_type, channel_type)
);
COMMENT ON TABLE public.notification_preferences IS 'Stores individual user preferences for receiving different types of notifications on various channels.';

-- RLS for notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notification preferences"
ON public.notification_preferences FOR ALL
USING ( auth.uid() = user_id );

-- 3. Table for notification templates
CREATE TABLE public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- e.g., 'tool_update_completed'
    channel notification_channel_type NOT NULL,
    subject TEXT, -- For email
    body TEXT NOT NULL, -- Template body with placeholders
    variables JSONB, -- List of required variables for the template
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(type, channel)
);
COMMENT ON TABLE public.notification_templates IS 'Contains templates for notifications across different channels.';

-- RLS for notification_templates (readable by all authenticated users)
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read notification templates"
ON public.notification_templates FOR SELECT
USING ( auth.role() = 'authenticated' );

-- 4. Table for the notification queue
CREATE TABLE public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    channel_type notification_channel_type NOT NULL,
    content JSONB NOT NULL, -- Data to be injected into the template
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    status notification_status NOT NULL DEFAULT 'pending',
    attempts INT NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.notification_queue IS 'A queue of notifications to be processed and sent.';
CREATE INDEX idx_notification_queue_status_scheduled_at ON public.notification_queue(status, scheduled_at);

-- RLS for notification_queue (backend access only)
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- 5. Table for notification history
CREATE TABLE public.notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.notification_queue(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    delivered_at TIMESTAMPTZ,
    interaction_type TEXT, -- e.g., 'opened', 'clicked'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.notification_history IS 'Logs sent notifications and user interactions with them.';
CREATE INDEX idx_notification_history_user_id ON public.notification_history(user_id);

-- RLS for notification_history
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notification history"
ON public.notification_history FOR SELECT
USING ( auth.uid() = user_id );

