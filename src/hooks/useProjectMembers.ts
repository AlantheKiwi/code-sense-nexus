
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  user_profile: {
    email: string;
    full_name: string | null;
  };
}

// --- Fetch Members ---
const fetchProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const { data, error } = await supabase.functions.invoke<ProjectMember[]>('manage-project-members', {
    method: 'GET',
    body: { project_id: projectId },
  });
  if (error) throw new Error(error.message);
  return data || [];
};

export const useProjectMembersData = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => fetchProjectMembers(projectId!),
    enabled: !!projectId,
  });
};

// --- Add Member ---
const addProjectMember = async (params: { projectId: string; email: string; role: 'admin' | 'editor' | 'viewer' }) => {
  const { data, error } = await supabase.functions.invoke('manage-project-members', {
    method: 'POST',
    body: { project_id: params.projectId, email: params.email, role: params.role },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const useAddProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProjectMember,
    onSuccess: () => {
      toast.success('Member added successfully!');
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
    onError: (error: Error) => toast.error(`Failed to add member: ${error.message}`),
  });
};

// --- Update Member ---
const updateProjectMember = async (params: { projectId: string; userId: string; role: 'admin' | 'editor' | 'viewer' }) => {
  const { data, error } = await supabase.functions.invoke('manage-project-members', {
    method: 'PATCH',
    body: { project_id: params.projectId, user_id: params.userId, role: params.role },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const useUpdateProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProjectMember,
    onSuccess: () => {
      toast.success('Member role updated!');
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
    onError: (error: Error) => toast.error(`Failed to update role: ${error.message}`),
  });
};

// --- Remove Member ---
const removeProjectMember = async (params: { projectId: string; userId: string }) => {
  const { data, error } = await supabase.functions.invoke('manage-project-members', {
    method: 'DELETE',
    body: { project_id: params.projectId, user_id: params.userId },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const useRemoveProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeProjectMember,
    onSuccess: () => {
      toast.success('Member removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
    onError: (error: Error) => toast.error(`Failed to remove member: ${error.message}`),
  });
};
