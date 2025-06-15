
-- Create a custom type for project roles for better data integrity.
CREATE TYPE public.project_role AS ENUM ('admin', 'editor', 'viewer');

-- Create a table to link users to projects with specific roles.
CREATE TABLE public.project_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role public.project_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, user_id)
);

-- Add comments for clarity.
COMMENT ON TABLE public.project_members IS 'Manages user roles and access for each project.';
COMMENT ON COLUMN public.project_members.role IS 'Role of the user in the project, e.g., admin, editor, viewer.';

-- This function will be triggered when a new project is created.
-- It automatically makes the partner who owns the project an 'admin' of that new project.
CREATE OR REPLACE FUNCTION public.handle_new_project_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    partner_owner_id UUID;
BEGIN
    -- Find the user_id of the owner of the partner associated with the new project.
    SELECT user_id INTO partner_owner_id
    FROM partners
    WHERE id = NEW.partner_id;

    -- If an owner is found, insert them into project_members as an 'admin'.
    IF partner_owner_id IS NOT NULL THEN
        INSERT INTO public.project_members (project_id, user_id, role)
        VALUES (NEW.id, partner_owner_id, 'admin');
    ELSE
        RAISE WARNING 'No partner owner found for partner_id % when creating project %', NEW.partner_id, NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

-- Create the trigger on the projects table.
CREATE TRIGGER on_project_created_add_owner
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_project_creation();

-- Helper function to check if a user is a member of a project.
-- SECURITY DEFINER is used to bypass RLS and prevent infinite recursion.
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE project_id = _project_id AND user_id = _user_id
  );
$$;

-- Helper function to check if a user is an admin of a project.
CREATE OR REPLACE FUNCTION public.is_project_admin(_project_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE project_id = _project_id AND user_id = _user_id AND role = 'admin'
  );
$$;

-- Enable Row Level Security (RLS) on the projects table.
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for the 'projects' table.
CREATE POLICY "Users can see projects they are members of" ON public.projects
FOR SELECT USING (public.is_project_member(id, auth.uid()));

CREATE POLICY "Partner owners can create projects" ON public.projects
FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.partners p WHERE p.id = projects.partner_id AND p.user_id = auth.uid()
));

CREATE POLICY "Project admins can update their projects" ON public.projects
FOR UPDATE USING (public.is_project_admin(id, auth.uid()));

CREATE POLICY "Project admins can delete their projects" ON public.projects
FOR DELETE USING (public.is_project_admin(id, auth.uid()));

-- Enable Row Level Security (RLS) on the project_members table.
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for the 'project_members' table.
CREATE POLICY "Project members can view other members" ON public.project_members
FOR SELECT USING (public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Project admins can add members" ON public.project_members
FOR INSERT WITH CHECK (public.is_project_admin(project_id, auth.uid()));

CREATE POLICY "Project admins can update members" ON public.project_members
FOR UPDATE USING (public.is_project_admin(project_id, auth.uid())) WITH CHECK (public.is_project_admin(project_id, auth.uid()));

CREATE POLICY "Project admins can remove members" ON public.project_members
FOR DELETE USING (public.is_project_admin(project_id, auth.uid()));

