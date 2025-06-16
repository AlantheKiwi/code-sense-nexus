
import { useCallback } from 'react';
import { useChannelManager } from './useChannelManager';

export function useESLintRealtimeUpdates() {
  const { createChannel, cleanup } = useChannelManager();

  const subscribeToJobUpdates = useCallback((projectId: string, onJobUpdate: (job: any) => void) => {
    const channelName = `eslint-jobs-${projectId}`;
    console.log('Subscribing to ESLint updates:', channelName);

    const channel = createChannel(channelName);
    
    channel
      .on('broadcast', { event: 'job-update' }, (payload) => {
        const updatedJob = payload.payload;
        console.log('ESLint job update received:', updatedJob);
        onJobUpdate(updatedJob);
      })
      .subscribe((status) => {
        console.log('ESLint channel subscription status:', status);
      });

  }, [createChannel]);

  const unsubscribeFromJobUpdates = useCallback(() => {
    console.log('Unsubscribing from ESLint job updates');
    cleanup();
  }, [cleanup]);

  return {
    subscribeToJobUpdates,
    unsubscribeFromJobUpdates,
  };
}
