
-- Step 1: Create ENUM types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_platform_type') THEN
        CREATE TYPE public.project_platform_type AS ENUM ('lovable', 'bubble', 'webflow', 'flutterflow', 'other');
    END IF;
END$$;

-- Step 2: Create 'tenants' table
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    pricing_tier text DEFAULT 'starter',
    custom_domain text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.tenants IS 'Stores information about white-label partners (tenants).';
COMMENT ON COLUMN public.tenants.user_id IS 'The master user account associated with this tenant.';

-- RLS for 'tenants'
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants can view their own data" ON public.tenants;
CREATE POLICY "Tenants can view their own data" ON public.tenants FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Tenants can insert their own data" ON public.tenants;
CREATE POLICY "Tenants can insert their own data" ON public.tenants FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Tenants can update their own data" ON public.tenants;
CREATE POLICY "Tenants can update their own data" ON public.tenants FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Tenants can delete their own data" ON public.tenants;
CREATE POLICY "Tenants can delete their own data" ON public.tenants FOR DELETE USING (user_id = auth.uid());

-- Step 3: Create helper function for RLS
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.tenants WHERE user_id = auth.uid() LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_tenant_id() TO authenticated;

-- Step 4: Create 'projects' table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    platform_type public.project_platform_type NOT NULL,
    repository_url text,
    bubble_app_id text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.projects IS 'Stores project information for each tenant.';
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage projects of their tenant" ON public.projects;
CREATE POLICY "Users can manage projects of their tenant" ON public.projects FOR ALL
    USING (tenant_id = public.get_my_tenant_id())
    WITH CHECK (tenant_id = public.get_my_tenant_id());

-- Step 5: Modify 'api_key_configs' table
ALTER TABLE public.api_key_configs DISABLE ROW LEVEL SECURITY;
-- Drop potentially existing old policies based on user_id
DROP POLICY IF EXISTS "Users can view their own API key configs" ON public.api_key_configs;
DROP POLICY IF EXISTS "Users can create their own API key configs" ON public.api_key_configs;
DROP POLICY IF EXISTS "Users can update their own API key configs" ON public.api_key_configs;
DROP POLICY IF EXISTS "Users can delete their own API key configs" ON public.api_key_configs;
-- Drop old foreign key constraint if it exists
DO $$ BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='api_key_configs_user_id_fkey' AND table_name='api_key_configs' AND table_schema='public') THEN
        ALTER TABLE public.api_key_configs DROP CONSTRAINT api_key_configs_user_id_fkey;
    END IF;
END $$;
-- Add tenant_id column and drop user_id column
ALTER TABLE public.api_key_configs ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.api_key_configs DROP COLUMN IF EXISTS user_id CASCADE; -- Use CASCADE to remove dependent objects like old policies if any still linger
-- Add new foreign key for tenant_id
ALTER TABLE public.api_key_configs ADD CONSTRAINT api_key_configs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.api_key_configs.tenant_id IS 'Tenant associated with this API key configuration.';
-- Enable RLS and create new policies based on tenant_id
ALTER TABLE public.api_key_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage API keys for their tenant" ON public.api_key_configs;
CREATE POLICY "Users can manage API keys for their tenant" ON public.api_key_configs FOR ALL
    USING (tenant_id = public.get_my_tenant_id())
    WITH CHECK (tenant_id = public.get_my_tenant_id());

-- Step 6: Modify 'repository_analyses' table
ALTER TABLE public.repository_analyses DISABLE ROW LEVEL SECURITY;
-- Drop potentially existing old policies based on user_id
DROP POLICY IF EXISTS "Users can view their own repository analyses" ON public.repository_analyses;
DROP POLICY IF EXISTS "Users can create their own repository analyses" ON public.repository_analyses;
DROP POLICY IF EXISTS "Users can update their own repository analyses" ON public.repository_analyses;
DROP POLICY IF EXISTS "Users can delete their own repository analyses" ON public.repository_analyses;
-- Drop old foreign key constraint if it exists
DO $$ BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='repository_analyses_user_id_fkey' AND table_name='repository_analyses' AND table_schema='public') THEN
        ALTER TABLE public.repository_analyses DROP CONSTRAINT repository_analyses_user_id_fkey;
    END IF;
END $$;
-- Add tenant_id, project_id and drop old columns
ALTER TABLE public.repository_analyses ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.repository_analyses ADD COLUMN IF NOT EXISTS project_id uuid;
ALTER TABLE public.repository_analyses DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE public.repository_analyses DROP COLUMN IF EXISTS repo_name CASCADE;
ALTER TABLE public.repository_analyses DROP COLUMN IF EXISTS repo_full_name CASCADE;
ALTER TABLE public.repository_analyses DROP COLUMN IF EXISTS repo_url CASCADE;
-- Add new foreign keys
ALTER TABLE public.repository_analyses ADD CONSTRAINT repository_analyses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.repository_analyses ADD CONSTRAINT repository_analyses_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.repository_analyses.tenant_id IS 'Tenant associated with this analysis.';
COMMENT ON COLUMN public.repository_analyses.project_id IS 'Project associated with this analysis.';
-- Enable RLS and create new policies
ALTER TABLE public.repository_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage analyses for their tenant" ON public.repository_analyses;
CREATE POLICY "Users can manage analyses for their tenant" ON public.repository_analyses FOR ALL
    USING (tenant_id = public.get_my_tenant_id())
    WITH CHECK (tenant_id = public.get_my_tenant_id());

-- Step 7: Rename 'code_issues' to 'issues' if it exists, then modify 'issues'
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'code_issues') THEN
        ALTER TABLE public.code_issues RENAME TO issues;
    END IF;
END $$;
-- Modify 'issues' table (assuming it's now named 'issues')
ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;
-- Drop potentially existing old policies based on user_id if this table also had them
DROP POLICY IF EXISTS "Users can view their own issues" ON public.issues;
DROP POLICY IF EXISTS "Users can create their own issues" ON public.issues;
DROP POLICY IF EXISTS "Users can update their own issues" ON public.issues;
DROP POLICY IF EXISTS "Users can delete their own issues" ON public.issues;
-- Add tenant_id, project_id
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS project_id uuid;
-- Add new foreign keys
ALTER TABLE public.issues ADD CONSTRAINT issues_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.issues ADD CONSTRAINT issues_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.issues.tenant_id IS 'Tenant associated with this issue.';
COMMENT ON COLUMN public.issues.project_id IS 'Project associated with this issue.';
-- Enable RLS and create new policies
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage issues for their tenant" ON public.issues;
CREATE POLICY "Users can manage issues for their tenant" ON public.issues FOR ALL
    USING (tenant_id = public.get_my_tenant_id())
    WITH CHECK (tenant_id = public.get_my_tenant_id());

