
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export function useAuthOperations() {
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  const signInWithEmail = async (email: string) => {
    setIsOperationLoading(true);
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
      setIsOperationLoading(false);
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    setIsOperationLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error(`Sign in failed: ${error.message}`);
    } finally {
      setIsOperationLoading(false);
    }
  };

  const signUpWithEmailPassword = async (email: string, password: string, companyName: string) => {
    setIsOperationLoading(true);
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
        // Changed to "Confirmation email sent..." as per original context for consistency.
        toast.info("Confirmation email sent! Please check your inbox to verify your account.");
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
      setIsOperationLoading(false);
    }
  };

  const signOut = async () => {
    setIsOperationLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully.");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Sign out failed: ${error.message}`);
    } finally {
      setIsOperationLoading(false);
    }
  };

  return {
    signInWithEmail,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    signOut,
    isOperationLoading,
  };
}
