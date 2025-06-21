
-- Check current user's partner status and data integrity
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email,
  p.id as partner_id,
  p.company_name as partner_company,
  p.user_id as partner_user_id,
  p.created_at as partner_created_at,
  CASE 
    WHEN p.id IS NULL THEN 'NO PARTNER RECORD FOUND'
    WHEN p.user_id != auth.uid() THEN 'PARTNER USER_ID MISMATCH'
    ELSE 'PARTNER RECORD OK'
  END as status
FROM public.partners p
RIGHT JOIN auth.users u ON p.user_id = u.id
WHERE u.id = auth.uid();

-- Also check if there are any orphaned or duplicate partner records
SELECT 
  'Duplicate partners check' as check_type,
  user_id,
  COUNT(*) as partner_count,
  array_agg(id) as partner_ids,
  array_agg(company_name) as company_names
FROM public.partners 
WHERE user_id = auth.uid()
GROUP BY user_id
HAVING COUNT(*) > 1

UNION ALL

SELECT 
  'All partners for user' as check_type,
  user_id,
  COUNT(*) as partner_count,
  array_agg(id) as partner_ids,
  array_agg(company_name) as company_names
FROM public.partners 
WHERE user_id = auth.uid()
GROUP BY user_id;

-- Test the RLS function directly
SELECT 
  'RLS function test' as test_type,
  auth.uid() as current_user,
  public.get_my_partner_id() as function_result,
  (SELECT id FROM public.partners WHERE user_id = auth.uid() LIMIT 1) as direct_query_result;
