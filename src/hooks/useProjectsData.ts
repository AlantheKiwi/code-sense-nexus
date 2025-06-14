
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Project = Tables<'projects'>;

const fetchProjects = async (partnerId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('partner_id', partnerId);

  if (error) {
    console.error('Error fetching projects:', error);
    toast.error('Failed to fetch projects: ' + error.message);
    throw new Error(error.message);
  }

  return data || [];
};

export const useProjectsData = (partnerId: string | undefined) => {
  return useQuery({
    queryKey: ['projects', partnerId],
    queryFn: () => fetchProjects(partnerId!),
    enabled: !!partnerId,
  });
};
