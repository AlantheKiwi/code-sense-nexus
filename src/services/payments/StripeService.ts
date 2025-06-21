
import { supabase } from '@/integrations/supabase/client';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string;
  popular?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 9.99,
    priceId: 'price_codesense_starter_credits',
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 500,
    price: 39.99,
    priceId: 'price_codesense_pro_credits',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 2000,
    price: 149.99,
    priceId: 'price_codesense_enterprise_credits',
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    priceId: 'price_codesense_pro_monthly',
    features: [
      '10 Lovable projects',
      'Unlimited analyses',
      'All debugging features',
      'Priority support',
      'Custom branding'
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: 49,
    priceId: 'price_codesense_team_monthly',
    features: [
      'Unlimited projects',
      'Team collaboration features',
      'Advanced analytics',
      'White-label reports',
      'API access'
    ],
    popular: true,
  },
];

export class StripeService {
  private static getSubsidiaryMetadata() {
    return {
      subsidiary: 'codesense',
      parent_company: 'insight_ai_systems',
      product_line: 'ai_development_tools',
      brand: 'CodeSense',
      company_name: 'Insight AI Systems Ltd',
    };
  }

  static async createCreditPackageCheckout(
    packageId: string,
    userId: string,
    userEmail: string
  ) {
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    if (!creditPackage) {
      throw new Error('Invalid credit package');
    }

    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: {
        priceId: creditPackage.priceId,
        mode: 'payment',
        userId,
        userEmail,
        metadata: {
          ...this.getSubsidiaryMetadata(),
          package_type: 'credit_package',
          package_id: packageId,
          credits_amount: creditPackage.credits,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  static async createSubscriptionCheckout(
    planId: string,
    userId: string,
    userEmail: string
  ) {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceId: plan.priceId,
        planName: plan.name,
        metadata: {
          ...this.getSubsidiaryMetadata(),
          subscription_plan: planId,
          plan_name: plan.name,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  static async createEnterpriseConsultation(
    userId: string,
    userEmail: string,
    companyName: string,
    requirements: string
  ) {
    const { data, error } = await supabase.functions.invoke('create-enterprise-lead', {
      body: {
        userId,
        userEmail,
        companyName,
        requirements,
        metadata: {
          ...this.getSubsidiaryMetadata(),
          lead_type: 'enterprise_consultation',
          source: 'pricing_page',
        },
      },
    });

    if (error) throw error;
    return data;
  }

  static async getPaymentHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return [];
    }
  }

  static async getSubsidiaryRevenue(startDate: string, endDate: string) {
    const { data, error } = await supabase.functions.invoke('get-subsidiary-revenue', {
      body: {
        subsidiary: 'codesense',
        startDate,
        endDate,
      },
    });

    if (error) throw error;
    return data;
  }
}
