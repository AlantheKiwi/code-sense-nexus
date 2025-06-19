
import { useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Simplified global channel registry with better cleanup
const globalChannels = new Map<string, { channel: RealtimeChannel; refCount: number; lastUsed: number }>();

// Cleanup old unused channels periodically
const cleanupOldChannels = () => {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 60000; // 1 minute
  
  for (const [channelName, entry] of globalChannels.entries()) {
    if (entry.refCount <= 0 && now - entry.lastUsed > CLEANUP_THRESHOLD) {
      console.log('Cleaning up old channel:', channelName);
      supabase.removeChannel(entry.channel);
      globalChannels.delete(channelName);
    }
  }
};

// Run cleanup every 2 minutes
setInterval(cleanupOldChannels, 120000);

export function useChannelManager() {
  const localChannelsRef = useRef<Set<string>>(new Set());

  const createChannel = useCallback((channelName: string, config?: any) => {
    const existing = globalChannels.get(channelName);
    const now = Date.now();
    
    if (existing) {
      console.log('Reusing existing channel:', channelName);
      existing.refCount++;
      existing.lastUsed = now;
      localChannelsRef.current.add(channelName);
      return existing.channel;
    }

    console.log('Creating new channel:', channelName);
    const channel = supabase.channel(channelName, config);
    
    globalChannels.set(channelName, { channel, refCount: 1, lastUsed: now });
    localChannelsRef.current.add(channelName);

    return channel;
  }, []);

  const removeChannel = useCallback((channelName: string) => {
    const existing = globalChannels.get(channelName);
    if (existing) {
      existing.refCount--;
      existing.lastUsed = Date.now();
      console.log(`Decreasing ref count for channel ${channelName}: ${existing.refCount}`);
      
      // Mark for cleanup but don't immediately remove
      localChannelsRef.current.delete(channelName);
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up local channels:', Array.from(localChannelsRef.current));
    
    localChannelsRef.current.forEach(channelName => {
      removeChannel(channelName);
    });
    
    localChannelsRef.current.clear();
  }, [removeChannel]);

  return { createChannel, removeChannel, cleanup };
}
