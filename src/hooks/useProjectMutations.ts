
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ProjectInsert = TablesInsert<'projects'>;
type ProjectUpdate = TablesUpdate<'projects'>;

// --- Add Project ---
const addProject = async (newProject: ProjectInsert) => {
  const { data, error } = await supabase.from('projects').insert(newProject).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const useAddProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProject,
    onSuccess: (data) => {
      toast.success('Project added successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects', data.partner_id] });
    },
    onError: (error) => {
      toast.error(`Failed to add project: ${error.message}`);
    },
  });
};

// --- Update Project ---
const updateProject = async (updatedProject: ProjectUpdate & { id: string }) => {
    const { id, ...updateData } = updatedProject;
    const { data, error } = await supabase.from('projects').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProject,
        onSuccess: (data) => {
            toast.success('Project updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['projects', data.partner_id] });
        },
        onError: (error) => {
            toast.error(`Failed to update project: ${error.message}`);
        },
    });
};

// --- Delete Project ---
const deleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw new Error(error.message);
};

export const useDeleteProject = (partnerId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            toast.success('Project deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['projects', partnerId] });
        },
        onError: (error) => {
            toast.error(`Failed to delete project: ${error.message}`);
        },
    });
};
