
-- First, check if the table already exists and drop it if needed to recreate with proper schema
DROP TABLE IF EXISTS public.eslint_analysis_queue CASCADE;

-- Create the eslint_analysis_queue table with proper schema
CREATE TABLE public.eslint_analysis_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'scheduled', 'git_commit', 'file_upload')),
  trigger_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'retrying', 'cancelled')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status_message TEXT,
  result_summary JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.eslint_analysis_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project-based access control
CREATE POLICY "Users can view queue items for their projects" 
  ON public.eslint_analysis_queue 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_members.project_id = eslint_analysis_queue.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create queue items for their projects" 
  ON public.eslint_analysis_queue 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_members.project_id = eslint_analysis_queue.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update queue items for their projects" 
  ON public.eslint_analysis_queue 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members 
      WHERE project_members.project_id = eslint_analysis_queue.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_eslint_queue_project_id ON public.eslint_analysis_queue(project_id);
CREATE INDEX idx_eslint_queue_status ON public.eslint_analysis_queue(status);
CREATE INDEX idx_eslint_queue_scheduled_at ON public.eslint_analysis_queue(scheduled_at);
CREATE INDEX idx_eslint_queue_priority ON public.eslint_analysis_queue(priority DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_eslint_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_eslint_queue_updated_at 
  BEFORE UPDATE ON public.eslint_analysis_queue 
  FOR EACH ROW EXECUTE FUNCTION update_eslint_queue_updated_at();
