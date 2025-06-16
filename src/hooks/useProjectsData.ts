
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Project = Tables<'projects'>;

const fetchProjects = async (partnerId: string): Promise<Project[]> => {
  console.log('fetchProjects: Attempting to fetch projects for partner ID:', partnerId);
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('partner_id', partnerId);

  console.log('fetchProjects: Supabase query result:', { data, error, partnerId });

  if (error) {
    console.error('fetchProjects: Error fetching projects:', error);
    toast.error('Failed to fetch projects: ' + error.message);
    throw new Error(error.message);
  }

  console.log('fetchProjects: Successfully fetched', data?.length || 0, 'projects');
  return data || [];
};

export const useProjectsData = (partnerId: string | undefined) => {
  console.log('useProjectsData: Hook called with partnerId:', partnerId);
  
  const query = useQuery({
    queryKey: ['projects', partnerId],
    queryFn: () => {
      if (!partnerId) {
        console.error('useProjectsData: No partnerId provided to queryFn');
        throw new Error('Partner ID is required to fetch projects');
      }
      return fetchProjects(partnerId);
    },
    enabled: !!partnerId,
    retry: (failureCount, error) => {
      console.log('useProjectsData: Query retry attempt', failureCount, 'Error:', error);
      return failureCount < 2; // Only retry twice
    }
  });

  // Handle success/error states using the query result
  if (query.isSuccess && query.data) {
    console.log('useProjectsData: Query succeeded with data:', query.data);
  }
  
  if (query.isError) {
    console.error('useProjectsData: Query failed with error:', query.error);
  }

  return query;
};
