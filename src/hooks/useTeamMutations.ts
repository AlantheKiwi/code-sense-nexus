
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type TeamInsert = TablesInsert<'teams'>;
type TeamUpdate = TablesUpdate<'teams'>;

// --- Add Team ---
const addTeam = async (newTeam: TeamInsert) => {
  console.log('Creating team with data:', newTeam);
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('You must be logged in to create a team');
  }
  
  // Verify the partner exists and user has access
  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('id, user_id')
    .eq('id', newTeam.partner_id)
    .single();
    
  if (partnerError || !partner) {
    throw new Error('Partner not found or access denied');
  }
  
  if (partner.user_id !== user.id) {
    throw new Error('You can only create teams for your own partner account');
  }
  
  console.log('Partner verification passed, creating team...');
  
  const { data, error } = await supabase.from('teams').insert(newTeam).select().single();
  if (error) {
    console.error('Team creation error:', error);
    throw new Error(error.message);
  }
  return data;
};

export const useAddTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTeam,
    onSuccess: (data) => {
      toast.success('Team created successfully!');
      queryClient.invalidateQueries({ queryKey: ['teams', data.partner_id] });
    },
    onError: (error) => {
      console.error('Team creation failed:', error);
      toast.error(`Failed to create team: ${error.message}`);
    },
  });
};

// --- Update Team ---
const updateTeam = async (updatedTeam: TeamUpdate & { id: string }) => {
    const { id, ...updateData } = updatedTeam;
    const { data, error } = await supabase.from('teams').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const useUpdateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTeam,
        onSuccess: (data) => {
            toast.success('Team updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['teams', data.partner_id] });
        },
        onError: (error) => {
            toast.error(`Failed to update team: ${error.message}`);
        },
    });
};

// --- Delete Team ---
const deleteTeam = async (teamId: string) => {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) throw new Error(error.message);
};

export const useDeleteTeam = (partnerId: string | undefined) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTeam,
        onSuccess: () => {
            toast.success('Team deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['teams', partnerId] });
        },
        onError: (error) => {
            toast.error(`Failed to delete team: ${error.message}`);
        },
    });
};
