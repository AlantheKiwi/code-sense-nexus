
-- Debug the current user's authentication and partner data
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_email,
  (SELECT id FROM partners WHERE user_id = auth.uid()) as partner_id,
  (SELECT company_name FROM partners WHERE user_id = auth.uid()) as partner_name,
  (SELECT created_at FROM partners WHERE user_id = auth.uid()) as partner_created_at;

-- Check if there are multiple partner records for the current user
SELECT 
  'Partner count check' as check_type,
  user_id,
  COUNT(*) as partner_count,
  array_agg(id) as partner_ids,
  array_agg(company_name) as company_names
FROM partners 
WHERE user_id = auth.uid()
GROUP BY user_id;

-- Test the get_my_partner_id function directly
SELECT 
  'Function test' as test_type,
  auth.uid() as current_user,
  public.get_my_partner_id() as function_result;

-- Check current RLS policies on teams table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'teams'
ORDER BY policyname;

-- Test what the policy condition would evaluate to
SELECT 
  'Policy test' as test_type,
  auth.uid() as current_user_id,
  public.get_my_partner_id() as my_partner_id,
  CASE 
    WHEN public.get_my_partner_id() IS NOT NULL AND auth.uid() IS NOT NULL 
    THEN 'INSERT should be allowed'
    ELSE 'INSERT will be blocked'
  END as policy_evaluation;
