
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string) => Promise<any>;
  signOut: () => Promise<void>;
  // Add signUp function if you plan to allow email/password signup
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        if (_event === 'SIGNED_IN' && session) {
            // Check if tenant record exists, create if not
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

            if (tenantError && tenantError.code === 'PGRST116') { // PGRST116: Row not found
                // No tenant record, create one
                const { error: insertError } = await supabase
                    .from('tenants')
                    .insert({ user_id: session.user.id, name: session.user.email || 'New Tenant' }); // Use email as a default name or a placeholder
                if (insertError) {
                    console.error('Error creating tenant record:', insertError);
                }
            } else if (tenantError) {
                console.error('Error fetching tenant record:', tenantError);
            }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`, // Redirect to dashboard after magic link click
        },
      });
      if (error) throw error;
      // Notification to check email can be added here
      alert('Check your email for the login link!');
    } catch (error) {
      console.error('Error signing in:', error);
      alert(`Error signing in: ${(error as Error).message}`); // Provide feedback to the user
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsLoading(false);
    navigate('/'); // Navigate to home page after sign out
  };

  const value = {
    session,
    user,
    isLoading,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
