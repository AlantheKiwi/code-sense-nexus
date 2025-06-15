
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Team = Tables<'teams'>;

const fetchTeams = async (partnerId: string) => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('partner_id', partnerId);
  
  if (error) throw new Error(error.message);
  return data;
};

export const useTeamsData = (partnerId: string | undefined) => {
  return useQuery({
    queryKey: ['teams', partnerId],
    queryFn: () => fetchTeams(partnerId!),
    enabled: !!partnerId,
  });
};
