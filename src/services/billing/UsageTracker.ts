import { supabase } from '@/integrations/supabase/client';
import { UsageData, UserSubscription, ConversionEvent, SUBSCRIPTION_TIERS } from '@/types/billing';
import { toast } from 'sonner';

export class UsageTracker {
  
  async getCurrentUsage(userId: string): Promise<UsageData | null> {
    try {
      const { data, error } = await supabase
        .from('user_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('usage_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error) {
        console.error('Error fetching usage:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getCurrentUsage:', error);
      return null;
    }
  }

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      // Cast the tier to the proper type since database returns generic string
      if (data) {
        return {
          ...data,
          tier: data.tier as 'free' | 'premium' | 'enterprise',
          status: data.status as 'active' | 'cancelled' | 'expired'
        };
      }

      return null;
    } catch (error) {
      console.error('Exception in getUserSubscription:', error);
      return null;
    }
  }

  async getUserCredits(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user credits:', error);
        return 0;
      }

      return data?.balance || 0;
    } catch (error) {
      console.error('Exception in getUserCredits:', error);
      return 0;
    }
  }

  async incrementUsage(
    userId: string, 
    analysisType: 'basic' | 'ai' | 'premium_attempt' = 'basic',
    partnerId?: string
  ): Promise<boolean> {
    try {
      // Check if user has credits before incrementing usage
      const credits = await this.getUserCredits(userId);
      const creditCost = this.getAnalysisCreditCost(analysisType);
      
      if (credits >= creditCost) {
        // Deduct credits first
        const { data: deductSuccess, error: deductError } = await supabase.rpc('deduct_user_credits', {
          p_user_id: userId,
          p_amount: creditCost,
          p_description: `${analysisType} analysis`,
          p_metadata: { analysis_type: analysisType }
        });

        if (deductError || !deductSuccess) {
          console.error('Error deducting credits:', deductError);
          return false;
        }

        // Then increment usage counter
        const { data, error } = await supabase.rpc('increment_usage_counter', {
          p_user_id: userId,
          p_analysis_type: analysisType,
          p_partner_id: partnerId
        });

        if (error) {
          console.error('Error incrementing usage:', error);
          // Try to refund credits if usage increment fails
          await supabase.rpc('add_user_credits', {
            p_user_id: userId,
            p_amount: creditCost,
            p_description: `Refund for failed ${analysisType} analysis`,
            p_metadata: { refund: true, analysis_type: analysisType }
          });
          return false;
        }

        return data;
      } else {
        // Fall back to regular usage tracking if no credits
        const { data, error } = await supabase.rpc('increment_usage_counter', {
          p_user_id: userId,
          p_analysis_type: analysisType,
          p_partner_id: partnerId
        });

        if (error) {
          console.error('Error incrementing usage:', error);
          return false;
        }

        return data;
      }
    } catch (error) {
      console.error('Exception in incrementUsage:', error);
      return false;
    }
  }

  private getAnalysisCreditCost(analysisType: 'basic' | 'ai' | 'premium_attempt'): number {
    switch (analysisType) {
      case 'ai': return 10;
      case 'premium_attempt': return 5;
      case 'basic': return 1;
      default: return 1;
    }
  }

  async trackConversionEvent(
    userId: string,
    eventType: ConversionEvent['event_type'],
    data: {
      featureBlocked?: string;
      upgradeTier?: string;
      conversionData?: Record<string, any>;
      partnerId?: string;
    } = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversion_tracking')
        .insert({
          user_id: userId,
          partner_id: data.partnerId,
          event_type: eventType,
          feature_blocked: data.featureBlocked,
          upgrade_tier: data.upgradeTier,
          conversion_data: data.conversionData || {}
        });

      if (error) {
        console.error('Error tracking conversion event:', error);
      }
    } catch (error) {
      console.error('Exception in trackConversionEvent:', error);
    }
  }

  async checkUsageLimit(
    userId: string, 
    analysisType: 'basic' | 'ai' = 'basic'
  ): Promise<{ allowed: boolean; usage?: UsageData; subscription?: UserSubscription; credits?: number; reason?: string }> {
    try {
      const [usage, subscription, credits] = await Promise.all([
        this.getCurrentUsage(userId),
        this.getUserSubscription(userId),
        this.getUserCredits(userId)
      ]);

      const userTier = subscription?.tier || 'free';
      const tierConfig = SUBSCRIPTION_TIERS.find(t => t.id === userTier);
      
      if (!tierConfig) {
        return { allowed: false, reason: 'Invalid subscription tier' };
      }

      // Premium and Enterprise have unlimited usage
      if (userTier === 'premium' || userTier === 'enterprise') {
        return { 
          allowed: true, 
          usage: usage || undefined, 
          subscription: subscription || undefined,
          credits 
        };
      }

      // Check if user has credits for this analysis
      const creditCost = this.getAnalysisCreditCost(analysisType);
      if (credits >= creditCost) {
        return { 
          allowed: true, 
          usage: usage || undefined, 
          subscription: subscription || undefined,
          credits,
          reason: 'Credits available' 
        };
      }

      // Check limits for free tier
      const currentUsage = usage || {
        analysis_count: 0,
        ai_analysis_count: 0,
        premium_feature_attempts: 0
      } as UsageData;

      if (analysisType === 'ai') {
        // Free tier doesn't allow AI analyses without credits
        return { 
          allowed: false, 
          usage: currentUsage, 
          subscription: subscription || undefined,
          credits,
          reason: 'AI analysis requires credits or premium subscription'
        };
      }

      // Check daily analysis limit
      const dailyLimit = tierConfig.limits.dailyAnalyses;
      if (dailyLimit > 0 && currentUsage.analysis_count >= dailyLimit) {
        return { 
          allowed: false, 
          usage: currentUsage, 
          subscription: subscription || undefined,
          credits,
          reason: 'Daily limit reached'
        };
      }

      return { 
        allowed: true, 
        usage: currentUsage, 
        subscription: subscription || undefined,
        credits 
      };
    } catch (error) {
      console.error('Exception in checkUsageLimit:', error);
      return { allowed: false, reason: 'System error' };
    }
  }

  async getUsageStats(userId: string, days: number = 7): Promise<UsageData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('usage_date', startDate.toISOString().split('T')[0])
        .lte('usage_date', endDate.toISOString().split('T')[0])
        .order('usage_date', { ascending: true });

      if (error) {
        console.error('Error fetching usage stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getUsageStats:', error);
      return [];
    }
  }

  async createOrUpdateSubscription(
    userId: string,
    tier: 'free' | 'premium' | 'enterprise',
    stripeSubscriptionId?: string,
    partnerId?: string
  ): Promise<UserSubscription | null> {
    try {
      const subscriptionData = {
        user_id: userId,
        partner_id: partnerId,
        tier,
        status: 'active' as const,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert(subscriptionData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating subscription:', error);
        return null;
      }

      // Cast the result to proper types
      const result: UserSubscription = {
        ...data,
        tier: data.tier as 'free' | 'premium' | 'enterprise',
        status: data.status as 'active' | 'cancelled' | 'expired'
      };

      // Track conversion event if upgrading
      if (tier !== 'free') {
        await this.trackConversionEvent(userId, 'subscription_created', {
          upgradeTier: tier,
          conversionData: { stripe_subscription_id: stripeSubscriptionId },
          partnerId
        });
      }

      return result;
    } catch (error) {
      console.error('Exception in createOrUpdateSubscription:', error);
      return null;
    }
  }
}

export const usageTracker = new UsageTracker();
