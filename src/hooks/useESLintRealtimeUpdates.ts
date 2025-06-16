
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useESLintRealtimeUpdates() {
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  const subscribeToJobUpdates = (projectId: string, onJobUpdate: (job: any) => void) => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }

    const channel = supabase
      .channel(`eslint-jobs-${projectId}`)
      .on('broadcast', { event: 'job-update' }, (payload) => {
        const updatedJob = payload.payload;
        onJobUpdate(updatedJob);
      })
      .subscribe();

    setRealtimeChannel(channel);
  };

  const unsubscribeFromJobUpdates = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      setRealtimeChannel(null);
    }
  };

  // Cleanup realtime subscription on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromJobUpdates();
    };
  }, []);

  return {
    subscribeToJobUpdates,
    unsubscribeFromJobUpdates,
  };
}
