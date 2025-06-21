
-- Check for duplicate partners
SELECT user_id, COUNT(*) as count FROM partners GROUP BY user_id HAVING COUNT(*) > 1;

-- Check for duplicate debugging sessions (fixed GROUP BY)
SELECT project_id, COUNT(*) as count FROM debugging_sessions GROUP BY project_id HAVING COUNT(*) > 1;

-- Check eslint_analysis_queue for any issues
SELECT project_id, COUNT(*) as count FROM eslint_analysis_queue GROUP BY project_id HAVING COUNT(*) > 1;

-- Additional diagnostic queries to understand the data better
-- Check total counts in each table
SELECT 'partners' as table_name, COUNT(*) as total_count FROM partners
UNION ALL
SELECT 'debugging_sessions' as table_name, COUNT(*) as total_count FROM debugging_sessions
UNION ALL
SELECT 'eslint_analysis_queue' as table_name, COUNT(*) as total_count FROM eslint_analysis_queue;

-- Check for any orphaned records
SELECT 'orphaned_sessions' as check_type, COUNT(*) as count 
FROM debugging_sessions ds 
WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = ds.project_id);

-- Get a sample of debugging sessions to understand the structure
SELECT id, project_id, user_id, status, created_at 
FROM debugging_sessions 
ORDER BY created_at DESC 
LIMIT 5;
