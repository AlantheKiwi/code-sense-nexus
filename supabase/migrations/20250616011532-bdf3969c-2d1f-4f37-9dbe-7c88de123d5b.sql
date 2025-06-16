
-- Create table for Lighthouse configurations
CREATE TABLE public.lighthouse_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}',
    audit_categories JSONB NOT NULL DEFAULT '["performance", "accessibility", "best-practices", "seo", "pwa"]',
    organization_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for Lighthouse schedules
CREATE TABLE public.lighthouse_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID REFERENCES public.lighthouse_configurations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    urls TEXT[] NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('manual', 'daily', 'weekly', 'monthly')),
    schedule_time TIME,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_lighthouse_configurations_organization ON public.lighthouse_configurations(organization_id);
CREATE INDEX idx_lighthouse_configurations_project ON public.lighthouse_configurations(project_id);
CREATE INDEX idx_lighthouse_configurations_default ON public.lighthouse_configurations(is_default);
CREATE INDEX idx_lighthouse_schedules_configuration ON public.lighthouse_schedules(configuration_id);
CREATE INDEX idx_lighthouse_schedules_project ON public.lighthouse_schedules(project_id);
CREATE INDEX idx_lighthouse_schedules_active ON public.lighthouse_schedules(is_active);
CREATE INDEX idx_lighthouse_schedules_next_run ON public.lighthouse_schedules(next_run_at) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.lighthouse_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lighthouse_configurations
CREATE POLICY "Users can view configurations for their projects"
ON public.lighthouse_configurations FOR SELECT
USING ( 
  organization_id IN (
    SELECT id FROM public.partners WHERE user_id = auth.uid()
  ) OR
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE public.is_project_member(p.id, auth.uid())
  )
);

CREATE POLICY "Users can create configurations for their projects"
ON public.lighthouse_configurations FOR INSERT
WITH CHECK ( 
  organization_id IN (
    SELECT id FROM public.partners WHERE user_id = auth.uid()
  ) OR
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE public.is_project_member(p.id, auth.uid())
  )
);

CREATE POLICY "Users can update configurations they created"
ON public.lighthouse_configurations FOR UPDATE
USING (
  created_by = auth.uid() OR
  organization_id IN (
    SELECT id FROM public.partners WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete configurations they created"
ON public.lighthouse_configurations FOR DELETE
USING (
  created_by = auth.uid() OR
  organization_id IN (
    SELECT id FROM public.partners WHERE user_id = auth.uid()
  )
);

-- RLS Policies for lighthouse_schedules
CREATE POLICY "Users can view schedules for their projects"
ON public.lighthouse_schedules FOR SELECT
USING ( 
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE public.is_project_member(p.id, auth.uid())
  )
);

CREATE POLICY "Users can create schedules for their projects"
ON public.lighthouse_schedules FOR INSERT
WITH CHECK ( 
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE public.is_project_member(p.id, auth.uid())
  )
);

CREATE POLICY "Users can update schedules for their projects"
ON public.lighthouse_schedules FOR UPDATE
USING ( 
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE public.is_project_member(p.id, auth.uid())
  )
);

CREATE POLICY "Users can delete schedules for their projects"
ON public.lighthouse_schedules FOR DELETE
USING ( 
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE public.is_project_member(p.id, auth.uid())
  )
);

-- Service role policies for automated processing
CREATE POLICY "Service role can manage lighthouse configurations"
ON public.lighthouse_configurations FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage lighthouse schedules"
ON public.lighthouse_schedules FOR ALL
USING (true)
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at_lighthouse_configurations
    BEFORE UPDATE ON public.lighthouse_configurations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_lighthouse_schedules
    BEFORE UPDATE ON public.lighthouse_schedules
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert default configuration templates
INSERT INTO public.lighthouse_configurations (name, settings, audit_categories, is_default) VALUES
('Default Web Performance', '{
  "device": "mobile",
  "networkThrottling": "4G",
  "cpuThrottling": 4,
  "viewport": {"width": 375, "height": 667},
  "performanceBudget": {
    "performance": 90,
    "accessibility": 90,
    "bestPractices": 90,
    "seo": 90,
    "pwa": 80
  },
  "customThresholds": {
    "firstContentfulPaint": 1800,
    "largestContentfulPaint": 2500,
    "firstInputDelay": 100,
    "cumulativeLayoutShift": 0.1,
    "speedIndex": 3400,
    "totalBlockingTime": 200
  }
}', '["performance", "accessibility", "best-practices", "seo", "pwa"]', true),

('Desktop Performance', '{
  "device": "desktop",
  "networkThrottling": "broadband",
  "cpuThrottling": 1,
  "viewport": {"width": 1920, "height": 1080},
  "performanceBudget": {
    "performance": 95,
    "accessibility": 95,
    "bestPractices": 95,
    "seo": 95,
    "pwa": 85
  },
  "customThresholds": {
    "firstContentfulPaint": 1200,
    "largestContentfulPaint": 2000,
    "firstInputDelay": 50,
    "cumulativeLayoutShift": 0.05,
    "speedIndex": 2500,
    "totalBlockingTime": 150
  }
}', '["performance", "accessibility", "best-practices", "seo"]', true),

('Accessibility Focus', '{
  "device": "mobile",
  "networkThrottling": "3G",
  "cpuThrottling": 4,
  "viewport": {"width": 375, "height": 667},
  "performanceBudget": {
    "accessibility": 100,
    "bestPractices": 90,
    "seo": 85
  },
  "authentication": {
    "enabled": false,
    "headers": {},
    "cookies": []
  }
}', '["accessibility", "best-practices", "seo"]', true);

-- Add comments for documentation
COMMENT ON TABLE public.lighthouse_configurations IS 'Configuration templates for Lighthouse audits with custom settings and thresholds';
COMMENT ON TABLE public.lighthouse_schedules IS 'Scheduled Lighthouse audit runs with frequency and timing settings';
