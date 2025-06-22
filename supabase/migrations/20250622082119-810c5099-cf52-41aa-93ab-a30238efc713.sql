
-- Create security_audit_results table for storing professional security audit data
CREATE TABLE public.security_audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  audit_type TEXT NOT NULL DEFAULT 'comprehensive',
  security_score INTEGER NOT NULL DEFAULT 0,
  executive_summary JSONB NOT NULL DEFAULT '{}',
  vulnerabilities JSONB NOT NULL DEFAULT '[]',
  compliance JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  audit_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.security_audit_results ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own audit results
CREATE POLICY "Users can view their own security audit results" 
  ON public.security_audit_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own audit results
CREATE POLICY "Users can create their own security audit results" 
  ON public.security_audit_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own audit results
CREATE POLICY "Users can update their own security audit results" 
  ON public.security_audit_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.security_audit_results
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add foreign key references
ALTER TABLE public.security_audit_results 
  ADD CONSTRAINT security_audit_results_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_security_audit_results_user_id ON public.security_audit_results(user_id);
CREATE INDEX idx_security_audit_results_project_id ON public.security_audit_results(project_id);
CREATE INDEX idx_security_audit_results_created_at ON public.security_audit_results(created_at);
