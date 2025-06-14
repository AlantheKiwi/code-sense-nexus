import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Tables } from '@/integrations/supabase/types'; // Assuming this is correctly generated

type Partner = Tables<'partners'>;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  partner: Partner | null;
  isLoading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchPartnerData(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setIsLoading(true);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fetch partner data on auth state change, e.g., after login or token refresh
          // The trigger handles partner creation, this just fetches it.
          await fetchPartnerData(session.user.id);
        } else {
          setPartner(null); // Clear partner data on logout
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchPartnerData = async (userId: string) => {
    console.log("Fetching partner data for user ID:", userId);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows (no matching row)
      console.error('Error fetching partner data:', error);
      toast.error("Error fetching partner data: " + error.message);
    } else if (data) {
      console.log("Partner data fetched:", data);
      setPartner(data);
    } else {
      console.log("No partner record found for user. This might be a client user, an admin, or a partner whose record creation is pending/failed at DB trigger level.");
      setPartner(null);
    }
  };

  const signInWithEmail = async (email: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Partner data will be fetched by onAuthStateChange after successful login
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(`Sign in failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmailPassword = async (email: string, password: string, companyName: string) => {
    setIsLoading(true);
    try {
      // Pass companyName and a flag in options.data for the trigger to use
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/',
          data: { 
            company_name: companyName,
            is_partner_signup: true // Flag for the trigger
          }
        },
      });

      if (signUpError) throw signUpError;

      // If Supabase requires email confirmation (default), authData.user will exist but authData.session might be null.
      // The trigger `on_auth_user_created_create_partner_profile` will handle partner record creation.
      if (authData.user?.identities?.length === 0) {
        // This can indicate an issue like user already exists but is unconfirmed, or other signup issue.
        // Supabase might return a user object with an empty identities array if "Allow new users to sign up" is disabled.
        // However, if signUpError is null, it usually means the initial step was accepted by Supabase.
        toast.warning("Sign up process initiated. If you don't receive a confirmation email, your email might already be registered or there could be an issue.");
      } else if (authData.user) {
         // Successfully initiated sign up. Email confirmation might be required.
         // Partner record is created by the DB trigger.
        toast.info("Confirmation email sent! Please check your inbox to verify your account and complete sign up.");
      } else {
        // This case (no signUpError, no authData.user) should be rare if "Allow new users to sign up" is enabled.
        // It might indicate that email confirmation is pending and Supabase doesn't return the user object yet.
        toast.info("Sign up request submitted. Please check your email for a confirmation link if required.");
      }
      
      // No need to call fetchPartnerData here; onAuthStateChange will handle it after user confirms and logs in.

    } catch (error: any) {
      console.error("Error signing up:", error);
      // Check for specific errors, e.g., user already registered
      if (error.message && error.message.toLowerCase().includes("user already registered")) {
        toast.error("Sign up failed: This email is already registered. Try signing in or use a different email.");
      } else {
        toast.error(`Sign up failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setPartner(null); // Clear partner data on sign out
      toast.success("Signed out successfully.");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Sign out failed: ${error.message}`);
    } finally {
      setIsLoading(false);
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
