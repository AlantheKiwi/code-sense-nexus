
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Global channel registry to prevent duplicates with better cleanup
const globalChannels = new Map<string, { channel: RealtimeChannel; refCount: number }>();

export function useChannelManager() {
  const localChannelsRef = useRef<Set<string>>(new Set());

  const createChannel = useCallback((channelName: string, config?: any) => {
    // Check if channel already exists globally
    const existing = globalChannels.get(channelName);
    if (existing) {
      console.log('Reusing existing channel:', channelName);
      existing.refCount++;
      localChannelsRef.current.add(channelName);
      return existing.channel;
    }

    console.log('Creating new channel:', channelName);
    const channel = supabase.channel(channelName, config);
    
    // Store in global registry with reference count
    globalChannels.set(channelName, { channel, refCount: 1 });
    localChannelsRef.current.add(channelName);

    return channel;
  }, []);

  const removeChannel = useCallback((channelName: string) => {
    const existing = globalChannels.get(channelName);
    if (existing) {
      existing.refCount--;
      console.log(`Decreasing ref count for channel ${channelName}: ${existing.refCount}`);
      
      // Only actually remove the channel if no other components are using it
      if (existing.refCount <= 0) {
        console.log('Removing channel:', channelName);
        supabase.removeChannel(existing.channel);
        globalChannels.delete(channelName);
      }
      
      localChannelsRef.current.delete(channelName);
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up channels:', Array.from(localChannelsRef.current));
    
    // Decrease reference count for all local channels
    localChannelsRef.current.forEach(channelName => {
      removeChannel(channelName);
    });
    
    localChannelsRef.current.clear();
  }, [removeChannel]);

  return { createChannel, removeChannel, cleanup };
}
