import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type TeamInsert = TablesInsert<'teams'>;
type TeamUpdate = TablesUpdate<'teams'>;

// --- Add Team ---
const addTeam = async (newTeam: Omit<TeamInsert, 'created_by'>) => {
  console.log('=== TEAM CREATION DEBUG START ===');
  console.log('Original team data received:', newTeam);
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Authentication failed:', authError);
    throw new Error('You must be logged in to create a team');
  }
  
  console.log('✓ User authenticated successfully:', {
    userId: user.id,
    email: user.email
  });
  
  // Debug: Check partner relationship
  const { data: partnerData, error: partnerError } = await supabase
    .from('partners')
    .select('id, user_id, company_name')
    .eq('user_id', user.id)
    .maybeSingle();
    
  console.log('Partner lookup result:', { partnerData, partnerError });
  
  if (partnerError) {
    console.error('Partner lookup error:', partnerError);
    throw new Error(`Partner lookup failed: ${partnerError.message}`);
  }
  
  if (!partnerData) {
    console.error('No partner found for user:', user.id);
    throw new Error('No partner account found for this user');
  }
  
  console.log('✓ Partner found:', {
    partnerId: partnerData.id,
    partnerUserId: partnerData.user_id,
    companyName: partnerData.company_name
  });
  
  // Verify the partner_id matches
  if (newTeam.partner_id !== partnerData.id) {
    console.error('Partner ID mismatch:', {
      requestedPartnerId: newTeam.partner_id,
      actualPartnerId: partnerData.id
    });
    throw new Error('Partner ID mismatch - you can only create teams for your own partner account');
  }
  
  console.log('✓ Partner ID validation passed');
  
  // Include the authenticated user's ID as created_by
  const teamData: TeamInsert = {
    ...newTeam,
    created_by: user.id
  };
  
  console.log('Final team data to insert:', teamData);
  
  // First, create the team
  const { data: teamResult, error: teamError } = await supabase
    .from('teams')
    .insert(teamData)
    .select()
    .single();
  
  if (teamError) {
    console.error('=== TEAM INSERT FAILED ===');
    console.error('Error details:', {
      message: teamError.message,
      code: teamError.code,
      details: teamError.details,
      hint: teamError.hint
    });
    console.error('Data that failed to insert:', teamData);
    throw new Error(teamError.message);
  }
  
  console.log('=== TEAM INSERT SUCCESSFUL ===');
  console.log('Team created successfully:', teamResult);
  
  // Now add the creator as an admin member of the team
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: teamResult.id,
      user_id: user.id,
      role: 'admin'
    });
  
  if (memberError) {
    console.error('Failed to add creator as team admin:', memberError);
    // Don't throw here - the team was created successfully
    // We'll just log the error and continue
  } else {
    console.log('✓ Creator added as team admin');
  }
  
  console.log('=== TEAM CREATION DEBUG END ===');
  
  return teamResult;
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
