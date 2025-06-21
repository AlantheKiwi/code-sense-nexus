
-- Debug the current user's authentication and partner status
SELECT 
  auth.uid() as current_user_id,
  public.get_my_partner_id() as my_partner_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email,
  (SELECT company_name FROM public.partners WHERE user_id = auth.uid()) as partner_company;

-- Test if the RLS policy logic should work
SELECT 
  'test-team' as name,
  public.get_my_partner_id() as partner_id,
  auth.uid() as created_by,
  CASE 
    WHEN public.get_my_partner_id() IS NOT NULL AND auth.uid() IS NOT NULL 
    THEN 'Should be allowed'
    ELSE 'Will be blocked'
  END as policy_check;

-- Check if there are any partners for the current user
SELECT 
  p.id as partner_id,
  p.user_id,
  p.company_name,
  p.created_at
FROM public.partners p 
WHERE p.user_id = auth.uid();

-- Check current RLS policies on teams table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'teams';
