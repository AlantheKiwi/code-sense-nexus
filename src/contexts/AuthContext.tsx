
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

    if (error && error.code !== 'PGRST116') { // PGRST116: 0 rows
      console.error('Error fetching partner data:', error);
      toast.error("Error fetching partner data: " + error.message);
    } else if (data) {
      console.log("Partner data fetched:", data);
      setPartner(data);
    } else {
      console.log("No partner record found for user, this might be a client or an admin, or partner record creation is pending.");
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
      // Partner data will be fetched by onAuthStateChange
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
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/', 
        },
      });

      if (signUpError) throw signUpError;
      toast.info("Confirmation email sent. Please check your inbox to verify your account.");

      // If signUp is successful and returns a user, attempt to create a partner record.
      // Note: Email confirmation might be required before a session is fully active.
      // Supabase by default sends a confirmation email. User needs to confirm before they can log in.
      // We'll create the partner record once the user is confirmed and logs in for the first time,
      // OR we can attempt to create it now if authData.user is available.
      // For simplicity, let's create it now if user object exists.
      // A robust solution would use a trigger or handle this after email confirmation.

      if (authData.user) {
        // Generate a simple slug from company name
        const slug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const { error: partnerError } = await supabase
          .from('partners')
          .insert({ 
            user_id: authData.user.id, 
            company_name: companyName,
            slug: `${slug}-${authData.user.id.substring(0, 4)}`, // ensure some uniqueness for slug
            // subscription_tier and branding_config will use DB defaults
          });

        if (partnerError) {
          // If partner creation failed, we should inform the user.
          // Potentially delete the auth user if partner creation is critical and failed. (More complex)
          console.error('Error creating partner record:', partnerError);
          toast.error(`Account created, but failed to set up partner details: ${partnerError.message}. Please contact support.`);
        } else {
          toast.success("Partner account initiated! Please check your email to confirm your account.");
          // Fetch partner data immediately if needed, or let onAuthStateChange handle it
          await fetchPartnerData(authData.user.id);
        }
      } else if (!authData.session) {
         // This case means email confirmation is pending.
         // The partner record will be created when the user first successfully logs in after confirmation.
         // We can modify onAuthStateChange or signIn to handle this "first login" scenario.
         // For now, let's assume the trigger or a post-confirmation step handles this.
         // The current logic in onAuthStateChange will try to fetch partner data.
         // If it's not there, it might be created by a trigger or a later step.
         // For now, rely on the user confirming email, then logging in.
         // The partner creation attempt above might not have a full session yet.
      }


    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(`Sign up failed: ${error.message}`);
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
