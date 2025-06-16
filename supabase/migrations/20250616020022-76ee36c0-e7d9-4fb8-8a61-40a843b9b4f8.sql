
-- Create table for recommendation templates
CREATE TABLE public.lighthouse_recommendation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    project_type TEXT NOT NULL, -- 'react', 'vue', 'wordpress', 'ecommerce', 'blog', etc.
    audit_rule TEXT NOT NULL, -- Lighthouse audit rule ID
    category TEXT NOT NULL CHECK (category IN ('performance', 'accessibility', 'best-practices', 'seo', 'pwa')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    fix_template TEXT NOT NULL, -- Template for the fix suggestion
    implementation_difficulty TEXT NOT NULL CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
    estimated_time_hours NUMERIC DEFAULT 1,
    tools_integration JSONB DEFAULT '[]', -- Array of tool integrations
    prerequisites JSONB DEFAULT '[]', -- Prerequisites for implementation
    expected_impact JSONB NOT NULL DEFAULT '{}', -- Expected performance impact
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for audit-based recommendations
CREATE TABLE public.lighthouse_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES public.lighthouse_audits(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.lighthouse_recommendation_templates(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    audit_rule TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    fix_suggestion TEXT NOT NULL,
    implementation_code TEXT, -- Specific code example for this case
    priority_score INTEGER NOT NULL DEFAULT 50, -- 0-100
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_time_hours NUMERIC DEFAULT 1,
    estimated_savings_ms NUMERIC DEFAULT 0, -- Performance savings in milliseconds
    cost_benefit_score NUMERIC DEFAULT 0, -- Calculated cost-benefit ratio
    current_value NUMERIC, -- Current metric value causing the issue
    target_value NUMERIC, -- Target value after fix
    tool_integrations JSONB DEFAULT '[]',
    is_automated BOOLEAN DEFAULT false, -- Can be auto-fixed
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed', 'not_applicable')),
    implemented_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    dismissed_reason TEXT,
    verification_audit_id UUID REFERENCES public.lighthouse_audits(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for recommendation progress tracking
CREATE TABLE public.lighthouse_recommendation_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES public.lighthouse_recommendations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    status_changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    time_spent_hours NUMERIC DEFAULT 0,
    before_metrics JSONB, -- Metrics before implementation
    after_metrics JSONB, -- Metrics after implementation
    tools_used JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for recommendation batches (grouping related recommendations)
CREATE TABLE public.lighthouse_recommendation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    audit_ids UUID[] NOT NULL, -- Array of audit IDs included in this batch
    total_recommendations INTEGER DEFAULT 0,
    completed_recommendations INTEGER DEFAULT 0,
    estimated_total_hours NUMERIC DEFAULT 0,
    actual_total_hours NUMERIC DEFAULT 0,
    expected_savings_ms NUMERIC DEFAULT 0,
    actual_savings_ms NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for tool integrations and their configurations
CREATE TABLE public.lighthouse_tool_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    tool_name TEXT NOT NULL, -- 'webpack-bundle-analyzer', 'imagemin', 'critical', etc.
    tool_category TEXT NOT NULL, -- 'bundling', 'image-optimization', 'css-optimization', etc.
    configuration JSONB NOT NULL DEFAULT '{}',
    api_credentials JSONB, -- Encrypted credentials for external services
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    success_rate NUMERIC DEFAULT 0, -- Percentage of successful automated fixes
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_lighthouse_recommendation_templates_project_type ON public.lighthouse_recommendation_templates(project_type);
CREATE INDEX idx_lighthouse_recommendation_templates_audit_rule ON public.lighthouse_recommendation_templates(audit_rule);
CREATE INDEX idx_lighthouse_recommendations_audit ON public.lighthouse_recommendations(audit_id);
CREATE INDEX idx_lighthouse_recommendations_project ON public.lighthouse_recommendations(project_id);
CREATE INDEX idx_lighthouse_recommendations_status ON public.lighthouse_recommendations(status);
CREATE INDEX idx_lighthouse_recommendations_priority ON public.lighthouse_recommendations(priority_score DESC);
CREATE INDEX idx_lighthouse_recommendation_progress_recommendation ON public.lighthouse_recommendation_progress(recommendation_id);
CREATE INDEX idx_lighthouse_recommendation_batches_project ON public.lighthouse_recommendation_batches(project_id);
CREATE INDEX idx_lighthouse_tool_integrations_project ON public.lighthouse_tool_integrations(project_id);

-- Enable Row Level Security
ALTER TABLE public.lighthouse_recommendation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_recommendation_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_recommendation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_tool_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recommendation templates (public read, admin write)
CREATE POLICY "Anyone can view recommendation templates"
ON public.lighthouse_recommendation_templates FOR SELECT
USING (true);

CREATE POLICY "Service role can manage recommendation templates"
ON public.lighthouse_recommendation_templates FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for recommendations
CREATE POLICY "Users can view recommendations for their projects"
ON public.lighthouse_recommendations FOR SELECT
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Users can update recommendations for their projects"
ON public.lighthouse_recommendations FOR UPDATE
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Service role can manage all recommendations"
ON public.lighthouse_recommendations FOR ALL
USING (true)
WITH CHECK (true);

-- Similar RLS policies for other tables
CREATE POLICY "Users can view recommendation progress for their projects"
ON public.lighthouse_recommendation_progress FOR SELECT
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Users can create recommendation progress for their projects"
ON public.lighthouse_recommendation_progress FOR INSERT
WITH CHECK (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Users can manage recommendation batches for their projects"
ON public.lighthouse_recommendation_batches FOR ALL
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

CREATE POLICY "Users can manage tool integrations for their projects"
ON public.lighthouse_tool_integrations FOR ALL
USING (
    project_id IN (
        SELECT p.id FROM public.projects p
        WHERE public.is_project_member(p.id, auth.uid())
    )
);

-- Service role policies for automated processing
CREATE POLICY "Service role can manage recommendation progress"
ON public.lighthouse_recommendation_progress FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage tool integrations"
ON public.lighthouse_tool_integrations FOR ALL
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER handle_updated_at_lighthouse_recommendation_templates
    BEFORE UPDATE ON public.lighthouse_recommendation_templates
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_lighthouse_recommendations
    BEFORE UPDATE ON public.lighthouse_recommendations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_lighthouse_recommendation_batches
    BEFORE UPDATE ON public.lighthouse_recommendation_batches
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_lighthouse_tool_integrations
    BEFORE UPDATE ON public.lighthouse_tool_integrations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to calculate priority score based on multiple factors
CREATE OR REPLACE FUNCTION calculate_recommendation_priority(
    savings_ms NUMERIC,
    difficulty TEXT,
    current_score NUMERIC,
    impact_area TEXT
) RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER := 50;
    savings_score INTEGER := 0;
    difficulty_modifier INTEGER := 0;
    score_modifier INTEGER := 0;
    impact_modifier INTEGER := 0;
BEGIN
    -- Score based on potential savings (0-30 points)
    IF savings_ms > 2000 THEN savings_score := 30;
    ELSIF savings_ms > 1000 THEN savings_score := 20;
    ELSIF savings_ms > 500 THEN savings_score := 15;
    ELSIF savings_ms > 100 THEN savings_score := 10;
    ELSE savings_score := 5;
    END IF;

    -- Difficulty modifier (-10 to +10 points)
    CASE difficulty
        WHEN 'easy' THEN difficulty_modifier := 10;
        WHEN 'medium' THEN difficulty_modifier := 0;
        WHEN 'hard' THEN difficulty_modifier := -10;
        ELSE difficulty_modifier := 0;
    END CASE;

    -- Current score modifier (worse scores get higher priority)
    IF current_score IS NOT NULL THEN
        IF current_score < 50 THEN score_modifier := 15;
        ELSIF current_score < 70 THEN score_modifier := 10;
        ELSIF current_score < 85 THEN score_modifier := 5;
        ELSE score_modifier := 0;
        END IF;
    END IF;

    -- Impact area modifier
    CASE impact_area
        WHEN 'performance' THEN impact_modifier := 5;
        WHEN 'accessibility' THEN impact_modifier := 3;
        WHEN 'seo' THEN impact_modifier := 2;
        ELSE impact_modifier := 0;
    END CASE;

    RETURN GREATEST(0, LEAST(100, base_score + savings_score + difficulty_modifier + score_modifier + impact_modifier));
END;
$$ LANGUAGE plpgsql;

-- Function to calculate cost-benefit score
CREATE OR REPLACE FUNCTION calculate_cost_benefit_score(
    estimated_hours NUMERIC,
    potential_savings_ms NUMERIC,
    difficulty TEXT
) RETURNS NUMERIC AS $$
DECLARE
    time_cost NUMERIC := estimated_hours * 50; -- Assume $50/hour
    benefit_value NUMERIC := 0;
    difficulty_multiplier NUMERIC := 1;
BEGIN
    -- Convert time savings to monetary value (rough estimate)
    benefit_value := (potential_savings_ms / 1000.0) * 10; -- $10 per second saved

    -- Adjust for difficulty
    CASE difficulty
        WHEN 'easy' THEN difficulty_multiplier := 1.2;
        WHEN 'medium' THEN difficulty_multiplier := 1.0;
        WHEN 'hard' THEN difficulty_multiplier := 0.8;
        ELSE difficulty_multiplier := 1.0;
    END CASE;

    -- Return benefit/cost ratio
    IF time_cost > 0 THEN
        RETURN (benefit_value * difficulty_multiplier) / time_cost;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert default recommendation templates
INSERT INTO public.lighthouse_recommendation_templates (
    name, project_type, audit_rule, category, title, description, fix_template,
    implementation_difficulty, estimated_time_hours, expected_impact, tools_integration
) VALUES
-- Performance recommendations
('Unused CSS Removal', 'react', 'unused-css-rules', 'performance', 
 'Remove Unused CSS Rules', 
 'Eliminate unused CSS to reduce bundle size and improve load times.',
 'Use tools like PurgeCSS or UnCSS to remove unused CSS rules from your stylesheets.',
 'medium', 2, '{"load_time_improvement": "10-30%", "bundle_size_reduction": "20-50%"}',
 '["purgecss", "uncss", "webpack-bundle-analyzer"]'),

('Image Optimization', 'general', 'modern-image-formats', 'performance',
 'Use Modern Image Formats',
 'Convert images to WebP or AVIF formats for better compression.',
 'Use imagemin with WebP plugin to convert images to modern formats with fallbacks.',
 'easy', 1, '{"load_time_improvement": "15-40%", "bandwidth_savings": "25-80%"}',
 '["imagemin", "sharp", "cloudinary"]'),

('Bundle Splitting', 'react', 'unused-javascript', 'performance',
 'Implement Code Splitting',
 'Split JavaScript bundles to load only necessary code for each page.',
 'Use React.lazy() and dynamic imports to split your code at component level.',
 'medium', 3, '{"initial_load_improvement": "20-50%", "cache_efficiency": "high"}',
 '["webpack", "rollup", "vite"]'),

-- Accessibility recommendations
('Alt Text for Images', 'general', 'image-alt', 'accessibility',
 'Add Alt Text to Images',
 'Provide descriptive alternative text for all images.',
 'Add meaningful alt attributes to all img elements describing the image content.',
 'easy', 0.5, '{"accessibility_score": "+5-15 points"}',
 '["axe-core", "lighthouse-ci"]'),

-- SEO recommendations
('Meta Description', 'general', 'meta-description', 'seo',
 'Add Meta Descriptions',
 'Include unique meta descriptions for better search engine visibility.',
 'Add unique, descriptive meta description tags to each page (150-160 characters).',
 'easy', 0.5, '{"seo_score": "+5-10 points", "click_through_rate": "5-15%"}',
 '["yoast", "screaming-frog"]');

-- Add comments for documentation
COMMENT ON TABLE public.lighthouse_recommendation_templates IS 'Templates for generating automated fix suggestions based on Lighthouse audit results';
COMMENT ON TABLE public.lighthouse_recommendations IS 'Generated recommendations with priority scoring and progress tracking';
COMMENT ON TABLE public.lighthouse_recommendation_progress IS 'Progress tracking for implemented recommendations';
COMMENT ON TABLE public.lighthouse_recommendation_batches IS 'Grouping of related recommendations for batch processing';
COMMENT ON TABLE public.lighthouse_tool_integrations IS 'Integration configurations for optimization tools and services';
