
-- Add the partner owner as an admin member of the project
INSERT INTO public.project_members (project_id, user_id, role)
VALUES ('0b37d298-3012-4a69-97d7-570bb739ab12', 'f1ae5ad3-5bca-425e-820a-0a81c41e1d58', 'admin')
ON CONFLICT (project_id, user_id) DO UPDATE SET
  role = 'admin',
  created_at = now();
