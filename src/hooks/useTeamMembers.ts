
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'developer' | 'viewer';
  joined_at: string;
  user_profile: {
    email: string;
    full_name: string | null;
  };
}

// --- Fetch Members ---
const fetchTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase.functions.invoke<TeamMember[]>('manage-team-members', {
    method: 'GET',
    body: { team_id: teamId },
  });
  if (error) throw new Error(error.message);
  return data || [];
};

export const useTeamMembersData = (teamId: string | undefined) => {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => fetchTeamMembers(teamId!),
    enabled: !!teamId,
  });
};

// --- Add Member ---
const addTeamMember = async (params: { teamId: string; email: string; role: 'admin' | 'developer' | 'viewer' }) => {
  const { data, error } = await supabase.functions.invoke('manage-team-members', {
    method: 'POST',
    body: { team_id: params.teamId, email: params.email, role: params.role },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const useAddTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTeamMember,
    onSuccess: () => {
      toast.success('Member added successfully!');
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
    onError: (error: Error) => toast.error(`Failed to add member: ${error.message}`),
  });
};

// --- Update Member ---
const updateTeamMember = async (params: { teamId: string; userId: string; role: 'admin' | 'developer' | 'viewer' }) => {
  const { data, error } = await supabase.functions.invoke('manage-team-members', {
    method: 'PATCH',
    body: { team_id: params.teamId, user_id: params.userId, role: params.role },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const useUpdateTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeamMember,
    onSuccess: () => {
      toast.success('Member role updated!');
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
    onError: (error: Error) => toast.error(`Failed to update role: ${error.message}`),
  });
};

// --- Remove Member ---
const removeTeamMember = async (params: { teamId: string; userId: string }) => {
  const { data, error } = await supabase.functions.invoke('manage-team-members', {
    method: 'DELETE',
    body: { team_id: params.teamId, user_id: params.userId },
  });
  if (error) throw new Error(error.message);
  return data;
};

export const useRemoveTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      toast.success('Member removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
    onError: (error: Error) => toast.error(`Failed to remove member: ${error.message}`),
  });
};
