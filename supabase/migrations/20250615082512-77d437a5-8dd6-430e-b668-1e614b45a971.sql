
-- Table to store AI analysis results
CREATE TABLE public.ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    analysis_type TEXT NOT NULL, -- e.g., 'review', 'optimize', 'security'
    analysis_result JSONB,
    quality_score NUMERIC(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_analysis_results IS 'Stores results from AI-powered code analysis.';
COMMENT ON COLUMN public.ai_analysis_results.analysis_type IS 'The type of analysis performed (e.g., ''review'', ''optimize'', ''security'').';
COMMENT ON COLUMN public.ai_analysis_results.quality_score IS 'A numeric score from 0-100 representing the code''s quality.';


-- Table for AI-generated fix suggestions
CREATE TABLE public.ai_fix_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.ai_analysis_results(id) ON DELETE CASCADE,
    suggestion_text TEXT NOT NULL,
    implementation_code TEXT,
    priority TEXT NOT NULL DEFAULT 'medium', -- e.g., 'high', 'medium', 'low'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_fix_suggestions IS 'Stores AI-generated suggestions for fixing code issues.';


-- Table to log interactions with the AI analysis service
CREATE TABLE public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    function_name TEXT NOT NULL, -- e.g., 'ai-code-analysis'
    prompt_tokens INT,
    completion_tokens INT,
    total_tokens INT,
    cost NUMERIC(10, 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_interactions IS 'Logs API calls to AI services for usage tracking and cost management.';
COMMENT ON COLUMN public.ai_interactions.cost IS 'Estimated cost of the AI interaction in USD.';


-- RLS Policies for ai_analysis_results
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analysis for projects they are members of"
ON public.ai_analysis_results FOR SELECT
USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Users can create analysis for projects they are members of"
ON public.ai_analysis_results FOR INSERT
WITH CHECK (public.is_project_member(project_id, auth.uid()));


-- RLS Policies for ai_fix_suggestions
ALTER TABLE public.ai_fix_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suggestions for analyses they can access"
ON public.ai_fix_suggestions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ai_analysis_results aar
    WHERE aar.id = ai_fix_suggestions.analysis_id
  )
);

CREATE POLICY "Users can create suggestions for analyses they can access"
ON public.ai_fix_suggestions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_analysis_results aar
    WHERE aar.id = ai_fix_suggestions.analysis_id
  )
);


-- RLS Policies for ai_interactions
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Partner owners can see all interactions for their partner account
CREATE POLICY "Partner owners can view their partner's AI interactions"
ON public.ai_interactions FOR SELECT
USING (partner_id = public.get_my_partner_id());

