
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Global channel registry with subscription state tracking
const globalChannels = new Map<string, { 
  channel: RealtimeChannel; 
  refCount: number; 
  lastUsed: number;
  isSubscribed: boolean;
  subscriptionPromise?: Promise<void>;
}>();

// Cleanup old unused channels periodically
const cleanupOldChannels = () => {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 120000; // 2 minutes
  
  for (const [channelName, entry] of globalChannels.entries()) {
    if (entry.refCount <= 0 && now - entry.lastUsed > CLEANUP_THRESHOLD) {
      console.log('Cleaning up old channel:', channelName);
      try {
        if (entry.isSubscribed) {
          supabase.removeChannel(entry.channel);
        }
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
      globalChannels.delete(channelName);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupOldChannels, 300000);

export function useChannelManager() {
  const localChannelsRef = useRef<Set<string>>(new Set());

  const createChannel = useCallback((channelName: string, config?: any) => {
    const existing = globalChannels.get(channelName);
    const now = Date.now();
    
    if (existing) {
      console.log('Reusing existing channel:', channelName, 'subscribed:', existing.isSubscribed);
      existing.refCount++;
      existing.lastUsed = now;
      localChannelsRef.current.add(channelName);
      return existing.channel;
    }

    console.log('Creating new channel:', channelName);
    const channel = supabase.channel(channelName, config);
    
    globalChannels.set(channelName, { 
      channel, 
      refCount: 1, 
      lastUsed: now,
      isSubscribed: false
    });
    localChannelsRef.current.add(channelName);

    return channel;
  }, []);

  const subscribeChannel = useCallback((channelName: string, subscriptionCallback: (channel: RealtimeChannel) => Promise<void>) => {
    const existing = globalChannels.get(channelName);
    if (!existing) {
      console.warn('Cannot subscribe to non-existent channel:', channelName);
      return Promise.resolve();
    }

    // If already subscribed, return immediately
    if (existing.isSubscribed) {
      console.log('Channel already subscribed:', channelName);
      return Promise.resolve();
    }

    // If subscription is in progress, wait for it
    if (existing.subscriptionPromise) {
      console.log('Waiting for existing subscription:', channelName);
      return existing.subscriptionPromise;
    }

    // Start new subscription
    console.log('Starting subscription for channel:', channelName);
    existing.subscriptionPromise = subscriptionCallback(existing.channel).then(() => {
      existing.isSubscribed = true;
      existing.subscriptionPromise = undefined;
      console.log('Channel subscribed successfully:', channelName);
    }).catch((error) => {
      console.error('Channel subscription failed:', channelName, error);
      existing.subscriptionPromise = undefined;
      throw error;
    });

    return existing.subscriptionPromise;
  }, []);

  const removeChannel = useCallback((channelName: string) => {
    const existing = globalChannels.get(channelName);
    if (existing) {
      existing.refCount = Math.max(0, existing.refCount - 1);
      existing.lastUsed = Date.now();
      console.log(`Decreasing ref count for channel ${channelName}: ${existing.refCount}`);
      
      localChannelsRef.current.delete(channelName);
      
      // If no more references and subscribed, unsubscribe
      if (existing.refCount === 0 && existing.isSubscribed) {
        console.log('Unsubscribing channel with 0 refs:', channelName);
        try {
          supabase.removeChannel(existing.channel);
          existing.isSubscribed = false;
        } catch (error) {
          console.warn('Error unsubscribing channel:', error);
        }
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up local channels:', Array.from(localChannelsRef.current));
    
    localChannelsRef.current.forEach(channelName => {
      removeChannel(channelName);
    });
    
    localChannelsRef.current.clear();
  }, [removeChannel]);

  return { createChannel, subscribeChannel, removeChannel, cleanup };
}
