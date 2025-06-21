
export interface SubscriptionTier {
  id: 'free' | 'premium' | 'enterprise';
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  limits: {
    dailyAnalyses: number;
    aiAnalyses: number;
    teamMembers: number;
    projects: number;
  };
  popular?: boolean;
}

export interface UsageData {
  id: string;
  user_id: string;
  partner_id?: string;
  usage_date: string;
  analysis_count: number;
  ai_analysis_count: number;
  premium_feature_attempts: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  partner_id?: string;
  tier: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversionEvent {
  id: string;
  user_id: string;
  partner_id?: string;
  event_type: 'limit_hit' | 'upgrade_prompt_shown' | 'upgrade_clicked' | 'subscription_created';
  feature_blocked?: string;
  upgrade_tier?: string;
  conversion_data: Record<string, any>;
  created_at: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      '3 basic analyses per day',
      'Standard debugging tools',
      'Community support',
      'Basic issue detection'
    ],
    limits: {
      dailyAnalyses: 3,
      aiAnalyses: 0,
      teamMembers: 1,
      projects: 3
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29,
    period: 'month',
    features: [
      'Unlimited analyses',
      'AI-powered code review',
      'Advanced debugging tools',
      'Lovable prompt optimization',
      'Priority support',
      'Advanced insights'
    ],
    limits: {
      dailyAnalyses: -1, // unlimited
      aiAnalyses: -1, // unlimited
      teamMembers: 5,
      projects: 25
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    period: 'month',
    features: [
      'Everything in Premium',
      'Unlimited team members',
      'White-label dashboard',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Advanced analytics'
    ],
    limits: {
      dailyAnalyses: -1, // unlimited
      aiAnalyses: -1, // unlimited
      teamMembers: -1, // unlimited
      projects: -1 // unlimited
    }
  }
];
