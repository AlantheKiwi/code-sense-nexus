
-- 1. Create an enum for team roles
CREATE TYPE public.team_role AS ENUM ('admin', 'developer', 'viewer');

-- 2. Create the teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    settings JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.teams IS 'Stores team information, associated with a partner account.';

-- 3. Create the team_members table
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Not a FK to auth.users to avoid issues if user is deleted.
    role public.team_role NOT NULL DEFAULT 'viewer',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(team_id, user_id)
);
COMMENT ON TABLE public.team_members IS 'Manages user membership and roles within teams.';

-- 4. Create helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_team_member(_team_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_admin(_team_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id AND role = 'admin'
  );
$$;

-- 5. Enable RLS and create policies for teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT
USING (public.is_team_member(id, auth.uid()));

CREATE POLICY "Partner owners can create teams for their partner account"
ON public.teams FOR INSERT
WITH CHECK (partner_id = public.get_my_partner_id());

CREATE POLICY "Team admins can update their teams"
ON public.teams FOR UPDATE
USING (public.is_team_admin(id, auth.uid()));

CREATE POLICY "Team admins can delete their teams"
ON public.teams FOR DELETE
USING (public.is_team_admin(id, auth.uid()));

-- 6. Enable RLS and create policies for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view other members of their team"
ON public.team_members FOR SELECT
USING (public.is_team_member(team_id, auth.uid()));

CREATE POLICY "Team admins can add members to their team"
ON public.team_members FOR INSERT
WITH CHECK (public.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can update member roles"
ON public.team_members FOR UPDATE
USING (public.is_team_admin(team_id, auth.uid()));

CREATE POLICY "Team admins can remove members from their team"
ON public.team_members FOR DELETE
USING (public.is_team_admin(team_id, auth.uid()));


-- 7. Add team_id to debugging_sessions
ALTER TABLE public.debugging_sessions
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.debugging_sessions.team_id IS 'The team this debugging session is shared with.';


-- 8. Update RLS on debugging_sessions to include team access
-- Drop the existing policy if it exists, to recreate it with the new logic.
DROP POLICY IF EXISTS "Users can access debugging sessions for their projects" ON public.debugging_sessions;

-- Create a new policy that allows access for project members OR team members.
CREATE POLICY "Users can access debugging sessions for their projects or teams"
ON public.debugging_sessions
FOR ALL
USING (
  public.is_project_member(project_id, auth.uid()) OR
  (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid()))
);

