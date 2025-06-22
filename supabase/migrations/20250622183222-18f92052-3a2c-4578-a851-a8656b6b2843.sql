
-- Create repository_audit_results table for storing comprehensive repository audits
CREATE TABLE public.repository_audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  repository_url TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  audit_type TEXT NOT NULL DEFAULT 'full',
  overall_score INTEGER NOT NULL DEFAULT 0,
  executive_summary JSONB NOT NULL DEFAULT '{}',
  file_results JSONB NOT NULL DEFAULT '[]',
  security_summary JSONB NOT NULL DEFAULT '{}',
  quality_summary JSONB NOT NULL DEFAULT '{}',
  performance_summary JSONB NOT NULL DEFAULT '{}',
  audit_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.repository_audit_results ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own repository audit results
CREATE POLICY "Users can view their own repository audit results" 
  ON public.repository_audit_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own repository audit results
CREATE POLICY "Users can create their own repository audit results" 
  ON public.repository_audit_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own repository audit results
CREATE POLICY "Users can update their own repository audit results" 
  ON public.repository_audit_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.repository_audit_results
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add indexes for performance
CREATE INDEX idx_repository_audit_results_user_id ON public.repository_audit_results(user_id);
CREATE INDEX idx_repository_audit_results_audit_id ON public.repository_audit_results(audit_id);
CREATE INDEX idx_repository_audit_results_repository_url ON public.repository_audit_results(repository_url);
CREATE INDEX idx_repository_audit_results_created_at ON public.repository_audit_results(created_at);
CREATE INDEX idx_repository_audit_results_overall_score ON public.repository_audit_results(overall_score);

-- Create github_tokens table for storing user GitHub tokens
CREATE TABLE public.github_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  encrypted_token TEXT NOT NULL,
  token_name TEXT,
  permissions TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for github_tokens
ALTER TABLE public.github_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for github_tokens
CREATE POLICY "Users can manage their own GitHub tokens" 
  ON public.github_tokens 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for github_tokens
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.github_tokens
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Add indexes for github_tokens
CREATE INDEX idx_github_tokens_user_id ON public.github_tokens(user_id);
