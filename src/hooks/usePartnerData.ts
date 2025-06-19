
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
      console.log("usePartnerData: No userId provided");
      setPartner(null);
      setIsPartnerLoading(false);
      return;
    }

    const fetchPartnerData = async () => {
      setIsPartnerLoading(true);
      console.log("usePartnerData: Fetching partner data for user ID:", userId);
      
      try {
        // Use maybeSingle() to handle cases where no partner exists or multiple partners exist
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        console.log("usePartnerData: Supabase query result:", { data, error });

        if (error) {
          console.error('usePartnerData: Error fetching partner data:', error);
          
          // Handle specific error cases
          if (error.code === 'PGRST116') {
            console.warn("usePartnerData: No partner record found for user:", userId);
            toast.error("No partner account found. Please contact support if this is unexpected.");
          } else if (error.message.includes('multiple rows')) {
            console.error("usePartnerData: Multiple partner records found for user:", userId);
            toast.error("Multiple partner accounts found. Please contact support to resolve this issue.");
            
            // Try to get the first partner record as a fallback
            try {
              const { data: fallbackData, error: fallbackError } = await supabase
                .from('partners')
                .select('*')
                .eq('user_id', userId)
                .limit(1)
                .single();
                
              if (!fallbackError && fallbackData) {
                console.log("usePartnerData: Using first partner record as fallback:", fallbackData);
                setPartner(fallbackData);
                toast.info("Using first partner account found. Please contact support to resolve duplicates.");
                return;
              }
            } catch (fallbackErr) {
              console.error("usePartnerData: Fallback query also failed:", fallbackErr);
            }
          } else {
            toast.error("Error fetching partner data: " + error.message);
          }
          setPartner(null);
        } else if (data) {
          console.log("usePartnerData: Partner data fetched successfully:", data);
          setPartner(data);
        } else {
          console.log("usePartnerData: No partner record found for user (no data returned).");
          toast.error("No partner account found. Please contact support.");
          setPartner(null);
        }
      } catch (e: any) {
        console.error("usePartnerData: Exception during fetchPartnerData:", e);
        toast.error("Failed to retrieve partner details: " + e.message);
        setPartner(null);
      } finally {
        setIsPartnerLoading(false);
        console.log("usePartnerData: Finished fetching partner data");
      }
    };

    fetchPartnerData();
  }, [userId]);

  return { partner, isPartnerLoading };
}
