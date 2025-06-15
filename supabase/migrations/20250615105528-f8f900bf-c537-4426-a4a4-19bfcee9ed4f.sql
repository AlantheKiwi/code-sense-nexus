
-- Table for API endpoints documentation (structured data)
CREATE TABLE public.api_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    summary TEXT,
    tags TEXT[],
    parameters JSONB,
    responses JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(partner_id, path, method)
);
COMMENT ON TABLE public.api_endpoints IS 'Stores the core structured data for each API endpoint.';

-- Table for the documentation content itself (unstructured/markdown)
CREATE TABLE public.api_documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES public.api_endpoints(id) ON DELETE CASCADE,
    content TEXT, -- Markdown content for the documentation page
    version TEXT NOT NULL DEFAULT '1.0.0',
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.api_documentation IS 'Stores the textual content and versioning for endpoint documentation.';

-- Create a table for language-specific code examples
CREATE TABLE public.api_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES public.api_endpoints(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    code_example TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.api_examples IS 'Stores language-specific code examples for API endpoints.';

-- Create a table for the API changelog
CREATE TABLE public.api_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    release_date DATE NOT NULL,
    changes TEXT,
    breaking_changes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.api_changelog IS 'Maintains a version history of API changes.';

-- Create a table for complex, multi-step usage examples
CREATE TABLE public.api_usage_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    use_case TEXT NOT NULL,
    full_example TEXT,
    difficulty_level TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.api_usage_examples IS 'Provides complex, multi-step usage examples and scenarios.';

-- Add triggers for updated_at timestamps
CREATE TRIGGER on_api_endpoints_update BEFORE UPDATE ON public.api_endpoints FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_api_documentation_update BEFORE UPDATE ON public.api_documentation FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_api_examples_update BEFORE UPDATE ON public.api_examples FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_api_usage_examples_update BEFORE UPDATE ON public.api_usage_examples FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_examples ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Documentation is readable by authenticated users. Management is restricted to partner owners.
CREATE POLICY "Authenticated users can read API endpoints" ON public.api_endpoints FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Partners can manage their own API endpoints" ON public.api_endpoints FOR ALL USING (partner_id = public.get_my_partner_id()) WITH CHECK (partner_id = public.get_my_partner_id());

CREATE POLICY "Authenticated users can read API documentation content" ON public.api_documentation FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Partners can manage their own API documentation" ON public.api_documentation FOR ALL USING (endpoint_id IN (SELECT id FROM public.api_endpoints WHERE partner_id = public.get_my_partner_id())) WITH CHECK (endpoint_id IN (SELECT id FROM public.api_endpoints WHERE partner_id = public.get_my_partner_id()));

CREATE POLICY "Authenticated users can read API examples" ON public.api_examples FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Partners can manage their own API examples" ON public.api_examples FOR ALL USING (endpoint_id IN (SELECT id FROM public.api_endpoints WHERE partner_id = public.get_my_partner_id())) WITH CHECK (endpoint_id IN (SELECT id FROM public.api_endpoints WHERE partner_id = public.get_my_partner_id()));

CREATE POLICY "Authenticated users can read API changelog" ON public.api_changelog FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Partners can manage their own API changelog" ON public.api_changelog FOR ALL USING (partner_id = public.get_my_partner_id()) WITH CHECK (partner_id = public.get_my_partner_id());

CREATE POLICY "Authenticated users can read API usage examples" ON public.api_usage_examples FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Partners can manage their own API usage examples" ON public.api_usage_examples FOR ALL USING (partner_id = public.get_my_partner_id()) WITH CHECK (partner_id = public.get_my_partner_id());
