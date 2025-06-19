
import { useCallback, useRef } from 'react';
import { useChannelManager } from './useChannelManager';
import { ESLintJob } from './useESLintScheduler';

export function useESLintRealtimeUpdates() {
  const { createChannel, subscribeChannel, removeChannel } = useChannelManager();
  const currentSubscriptionRef = useRef<string | null>(null);

  const subscribeToJobUpdates = useCallback((projectId: string, onJobUpdate: (job: ESLintJob) => void) => {
    // Clean up existing subscription first
    if (currentSubscriptionRef.current) {
      console.log('Cleaning up existing subscription:', currentSubscriptionRef.current);
      removeChannel(currentSubscriptionRef.current);
      currentSubscriptionRef.current = null;
    }

    const channelName = `eslint-jobs-${projectId}`;
    console.log('Setting up ESLint updates subscription:', channelName);
    
    const channel = createChannel(channelName);
    currentSubscriptionRef.current = channelName;

    // Use the new subscribeChannel method to prevent multiple subscriptions
    subscribeChannel(channelName, async (channel) => {
      return new Promise((resolve, reject) => {
        channel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'eslint_analysis_queue',
            filter: `project_id=eq.${projectId}`
          }, (payload) => {
            console.log('ESLint job update received:', payload);
            if (payload.new) {
              onJobUpdate(payload.new as ESLintJob);
            }
          })
          .subscribe((status) => {
            console.log('ESLint channel subscription status:', status);
            if (status === 'SUBSCRIBED') {
              resolve();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              console.warn('ESLint subscription failed with status:', status);
              currentSubscriptionRef.current = null;
              reject(new Error(`Subscription failed: ${status}`));
            }
          });
      });
    }).catch(error => {
      console.error('Failed to subscribe to ESLint updates:', error);
      currentSubscriptionRef.current = null;
    });
  }, [createChannel, subscribeChannel, removeChannel]);

  const unsubscribeFromJobUpdates = useCallback(() => {
    if (currentSubscriptionRef.current) {
      console.log('Unsubscribing from ESLint job updates');
      removeChannel(currentSubscriptionRef.current);
      currentSubscriptionRef.current = null;
    }
  }, [removeChannel]);

  return {
    subscribeToJobUpdates,
    unsubscribeFromJobUpdates
  };
}
