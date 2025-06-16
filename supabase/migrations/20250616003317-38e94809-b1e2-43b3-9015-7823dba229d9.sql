
-- Create ESLint results table
CREATE TABLE public.eslint_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  issues JSONB NOT NULL DEFAULT '[]',
  severity_counts JSONB NOT NULL DEFAULT '{"error": 0, "warn": 0, "info": 0}',
  quality_score NUMERIC,
  total_issues INTEGER NOT NULL DEFAULT 0,
  configuration_used UUID REFERENCES public.eslint_configurations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for eslint_results
ALTER TABLE public.eslint_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ESLint results for their projects" 
  ON public.eslint_results 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p 
      JOIN public.project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ESLint results for their projects" 
  ON public.eslint_results 
  FOR INSERT 
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p 
      JOIN public.project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = auth.uid() AND pm.role IN ('admin', 'editor')
    )
  );

-- Create project summary table for aggregated results
CREATE TABLE public.eslint_project_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  total_files INTEGER NOT NULL DEFAULT 0,
  total_issues INTEGER NOT NULL DEFAULT 0,
  severity_counts JSONB NOT NULL DEFAULT '{"error": 0, "warn": 0, "info": 0}',
  category_counts JSONB NOT NULL DEFAULT '{"code_quality": 0, "potential_bugs": 0, "style_violations": 0, "security": 0}',
  average_quality_score NUMERIC,
  last_analysis_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Add RLS policies for project summaries
ALTER TABLE public.eslint_project_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ESLint summaries for their projects" 
  ON public.eslint_project_summaries 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p 
      JOIN public.project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = auth.uid()
    )
  );

-- Create issue trends table for historical tracking
CREATE TABLE public.eslint_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_issues INTEGER NOT NULL DEFAULT 0,
  severity_counts JSONB NOT NULL DEFAULT '{}',
  category_counts JSONB NOT NULL DEFAULT '{}',
  quality_score NUMERIC,
  files_analyzed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for trends
ALTER TABLE public.eslint_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ESLint trends for their projects" 
  ON public.eslint_trends 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p 
      JOIN public.project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = auth.uid()
    )
  );

-- Create fix suggestions table
CREATE TABLE public.eslint_fix_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES public.eslint_results(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  fix_description TEXT NOT NULL,
  code_example TEXT,
  fixed_code_example TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  estimated_time_minutes INTEGER,
  category TEXT NOT NULL DEFAULT 'code_quality' CHECK (category IN ('code_quality', 'potential_bugs', 'style_violations', 'security')),
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for fix suggestions
ALTER TABLE public.eslint_fix_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fix suggestions for their project results" 
  ON public.eslint_fix_suggestions 
  FOR SELECT 
  USING (
    result_id IN (
      SELECT er.id FROM public.eslint_results er
      JOIN public.projects p ON er.project_id = p.id
      JOIN public.project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = auth.uid()
    )
  );

-- Create critical issues alerts table
CREATE TABLE public.eslint_critical_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  result_id UUID NOT NULL REFERENCES public.eslint_results(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'critical_error',
  message TEXT NOT NULL,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  rule_id TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for critical alerts
ALTER TABLE public.eslint_critical_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view critical alerts for their projects" 
  ON public.eslint_critical_alerts 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p 
      JOIN public.project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update critical alerts for their projects" 
  ON public.eslint_critical_alerts 
  FOR UPDATE 
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p 
      JOIN public.project_members pm ON p.id = pm.project_id 
      WHERE pm.user_id = auth.uid() AND pm.role IN ('admin', 'editor')
    )
  );

-- Add indexes for performance
CREATE INDEX idx_eslint_results_project_id ON public.eslint_results(project_id);
CREATE INDEX idx_eslint_results_file_path ON public.eslint_results(file_path);
CREATE INDEX idx_eslint_results_created_at ON public.eslint_results(created_at);
CREATE INDEX idx_eslint_trends_project_date ON public.eslint_trends(project_id, analysis_date);
CREATE INDEX idx_eslint_critical_alerts_project_unresolved ON public.eslint_critical_alerts(project_id, is_resolved);

-- Add triggers for updated_at
CREATE TRIGGER handle_eslint_results_updated_at
  BEFORE UPDATE ON public.eslint_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_eslint_project_summaries_updated_at
  BEFORE UPDATE ON public.eslint_project_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
