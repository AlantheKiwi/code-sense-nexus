
-- Step 0: Drop RLS policies from tables that depend on get_my_tenant_id() or the old 'tenants' table
ALTER TABLE public.api_key_configs DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage API keys for their tenant" ON public.api_key_configs;

ALTER TABLE public.repository_analyses DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage analyses for their tenant" ON public.repository_analyses;

ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage issues for their tenant" ON public.issues;

-- Step 0.1: Disable RLS and drop policy from the OLD projects table
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can manage projects of their tenant" ON public.projects;
  END IF;
END $$;

-- Step 1: Drop the old helper function and tables
DROP FUNCTION IF EXISTS public.get_my_tenant_id() CASCADE; -- Added CASCADE
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Step 2: Create 'partners' table (agencies/consultants)
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'starter',
  branding_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.partners IS 'Stores information about white-label partners (agencies/consultants).';

-- RLS for 'partners'
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their own data"
  ON public.partners
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Step 3: Create new helper function for partner_id
CREATE OR REPLACE FUNCTION public.get_my_partner_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.partners WHERE user_id = auth.uid() LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_partner_id() TO authenticated;

-- Step 4: Create 'clients' table (end-users invited by partners)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.clients IS 'Stores client user information, invited by partners.';

-- RLS for 'clients'
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their clients"
  ON public.clients
  FOR ALL
  USING (partner_id = public.get_my_partner_id())
  WITH CHECK (partner_id = public.get_my_partner_id());
CREATE POLICY "Clients can manage their own data"
  ON public.clients
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Step 5: Create NEW 'projects' table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  github_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.projects IS 'Stores project information, linked to a partner and optionally a client.';

-- RLS for NEW 'projects'
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can manage their projects"
  ON public.projects
  FOR ALL
  USING (partner_id = public.get_my_partner_id())
  WITH CHECK (partner_id = public.get_my_partner_id());
CREATE POLICY "Clients can view their_assigned projects"
  ON public.projects
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.clients WHERE public.clients.id = projects.client_id AND public.clients.user_id = auth.uid()));

-- Re-enable RLS on other tables (policies will need to be redefined if they should be partner-scoped)
ALTER TABLE public.api_key_configs ENABLE ROW LEVEL SECURITY;
-- Ponder: CREATE POLICY "Partners can manage API keys for their partner account" ON public.api_key_configs FOR ALL USING (tenant_id = public.get_my_partner_id()) WITH CHECK (tenant_id = public.get_my_partner_id()); -- Note: tenant_id column would map to partner_id logic.

ALTER TABLE public.repository_analyses ENABLE ROW LEVEL SECURITY;
-- Ponder: CREATE POLICY "Partners can manage analyses for their partner account" ON public.repository_analyses FOR ALL USING (tenant_id = public.get_my_partner_id()) WITH CHECK (tenant_id = public.get_my_partner_id());

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
-- Ponder: CREATE POLICY "Partners can manage issues for their partner account" ON public.issues FOR ALL USING (tenant_id = public.get_my_partner_id()) WITH CHECK (tenant_id = public.get_my_partner_id());

