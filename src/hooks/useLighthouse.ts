
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLighthouseQueue(projectId?: string) {
  return useQuery({
    queryKey: ['lighthouse-queue', projectId],
    queryFn: async () => {
      // Use the direct Supabase URL constants
      const url = new URL(`https://dtwgnqzuskdfuypigaor.supabase.co/functions/v1/lighthouse-queue`);
      if (projectId) {
        url.searchParams.append('projectId', projectId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2ducXp1c2tkZnV5cGlnYW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzY3NDcsImV4cCI6MjA2NDc1Mjc0N30.D_Ms-plmjx82XAw4MdCYQMh03X6nzFnAajVMKIJLCVQ',
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
