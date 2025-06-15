
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalytics = () => {
  const { session } = useAuth();

  const track = async (eventName: string, payload: any) => {
    if (!session) {
      console.error("Analytics tracking requires an authenticated user.");
      return;
    }
    
    try {
      const { error } = await supabase.functions.invoke('track-analytics', {
        body: { eventName, payload },
      });
      if (error) {
        console.error(`Error tracking analytics event ${eventName}:`, error);
      }
    } catch (e) {
      console.error(`Exception while tracking analytics event ${eventName}:`, e);
    }
  };

  return { track };
};

