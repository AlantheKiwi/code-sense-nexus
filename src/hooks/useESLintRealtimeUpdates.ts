
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useESLintRealtimeUpdates() {
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef<Set<string>>(new Set());

  const subscribeToJobUpdates = (projectId: string, onJobUpdate: (job: any) => void) => {
    // Prevent duplicate subscriptions for the same project
    if (isSubscribedRef.current.has(projectId)) {
      console.log('Already subscribed to project:', projectId);
      return;
    }

    // Clean up existing channel if any
    if (realtimeChannel) {
      console.log('Removing existing channel before creating new one');
      supabase.removeChannel(realtimeChannel);
      isSubscribedRef.current.clear();
    }

    const channelName = `eslint-jobs-${projectId}`;
    console.log('Creating ESLint channel:', channelName);

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'job-update' }, (payload) => {
        const updatedJob = payload.payload;
        console.log('ESLint job update received:', updatedJob);
        onJobUpdate(updatedJob);
      })
      .subscribe((status) => {
        console.log('ESLint channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current.add(projectId);
        }
      });

    setRealtimeChannel(channel);
  };

  const unsubscribeFromJobUpdates = () => {
    if (realtimeChannel) {
      console.log('Unsubscribing from ESLint job updates');
      supabase.removeChannel(realtimeChannel);
      setRealtimeChannel(null);
      isSubscribedRef.current.clear();
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
