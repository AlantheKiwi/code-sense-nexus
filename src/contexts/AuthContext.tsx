import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Tables } from '@/integrations/supabase/types';

type Partner = Tables<'partners'>;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  partner: Partner | null;
  isLoading: boolean; // This is the main initial loading state
  signInWithEmail: (email: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Tables<'partners'> | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True by default, set to false after initial load

  useEffect(() => {
    setIsLoading(true); // Set true at the start of the effect
    let didUnsubscribe = false; // Flag to prevent state updates after unmount

    console.log("AuthContext: useEffect initiated for session check.");

    // Initial check for session
    supabase.auth.getSession().then(async ({ data: { session: initialSession }, error: sessionError }) => {
      if (didUnsubscribe) return;
      console.log("AuthContext: supabase.auth.getSession() resolved.");

      if (sessionError) {
        console.error("AuthContext: Error getting initial session:", sessionError.message);
      }
      
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        console.log("AuthContext: User found in initial session, fetching partner data.");
        await fetchPartnerData(initialSession.user.id);
      } else {
        console.log("AuthContext: No user in initial session.");
        setPartner(null);
      }
    }).catch((e: any) => {
      if (didUnsubscribe) return;
      console.error("AuthContext: Exception in initial session check or associated fetchPartnerData:", e.message);
      toast.error("Error initializing authentication state.");
      setPartner(null); 
    }).finally(() => {
      if (didUnsubscribe) return;
      setIsLoading(false); // Crucial: Set loading false after initial attempt
      console.log("AuthContext: Initial session processing complete. isLoading is now false.");
    });

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (didUnsubscribe) return;
        
        console.log("AuthContext: onAuthStateChange triggered. Event:", _event, "New session:", !!newSession);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          console.log("AuthContext: User found via onAuthStateChange, fetching partner data.");
          await fetchPartnerData(newSession.user.id); 
        } else {
          console.log("AuthContext: No user via onAuthStateChange (e.g., logout).");
          setPartner(null);
        }
      }
    );

    return () => {
      didUnsubscribe = true;
      console.log("AuthContext: Unsubscribing from onAuthStateChange.");
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount

  const fetchPartnerData = async (userId: string) => {
    console.log("Fetching partner data for user ID:", userId);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { 
        console.error('Error fetching partner data:', error);
        toast.error("Error fetching partner data: " + error.message);
        setPartner(null);
      } else if (data) {
        console.log("Partner data fetched:", data);
        setPartner(data);
      } else {
        console.log("No partner record found for user. This might be a client user, an admin, or a partner whose record creation is pending/failed at DB trigger level.");
        setPartner(null);
      }
    } catch (e: any) {
      console.error("Exception during fetchPartnerData:", e.message);
      toast.error("Failed to retrieve partner details.");
      setPartner(null);
    }
  };

  const signInWithEmail = async (email: string) => {
    setIsLoading(true); // Manage isLoading for this specific operation
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/',
        },
      });
      if (error) throw error;
      toast.success("Magic link sent! Check your email.");
    } catch (error: any) {
      console.error("Error sending magic link:", error);
      toast.error(`Failed to send magic link: ${error.message}`);
    } finally {
      setIsLoading(false); // Reset isLoading for this specific operation
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    setIsLoading(true); // Manage isLoading for this specific operation
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully!");
      // onAuthStateChange will handle fetching partner data and navigation
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(`Sign in failed: ${error.message}`);
    } finally {
      setIsLoading(false); // Reset isLoading for this specific operation
    }
  };

  const signUpWithEmailPassword = async (email: string, password: string, companyName: string) => {
    setIsLoading(true); // Manage isLoading for this specific operation
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/',
          data: { 
            company_name: companyName,
            is_partner_signup: true 
          }
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user?.identities?.length === 0) {
        toast.warning("Sign up process initiated. If you don't receive a confirmation email, your email might already be registered or there could be an issue.");
      } else if (authData.user) {
        toast.info("Confirmation email sent! Please check your inbox to verify your account and complete sign up.");
      } else {
        toast.info("Sign up request submitted. Please check your email for a confirmation link if required.");
      }
      
    } catch (error: any) {
      console.error("Error signing up:", error);
      if (error.message && error.message.toLowerCase().includes("user already registered")) {
        toast.error("Sign up failed: This email is already registered. Try signing in or use a different email.");
      } else {
        toast.error(`Sign up failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false); // Reset isLoading for this specific operation
    }
  };

  const signOut = async () => {
    setIsLoading(true); // Manage isLoading for this specific operation
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setPartner(null); 
      toast.success("Signed out successfully.");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Sign out failed: ${error.message}`);
    } finally {
      setIsLoading(false); // Reset isLoading for this specific operation
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, partner, isLoading, signInWithEmail, signInWithEmailPassword, signUpWithEmailPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
