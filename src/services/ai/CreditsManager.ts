
import { supabase } from '@/integrations/supabase/client';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number; // in cents
  discount: number; // percentage
  popular?: boolean;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number; // positive for purchases, negative for usage
  balance: number;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 999, // $9.99
    discount: 0
  },
  {
    id: 'professional',
    name: 'Professional',
    credits: 200,
    price: 2999, // $29.99
    discount: 25,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 500,
    price: 5999, // $59.99
    discount: 40
  },
  {
    id: 'unlimited',
    name: 'Unlimited Monthly',
    credits: -1, // unlimited
    price: 9999, // $99.99
    discount: 0
  }
];

export class CreditsManager {
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

  async deductCredits(
    userId: string, 
    amount: number, 
    description: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('deduct_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description,
        p_metadata: metadata || {}
      });

      if (error) {
        console.error('Error deducting credits:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Exception in deductCredits:', error);
      return false;
    }
  }

  async addCredits(
    userId: string, 
    amount: number, 
    description: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description,
        p_metadata: metadata || {}
      });

      if (error) {
        console.error('Error adding credits:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Exception in addCredits:', error);
      return false;
    }
  }

  async getCreditHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching credit history:', error);
        return [];
      }

      return data?.map(row => ({
        id: row.id,
        user_id: row.user_id,
        amount: row.amount,
        balance: row.balance,
        description: row.description,
        metadata: row.metadata,
        created_at: row.created_at
      })) || [];
    } catch (error) {
      console.error('Exception in getCreditHistory:', error);
      return [];
    }
  }

  calculatePackageValue(packageInfo: CreditPackage): {
    basePrice: number;
    discountAmount: number;
    finalPrice: number;
    pricePerCredit: number;
  } {
    const basePrice = packageInfo.price;
    const discountAmount = Math.round(basePrice * packageInfo.discount / 100);
    const finalPrice = basePrice - discountAmount;
    const pricePerCredit = packageInfo.credits > 0 ? finalPrice / packageInfo.credits : 0;

    return {
      basePrice,
      discountAmount,
      finalPrice,
      pricePerCredit
    };
  }
}

export const creditsManager = new CreditsManager();
