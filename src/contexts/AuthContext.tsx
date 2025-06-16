
import React, { createContext, useContext, useEffect } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
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
  signInWithProvider: (provider: Provider) => Promise<void>;
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
    signInWithProvider,
    signOut, 
    isOperationLoading 
  } = useAuthOperations();

  const isLoading = isSessionLoading || isPartnerLoading || isOperationLoading;

  useEffect(() => {
    console.log('AuthContext Debug Info:', {
      isLoading,
      isSessionLoading,
      isPartnerLoading,
      isOperationLoading,
      hasUser: !!user,
      userId: user?.id,
      hasPartner: !!partner,
      partnerId: partner?.id,
      partnerData: partner
    });
  }, [isLoading, isSessionLoading, isPartnerLoading, isOperationLoading, user, partner]);

  // Debug log when partner data changes
  useEffect(() => {
    if (user?.id) {
      console.log('AuthContext: User ID available:', user.id);
      if (partner) {
        console.log('AuthContext: Partner data loaded successfully:', {
          partnerId: partner.id,
          partnerUserId: partner.user_id,
          companyName: partner.company_name
        });
      } else if (!isPartnerLoading) {
        console.warn('AuthContext: No partner data found for user:', user.id);
      }
    }
  }, [user, partner, isPartnerLoading]);
  
  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      partner, 
      isLoading, 
      signInWithEmail, 
      signInWithEmailPassword, 
      signUpWithEmailPassword, 
      signInWithProvider,
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
