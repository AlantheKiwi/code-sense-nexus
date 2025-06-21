
-- View current RLS policies on teams table
SELECT 
  schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'teams';

-- Also check what the get_my_partner_id function returns for debugging
SELECT 
  'Current auth state' as debug_type,
  auth.uid() as current_user_id,
  public.get_my_partner_id() as my_partner_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'No authenticated user'
    WHEN public.get_my_partner_id() IS NULL THEN 'User has no partner'
    ELSE 'User authenticated with partner'
  END as auth_status;
