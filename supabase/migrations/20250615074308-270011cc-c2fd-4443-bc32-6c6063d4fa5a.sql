
-- Alter the debugging_sessions table to add support for collaborators
ALTER TABLE public.debugging_sessions
ADD COLUMN IF NOT EXISTS collaborators JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.debugging_sessions.collaborators IS 'Stores an array of user IDs who are collaborating on this session.';

-- Create a new table for session events to store real-time debugging events.
CREATE TABLE public.session_events (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES public.debugging_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID, -- Who performed the event
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_session_events_session_id ON public.session_events(session_id);
COMMENT ON TABLE public.session_events IS 'Stores real-time debugging events and actions for a session.';
COMMENT ON COLUMN public.session_events.user_id IS 'The user who triggered the event.';

-- Enable RLS for the new table
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for session_events: users can only access events for sessions they are part of.
-- This relies on the policy on the parent debugging_sessions table.
CREATE POLICY "Users can access events for their accessible debugging sessions"
ON public.session_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.debugging_sessions ds
    WHERE ds.id = session_events.session_id
  )
);

-- Enable realtime on debugging_sessions and session_events so clients can subscribe to changes
ALTER TABLE public.debugging_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.session_events REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.debugging_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_events;

