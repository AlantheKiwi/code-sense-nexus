
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { useChannelManager } from './useChannelManager';

export type DebuggingSession = Database['public']['Tables']['debugging_sessions']['Row'];
export type SessionEventPayload = Database['public']['Tables']['session_events']['Row'];

export type BroadcastEvent = {
  type: 'CODE_UPDATE' | 'EXECUTION_RESULT' | 'CURSOR_UPDATE';
  payload: any;
  sender: string;
};

const fetchDebugSession = async (sessionId: string): Promise<DebuggingSession | null> => {
  console.log('Fetching debug session:', sessionId);
  
  try {
    const { data, error } = await supabase
      .from('debugging_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching debug session:', error);
      throw new Error(`Failed to fetch debug session: ${error.message}`);
    }
    
    if (!data) {
      console.warn('No debug session found with ID:', sessionId);
      return null;
    }
    
    console.log('Debug session fetched successfully:', data.id);
    return data;
  } catch (error: any) {
    console.error('Exception in fetchDebugSession:', error);
    throw error;
  }
};

export function useDebugSession(sessionId: string, user: User | null) {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [lastEvent, setLastEvent] = useState<BroadcastEvent | null>(null);
  const isInitializedRef = useRef(false);
  const currentChannelRef = useRef<string | null>(null);
  const { createChannel, subscribeChannel, cleanup } = useChannelManager();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['debugSession', sessionId],
    queryFn: () => fetchDebugSession(sessionId),
    enabled: !!sessionId,
    retry: (failureCount, error: any) => {
      console.log('Query retry attempt:', failureCount, 'Error:', error.message);
      // Don't retry if it's a "no rows" error
      if (error.message.includes('No rows') || error.message.includes('multiple rows')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (!sessionId || !user || isInitializedRef.current) return;

    console.log('Initializing debug session for:', sessionId, user.id);
    isInitializedRef.current = true;

    const channelName = `debug_session:${sessionId}`;
    
    try {
      const sessionChannel = createChannel(channelName, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      currentChannelRef.current = channelName;

      // Use the subscribeChannel method to prevent multiple subscriptions
      subscribeChannel(channelName, async (channel) => {
        return new Promise((resolve, reject) => {
          console.log('Setting up debug session channel listeners');
          
          channel
            .on('presence', { event: 'sync' }, () => {
              try {
                const presenceState = channel.presenceState();
                const collabs = Object.keys(presenceState).map((key) => presenceState[key][0]);
                setCollaborators(collabs);
                console.log('Debug session presence sync:', collabs);
              } catch (error) {
                console.error('Error in presence sync:', error);
              }
            })
            .on<BroadcastEvent>('broadcast', { event: 'debug_event' }, ({ payload }) => {
              try {
                console.log('Debug session broadcast received:', payload);
                if (payload.sender !== user.id) {
                  setLastEvent(payload);
                }
              } catch (error) {
                console.error('Error processing broadcast event:', error);
              }
            })
            .subscribe((status) => {
              console.log('Debug session subscription status:', status);
              if (status === 'SUBSCRIBED') {
                try {
                  channel.track({ 
                    user_id: user.id, 
                    email: user.email, 
                    joined_at: new Date().toISOString() 
                  });
                  resolve();
                } catch (error) {
                  console.error('Error tracking presence:', error);
                  reject(error);
                }
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                console.warn('Debug session subscription failed:', status);
                currentChannelRef.current = null;
                reject(new Error(`Subscription failed: ${status}`));
              }
            });
        });
      }).catch(error => {
        console.error('Failed to subscribe to debug session:', error);
        currentChannelRef.current = null;
      });
    } catch (error) {
      console.error('Error initializing debug session channel:', error);
      currentChannelRef.current = null;
    }

    return () => {
      console.log('Cleaning up debug session');
      isInitializedRef.current = false;
      currentChannelRef.current = null;
      cleanup();
    };
  }, [sessionId, user?.id, createChannel, subscribeChannel, cleanup]);

  const broadcastEvent = (event: Omit<BroadcastEvent, 'sender'>) => {
    if (!user || !currentChannelRef.current) {
      console.warn('Cannot broadcast event: missing user or channel');
      return;
    }

    try {
      const fullEvent: BroadcastEvent = { ...event, sender: user.id };
      console.log('Broadcasting debug session event:', fullEvent);
      
      const channel = createChannel(currentChannelRef.current);
      
      channel.send({
        type: 'broadcast',
        event: 'debug_event',
        payload: fullEvent,
      });

      // Persist event to database with error handling
      supabase.from('session_events').insert({
        session_id: sessionId,
        user_id: user.id,
        event_type: event.type,
        payload: event.payload,
      }).then(({ error }) => {
        if (error) {
          console.error("Error persisting debug session event:", error);
        } else {
          console.log("Debug session event persisted successfully");
        }
      });
    } catch (error) {
      console.error('Error broadcasting debug session event:', error);
    }
  };

  return { session, isLoading, error, collaborators, broadcastEvent, lastEvent };
}
