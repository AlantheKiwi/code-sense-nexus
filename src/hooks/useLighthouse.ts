
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLighthouseQueue(projectId?: string) {
  return useQuery({
    queryKey: ['lighthouse-queue', projectId],
    queryFn: async () => {
      const url = new URL(`${supabase.supabaseUrl}/functions/v1/lighthouse-queue`);
      if (projectId) {
        url.searchParams.append('projectId', projectId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!projectId,
  });
}
