
-- Step 1: Manually create a partner record for the first user.
-- This is a one-time fix because the signup trigger didn't run for this user.
INSERT INTO public.partners (user_id, company_name, slug)
VALUES ('f1ae5ad3-5bca-425e-820a-0a81c41e1d58', 'Insight AI Systems', 'insight-ai-systems-f1ae5ad3')
ON CONFLICT (user_id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- Step 2: Insert a sample project for the partner to demonstrate dashboard functionality.
-- This uses a subquery to find the partner_id and avoids creating duplicate projects.
INSERT INTO public.projects (partner_id, name, github_url, status)
SELECT 
    p.id, 
    'Sample Lovable Project', 
    'https://github.com/example/lovable-app',
    'active'
FROM 
    public.partners p
WHERE 
    p.user_id = 'f1ae5ad3-5bca-425e-820a-0a81c41e1d58'
    AND NOT EXISTS (
        SELECT 1
        FROM public.projects pr
        WHERE pr.name = 'Sample Lovable Project' AND pr.partner_id = p.id
    );
