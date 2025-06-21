
-- Create community patterns tracking table
CREATE TABLE public.community_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_type TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  fix_applied BOOLEAN NOT NULL DEFAULT false,
  time_to_resolve INTEGER, -- in minutes
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success_rate NUMERIC DEFAULT 0,
  frequency INTEGER DEFAULT 1
);

-- Create project health snapshots table
CREATE TABLE public.project_health_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  overall_score NUMERIC NOT NULL DEFAULT 0,
  code_quality NUMERIC NOT NULL DEFAULT 0,
  security NUMERIC NOT NULL DEFAULT 0,
  performance NUMERIC NOT NULL DEFAULT 0,
  accessibility NUMERIC NOT NULL DEFAULT 0,
  maintainability NUMERIC NOT NULL DEFAULT 0,
  issues_fixed INTEGER NOT NULL DEFAULT 0,
  new_issues_found INTEGER NOT NULL DEFAULT 0,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.community_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_health_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for community patterns (anonymous submission for privacy)
CREATE POLICY "Allow anonymous community pattern submission" 
  ON public.community_patterns 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow reading community patterns" 
  ON public.community_patterns 
  FOR SELECT 
  USING (true);

-- Create policies for project health snapshots
CREATE POLICY "Users can view project health for their projects" 
  ON public.project_health_snapshots 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM projects p 
      JOIN project_members pm ON p.id = pm.project_id 
      WHERE p.id = project_health_snapshots.project_id 
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create health snapshots for their projects" 
  ON public.project_health_snapshots 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p 
      JOIN project_members pm ON p.id = pm.project_id 
      WHERE p.id = project_health_snapshots.project_id 
      AND pm.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_community_patterns_project_type ON public.community_patterns(project_type);
CREATE INDEX idx_community_patterns_issue_type ON public.community_patterns(issue_type);
CREATE INDEX idx_project_health_snapshots_project_id ON public.project_health_snapshots(project_id);
CREATE INDEX idx_project_health_snapshots_created_at ON public.project_health_snapshots(created_at);
