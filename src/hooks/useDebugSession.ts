
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export type DebuggingSession = Database['public']['Tables']['debugging_sessions']['Row'];
export type SessionEventPayload = Database['public']['Tables']['session_events']['Row'];

export type BroadcastEvent = {
  type: 'CODE_UPDATE' | 'EXECUTION_RESULT' | 'CURSOR_UPDATE';
  payload: any;
  sender: string;
};

const fetchDebugSession = async (sessionId: string): Promise<DebuggingSession> => {
  const { data, error } = await supabase
    .from('debugging_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export function useDebugSession(sessionId: string, user: User | null) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [lastEvent, setLastEvent] = useState<BroadcastEvent | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitializedRef = useRef(false);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['debugSession', sessionId],
    queryFn: () => fetchDebugSession(sessionId),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (!sessionId || !user || isInitializedRef.current) return;

    isInitializedRef.current = true;
    const channelName = `debug_session:${sessionId}`;
    console.log('Creating debug session channel:', channelName);

    const sessionChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = sessionChannel;

    sessionChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = sessionChannel.presenceState();
        const collabs = Object.keys(presenceState).map((key) => presenceState[key][0]);
        setCollaborators(collabs);
        console.log('Debug session presence sync:', collabs);
      })
      .on<BroadcastEvent>('broadcast', { event: 'debug_event' }, ({ payload }) => {
        console.log('Debug session broadcast received:', payload);
        if (payload.sender !== user.id) {
          setLastEvent(payload);
        }
      })
      .subscribe((status) => {
        console.log('Debug session subscription status:', status);
        if (status === 'SUBSCRIBED') {
          sessionChannel.track({ 
            user_id: user.id, 
            email: user.email, 
            joined_at: new Date().toISOString() 
          });
        }
      });

    setChannel(sessionChannel);

    return () => {
      console.log('Cleaning up debug session channel');
      isInitializedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [sessionId, user?.id]);

  const broadcastEvent = (event: Omit<BroadcastEvent, 'sender'>) => {
    if (channel && user) {
      const fullEvent: BroadcastEvent = { ...event, sender: user.id };
      console.log('Broadcasting debug session event:', fullEvent);
      
      channel.send({
        type: 'broadcast',
        event: 'debug_event',
        payload: fullEvent,
      });

      // Persist event to database
      supabase.from('session_events').insert({
        session_id: sessionId,
        user_id: user.id,
        event_type: event.type,
        payload: event.payload,
      }).then(({ error }) => {
        if (error) console.error("Error persisting debug session event:", error);
      });
    }
  };

  return { session, isLoading, error, collaborators, broadcastEvent, lastEvent };
}
