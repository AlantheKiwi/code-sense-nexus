
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Tables } from '@/integrations/supabase/types';

type Partner = Tables<'partners'>;

export function usePartnerData(userId: string | undefined) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPartner(null);
      setIsPartnerLoading(false);
      return;
    }

    const fetchPartnerData = async () => {
      setIsPartnerLoading(true);
      console.log("usePartnerData: Fetching partner data for user ID:", userId);
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') { 
          console.error('usePartnerData: Error fetching partner data:', error);
          toast.error("Error fetching partner data: " + error.message);
          setPartner(null);
        } else if (data) {
          console.log("usePartnerData: Partner data fetched:", data);
          setPartner(data);
        } else {
          console.log("usePartnerData: No partner record found for user.");
          setPartner(null);
        }
      } catch (e: any) {
        console.error("usePartnerData: Exception during fetchPartnerData:", e.message);
        toast.error("Failed to retrieve partner details.");
        setPartner(null);
      } finally {
        setIsPartnerLoading(false);
      }
    };

    fetchPartnerData();
  }, [userId]);

  return { partner, isPartnerLoading };
}
