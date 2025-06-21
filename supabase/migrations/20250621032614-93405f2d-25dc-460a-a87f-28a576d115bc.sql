
-- Drop and recreate the INSERT policy with better debugging
DROP POLICY IF EXISTS "Partner owners can create teams for their partner account" ON public.teams;

-- Create a more explicit policy that should work
CREATE POLICY "Partner owners can create teams for their partner account"
ON public.teams FOR INSERT
WITH CHECK (
  partner_id = (SELECT id FROM public.partners WHERE user_id = auth.uid() LIMIT 1) AND
  created_by = auth.uid()
);

-- Also ensure we have the correct SELECT policy
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT
USING (public.is_team_member(id, auth.uid()));
