
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminAccess = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['admin-access', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Error checking admin access:', error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user
  });
};
