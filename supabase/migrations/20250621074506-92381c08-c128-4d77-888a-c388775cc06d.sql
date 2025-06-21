
-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Partner owners can create teams for their partner account" ON public.teams;

-- Create a more explicit INSERT policy that should work
CREATE POLICY "Users can create teams for their partner"
ON public.teams FOR INSERT
TO authenticated
WITH CHECK (
  partner_id IN (
    SELECT id FROM public.partners WHERE user_id = auth.uid()
  ) AND
  created_by = auth.uid()
);

-- Ensure the SELECT policy exists and is working
DROP POLICY IF EXISTS "Team members can view their teams" ON public.teams;

CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.partners 
    WHERE id = teams.partner_id AND user_id = auth.uid()
  )
);

-- Test the new policy logic
SELECT 
  'Policy test' as test_type,
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'No user - policy will fail'
    WHEN NOT EXISTS (SELECT 1 FROM public.partners WHERE user_id = auth.uid()) THEN 'No partner - policy will fail'
    ELSE 'Should work - user has partner'
  END as policy_evaluation;
