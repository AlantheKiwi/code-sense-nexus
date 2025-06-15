
-- This extension is needed for full-text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table to store indexed content for searching
CREATE TABLE public.search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- e.g., 'error_report', 'debugging_session'
    content_id UUID NOT NULL,
    searchable_text TSVECTOR,
    keywords TEXT[],
    indexed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, content_type, content_id)
);
CREATE INDEX idx_search_index_project_id ON public.search_index(project_id);
CREATE INDEX idx_search_index_searchable_text ON public.search_index USING GIN(searchable_text);
COMMENT ON TABLE public.search_index IS 'Stores indexed content for fast full-text search.';

-- Table to log user search queries
CREATE TABLE public.search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    query_text TEXT,
    filters JSONB,
    results_count INT NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_search_queries_user_id ON public.search_queries(user_id);
COMMENT ON TABLE public.search_queries IS 'Logs all search queries made by users.';

-- Table for users to save their frequent searches
CREATE TABLE public.saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query_text TEXT,
    filters JSONB,
    notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);
COMMENT ON TABLE public.saved_searches IS 'Stores user-defined saved searches.';

-- Table for tracking search analytics, e.g., click-through rates
CREATE TABLE public.search_analytics (
    id BIGSERIAL PRIMARY KEY,
    query_id UUID REFERENCES public.search_queries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    clicked_content_type TEXT,
    clicked_content_id UUID,
    rank INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.search_analytics IS 'Tracks user interactions with search results for analytics.';

-- Enable RLS for all new tables
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can search content within projects they are a member of.
CREATE POLICY "Users can search content in their projects"
ON public.search_index FOR SELECT
USING ( public.is_project_member(project_id, auth.uid()) );

-- For inserting, we'll use an edge function with service role key.
CREATE POLICY "Service role can manage search index"
ON public.search_index FOR ALL
USING ( (SELECT rolname FROM pg_roles WHERE oid = session_user::oid) = 'supabase_admin' ) 
WITH CHECK ( (SELECT rolname FROM pg_roles WHERE oid = session_user::oid) = 'supabase_admin' );

-- Users can view their own search history.
CREATE POLICY "Users can view their own search queries"
ON public.search_queries FOR SELECT
USING ( user_id = auth.uid() );

CREATE POLICY "Users can log their own search queries"
ON public.search_queries FOR INSERT
WITH CHECK ( user_id = auth.uid() AND partner_id = public.get_my_partner_id() );

-- Users can manage their own saved searches.
CREATE POLICY "Users can manage their own saved searches"
ON public.saved_searches FOR ALL
USING ( user_id = auth.uid() )
WITH CHECK ( user_id = auth.uid() AND partner_id = public.get_my_partner_id() );

-- Analytics policies
CREATE POLICY "Users can log their own search analytics"
ON public.search_analytics FOR INSERT
WITH CHECK ( user_id = auth.uid() AND partner_id = public.get_my_partner_id() );

CREATE POLICY "Partners can view their members' analytics"
ON public.search_analytics FOR SELECT
USING ( partner_id = public.get_my_partner_id() );

-- Trigger to update 'updated_at' on saved_searches table
CREATE TRIGGER handle_saved_searches_updated_at
BEFORE UPDATE ON public.saved_searches
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
