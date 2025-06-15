
-- Helper function to automatically update `updated_at` timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for custom dashboards
CREATE TABLE public.custom_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    layout JSONB,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.custom_dashboards IS 'Stores custom user-created dashboards for analytics.';
CREATE TRIGGER on_dashboard_update
BEFORE UPDATE ON public.custom_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Table for widget templates
CREATE TABLE public.widget_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_type TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    config_schema JSONB,
    preview_image_url TEXT
);
COMMENT ON TABLE public.widget_templates IS 'Contains templates for available dashboard widgets.';

-- Table for dashboard widgets
CREATE TABLE public.dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES public.custom_dashboards(id) ON DELETE CASCADE,
    widget_type TEXT NOT NULL REFERENCES public.widget_templates(widget_type) ON DELETE RESTRICT,
    config JSONB,
    "position" JSONB,
    size JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.dashboard_widgets IS 'Instances of widgets placed on a custom dashboard.';

-- Enum and table for dashboard sharing
CREATE TYPE dashboard_permission_level AS ENUM ('view', 'edit');
CREATE TABLE public.dashboard_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES public.custom_dashboards(id) ON DELETE CASCADE,
    shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission dashboard_permission_level NOT NULL DEFAULT 'view',
    shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(dashboard_id, shared_with_user_id)
);
COMMENT ON TABLE public.dashboard_shares IS 'Manages sharing of dashboards with other users.';

-- Table for widget data sources
CREATE TABLE public.widget_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    widget_id UUID NOT NULL REFERENCES public.dashboard_widgets(id) ON DELETE CASCADE,
    data_source_table TEXT NOT NULL,
    query_config JSONB NOT NULL,
    refresh_interval_seconds INT NOT NULL DEFAULT 300,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.widget_data_sources IS 'Defines the data source and query configuration for a widget.';

-- RLS helper functions
CREATE OR REPLACE FUNCTION public.can_view_dashboard(_dashboard_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.custom_dashboards
        WHERE id = _dashboard_id AND user_id = _user_id
    ) OR EXISTS (
        SELECT 1 FROM public.dashboard_shares
        WHERE dashboard_id = _dashboard_id AND shared_with_user_id = _user_id AND permission >= 'view'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_edit_dashboard(_dashboard_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.custom_dashboards
        WHERE id = _dashboard_id AND user_id = _user_id
    ) OR EXISTS (
        SELECT 1 FROM public.dashboard_shares
        WHERE dashboard_id = _dashboard_id AND shared_with_user_id = _user_id AND permission = 'edit'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own and shared dashboards" ON public.custom_dashboards FOR SELECT USING (user_id = auth.uid() OR public.can_view_dashboard(id, auth.uid()));
CREATE POLICY "Users can create dashboards for their partner org" ON public.custom_dashboards FOR INSERT WITH CHECK (partner_id = public.get_my_partner_id() AND user_id = auth.uid());
CREATE POLICY "Users can update dashboards they can edit" ON public.custom_dashboards FOR UPDATE USING (public.can_edit_dashboard(id, auth.uid()));
CREATE POLICY "Users can delete their own dashboards" ON public.custom_dashboards FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.widget_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view widget templates" ON public.widget_templates FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view widgets on accessible dashboards" ON public.dashboard_widgets FOR SELECT USING (public.can_view_dashboard(dashboard_id, auth.uid()));
CREATE POLICY "Users can manage widgets on editable dashboards" ON public.dashboard_widgets FOR ALL USING (public.can_edit_dashboard(dashboard_id, auth.uid()));

ALTER TABLE public.dashboard_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shares for their dashboards or dashboards shared with them" ON public.dashboard_shares FOR SELECT USING (EXISTS (SELECT 1 FROM custom_dashboards WHERE id = dashboard_id AND user_id = auth.uid()) OR shared_with_user_id = auth.uid());
CREATE POLICY "Dashboard owners can manage shares" ON public.dashboard_shares FOR ALL USING (EXISTS (SELECT 1 FROM custom_dashboards WHERE id = dashboard_id AND user_id = auth.uid()));

ALTER TABLE public.widget_data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view data sources on accessible dashboards" ON public.widget_data_sources FOR SELECT USING (EXISTS (SELECT 1 FROM dashboard_widgets dw WHERE dw.id = widget_id AND public.can_view_dashboard(dw.dashboard_id, auth.uid())));
CREATE POLICY "Users can manage data sources on editable dashboards" ON public.widget_data_sources FOR ALL USING (EXISTS (SELECT 1 FROM dashboard_widgets dw WHERE dw.id = widget_id AND public.can_edit_dashboard(dw.dashboard_id, auth.uid())));

