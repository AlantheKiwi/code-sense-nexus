
-- Create payment_transactions table to track Stripe payments
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  stripe_session_completed_at TIMESTAMP WITH TIME ZONE
);

-- Create subsidiary_revenue table to track revenue by subsidiary
CREATE TABLE public.subsidiary_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subsidiary TEXT NOT NULL,
  parent_company TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}',
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscribers table to track subscription status
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidiary_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.payment_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS policies for subscribers  
CREATE POLICY "Users can view their own subscription" 
  ON public.subscribers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.subscribers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for subsidiary_revenue (admin only)
CREATE POLICY "Admin can view subsidiary revenue" 
  ON public.subsidiary_revenue 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Add updated_at trigger for subscribers
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
