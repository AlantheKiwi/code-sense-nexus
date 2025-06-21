
import { useCallback, useRef } from 'react';
import { useChannelManager } from './useChannelManager';
import { ESLintJob } from './useESLintScheduler';

export function useESLintRealtimeUpdates() {
  const { createChannel, subscribeChannel, removeChannel } = useChannelManager();
  const currentSubscriptionRef = useRef<string | null>(null);

  const subscribeToJobUpdates = useCallback((projectId: string, onJobUpdate: (job: ESLintJob) => void) => {
    console.log('ESLint real-time updates disabled during system rebuild');
    
    // Clean up any existing subscription references
    if (currentSubscriptionRef.current) {
      currentSubscriptionRef.current = null;
    }
    
    // Don't actually subscribe during rebuild
    return;
  }, [createChannel, subscribeChannel, removeChannel]);

  const unsubscribeFromJobUpdates = useCallback(() => {
    console.log('ESLint unsubscribe disabled during system rebuild');
    currentSubscriptionRef.current = null;
  }, [removeChannel]);

  return {
    subscribeToJobUpdates,
    unsubscribeFromJobUpdates
  };
}
