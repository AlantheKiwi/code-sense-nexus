
-- Create user_credits table to track user credit balances
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create credit_transactions table to track credit usage history
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive for purchases, negative for usage
  balance INTEGER NOT NULL, -- balance after this transaction
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits" 
  ON public.user_credits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
  ON public.user_credits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.credit_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Function to deduct user credits
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance or create record if it doesn't exist
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - p_amount;
  
  -- Update user credits
  UPDATE public.user_credits 
  SET balance = new_balance, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, balance, description, metadata)
  VALUES (p_user_id, -p_amount, new_balance, p_description, p_metadata);
  
  RETURN TRUE;
END;
$$;

-- Function to add user credits
CREATE OR REPLACE FUNCTION public.add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance or create record if it doesn't exist
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Calculate new balance
  new_balance := current_balance + p_amount;
  
  -- Update user credits
  UPDATE public.user_credits 
  SET balance = new_balance, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, amount, balance, description, metadata)
  VALUES (p_user_id, p_amount, new_balance, p_description, p_metadata);
  
  RETURN TRUE;
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
