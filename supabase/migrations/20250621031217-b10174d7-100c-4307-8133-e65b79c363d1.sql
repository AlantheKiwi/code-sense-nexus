
-- Check if the get_my_partner_id function exists and works correctly
CREATE OR REPLACE FUNCTION public.get_my_partner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.partners WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_partner_id() TO authenticated;

-- Check and fix the teams table RLS policy for INSERT
DROP POLICY IF EXISTS "Partner owners can create teams for their partner account" ON public.teams;

CREATE POLICY "Partner owners can create teams for their partner account"
ON public.teams FOR INSERT
WITH CHECK (
  partner_id = public.get_my_partner_id() AND
  created_by = auth.uid()
);

-- Also ensure there's a SELECT policy for teams
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT
USING (public.is_team_member(id, auth.uid()));
