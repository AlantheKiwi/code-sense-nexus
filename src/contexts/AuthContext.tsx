
import React, { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types'; // Still needed for Partner type in context
import { useAuthSession } from '@/hooks/useAuthSession';
import { usePartnerData } from '@/hooks/usePartnerData';
import { useAuthOperations } from '@/hooks/useAuthOperations';

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
  const { session, user, isSessionLoading } = useAuthSession();
  const { partner, isPartnerLoading } = usePartnerData(user?.id);
  const { 
    signInWithEmail, 
    signInWithEmailPassword, 
    signUpWithEmailPassword, 
    signOut, 
    isOperationLoading 
  } = useAuthOperations();

  // Consolidate all loading states into one for the context consumers.
  // isSessionLoading covers the initial auth state check.
  // isPartnerLoading covers fetching partner data after user is identified.
  // isOperationLoading covers active auth operations like sign-in/out/up.
  const isLoading = isSessionLoading || isPartnerLoading || isOperationLoading;
  
  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      partner, 
      isLoading, 
      signInWithEmail, 
      signInWithEmailPassword, 
      signUpWithEmailPassword, 
      signOut 
    }}>
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
