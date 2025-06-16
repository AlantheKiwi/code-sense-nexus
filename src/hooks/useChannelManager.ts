
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Global channel registry to prevent duplicates
const globalChannels = new Map<string, RealtimeChannel>();

export function useChannelManager() {
  const localChannelsRef = useRef<Set<string>>(new Set());

  const createChannel = useCallback((channelName: string, config?: any) => {
    // Check if channel already exists globally
    if (globalChannels.has(channelName)) {
      console.log('Channel already exists:', channelName);
      return globalChannels.get(channelName)!;
    }

    console.log('Creating new channel:', channelName);
    const channel = supabase.channel(channelName, config);
    
    // Store in both global and local registries
    globalChannels.set(channelName, channel);
    localChannelsRef.current.add(channelName);

    return channel;
  }, []);

  const removeChannel = useCallback((channelName: string) => {
    const channel = globalChannels.get(channelName);
    if (channel) {
      console.log('Removing channel:', channelName);
      supabase.removeChannel(channel);
      globalChannels.delete(channelName);
      localChannelsRef.current.delete(channelName);
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up channels:', Array.from(localChannelsRef.current));
    localChannelsRef.current.forEach(channelName => {
      removeChannel(channelName);
    });
    localChannelsRef.current.clear();
  }, [removeChannel]);

  return { createChannel, removeChannel, cleanup };
}
