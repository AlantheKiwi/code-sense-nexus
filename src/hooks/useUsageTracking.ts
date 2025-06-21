
import { useState, useEffect } from 'react';
import { UsageData, UserSubscription } from '@/types/billing';
import { usageTracker } from '@/services/billing/UsageTracker';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useUsageTracking() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadUsageData();
    }
  }, [user?.id]);

  const loadUsageData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const [usageData, subscriptionData] = await Promise.all([
        usageTracker.getCurrentUsage(user.id),
        usageTracker.getUserSubscription(user.id)
      ]);

      setUsage(usageData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading usage data:', error);
      toast.error('Failed to load usage information');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsageLimit = async (analysisType: 'basic' | 'ai' = 'basic') => {
    if (!user?.id) return { allowed: false };

    const result = await usageTracker.checkUsageLimit(user.id, analysisType);
    
    if (result.usage) setUsage(result.usage);
    if (result.subscription) setSubscription(result.subscription);

    return result;
  };

  const incrementUsage = async (
    analysisType: 'basic' | 'ai' | 'premium_attempt' = 'basic',
    partnerId?: string
  ) => {
    if (!user?.id) return false;

    const success = await usageTracker.incrementUsage(user.id, analysisType, partnerId);
    
    if (success) {
      // Refresh usage data
      const updatedUsage = await usageTracker.getCurrentUsage(user.id);
      if (updatedUsage) setUsage(updatedUsage);
    }

    return success;
  };

  const trackConversion = async (
    eventType: 'limit_hit' | 'upgrade_prompt_shown' | 'upgrade_clicked' | 'subscription_created',
    data: {
      featureBlocked?: string;
      upgradeTier?: string;
      conversionData?: Record<string, any>;
      partnerId?: string;
    } = {}
  ) => {
    if (!user?.id) return;

    await usageTracker.trackConversionEvent(user.id, eventType, data);
  };

  const refreshSubscription = async () => {
    if (!user?.id) return;

    const subscriptionData = await usageTracker.getUserSubscription(user.id);
    setSubscription(subscriptionData);
  };

  return {
    usage,
    subscription,
    isLoading,
    checkUsageLimit,
    incrementUsage,
    trackConversion,
    refreshSubscription,
    loadUsageData
  };
}
