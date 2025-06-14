
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    setIsSessionLoading(true);
    let didUnsubscribe = false;

    console.log("useAuthSession: useEffect initiated for session check.");

    supabase.auth.getSession().then(({ data: { session: initialSession }, error: sessionError }) => {
      if (didUnsubscribe) return;
      console.log("useAuthSession: supabase.auth.getSession() resolved.");

      if (sessionError) {
        console.error("useAuthSession: Error getting initial session:", sessionError.message);
        toast.error("Error initializing session.");
      }
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
    }).catch((e: any) => {
      if (didUnsubscribe) return;
      console.error("useAuthSession: Exception in initial session check:", e.message);
      toast.error("Critical error during session initialization.");
    }).finally(() => {
      if (didUnsubscribe) return;
      // This initial loading state is critical. It should only be set to false
      // AFTER the initial session check (and potential partner data fetch if it were here).
      // The onAuthStateChange might fire before/concurrently.
      setIsSessionLoading(false); 
      console.log("useAuthSession: Initial session processing complete. isSessionLoading is now false.");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (didUnsubscribe) return;
        console.log("useAuthSession: onAuthStateChange triggered. Event:", _event, "New session:", !!newSession);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If onAuthStateChange fires, it means the auth state is known.
        // This covers cases like redirect from magic link, or initial load where session is established via listener.
        setIsSessionLoading(false); 
      }
    );

    return () => {
      didUnsubscribe = true;
      console.log("useAuthSession: Unsubscribing from onAuthStateChange.");
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { session, user, isSessionLoading };
}
