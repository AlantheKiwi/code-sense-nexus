
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ToolUpdate = {
  id: string;
  created_at: string;
  from_version: string | null;
  to_version: string;
  status: 'available' | 'installing' | 'completed' | 'failed' | 'rolled_back';
  details: any;
  tools: {
      name: string;
  } | null;
};

const fetchToolUpdates = async (statuses: ToolUpdate['status'][]): Promise<ToolUpdate[]> => {
  const { data, error } = await supabase
    .from('tool_updates')
    .select(`
      id,
      created_at,
      from_version,
      to_version,
      status,
      details,
      tools ( name )
    `)
    .in('status', statuses)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as ToolUpdate[];
};

export const useToolUpdates = (statuses: ToolUpdate['status'][]) => {
  return useQuery<ToolUpdate[], Error>({
    queryKey: ['toolUpdates', ...statuses],
    queryFn: () => fetchToolUpdates(statuses),
  });
};
