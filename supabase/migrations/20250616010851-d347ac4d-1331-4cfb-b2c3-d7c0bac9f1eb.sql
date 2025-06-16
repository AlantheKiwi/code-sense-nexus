
-- Create table for Lighthouse audit queue
CREATE TABLE public.lighthouse_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    device TEXT NOT NULL DEFAULT 'mobile' CHECK (device IN ('mobile', 'desktop')),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    result JSONB
);

-- Create table for storing completed Lighthouse audits
CREATE TABLE public.lighthouse_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    device TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    scores JSONB NOT NULL,
    metrics JSONB NOT NULL,
    opportunities JSONB,
    diagnostics JSONB,
    full_report JSONB,
    audit_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_lighthouse_queue_status ON public.lighthouse_queue(status);
CREATE INDEX idx_lighthouse_queue_priority ON public.lighthouse_queue(priority, created_at);
CREATE INDEX idx_lighthouse_queue_project ON public.lighthouse_queue(project_id);
CREATE INDEX idx_lighthouse_audits_project ON public.lighthouse_audits(project_id);
CREATE INDEX idx_lighthouse_audits_url ON public.lighthouse_audits(url);
CREATE INDEX idx_lighthouse_audits_created_at ON public.lighthouse_audits(created_at);

-- Enable Row Level Security
ALTER TABLE public.lighthouse_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lighthouse_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lighthouse_queue
CREATE POLICY "Users can view queue items for their projects"
ON public.lighthouse_queue FOR SELECT
USING ( 
  project_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = lighthouse_queue.project_id 
    AND public.is_project_member(p.id, auth.uid())
  )
);

CREATE POLICY "Users can create queue items for their projects"
ON public.lighthouse_queue FOR INSERT
WITH CHECK ( 
  project_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = lighthouse_queue.project_id 
    AND public.is_project_member(p.id, auth.uid())
  )
);

-- RLS Policies for lighthouse_audits
CREATE POLICY "Users can view audits for their projects"
ON public.lighthouse_audits FOR SELECT
USING ( 
  project_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = lighthouse_audits.project_id 
    AND public.is_project_member(p.id, auth.uid())
  )
);

-- Allow service role to manage queue processing
CREATE POLICY "Service role can manage lighthouse queue"
ON public.lighthouse_queue FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage lighthouse audits"
ON public.lighthouse_audits FOR ALL
USING (true)
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE public.lighthouse_queue IS 'Queue system for managing Lighthouse audit requests with rate limiting';
COMMENT ON TABLE public.lighthouse_audits IS 'Storage for completed Lighthouse audit results and performance data';
