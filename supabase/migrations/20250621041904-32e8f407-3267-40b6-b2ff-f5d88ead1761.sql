
-- Create user_usage_tracking table to track daily analysis usage
CREATE TABLE public.user_usage_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  partner_id uuid REFERENCES public.partners(id),
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  analysis_count integer NOT NULL DEFAULT 0,
  ai_analysis_count integer NOT NULL DEFAULT 0,
  premium_feature_attempts integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

-- Create user_subscriptions table to track subscription status
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  partner_id uuid REFERENCES public.partners(id),
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  stripe_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create conversion_tracking table for upgrade analytics
CREATE TABLE public.conversion_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  partner_id uuid REFERENCES public.partners(id),
  event_type text NOT NULL CHECK (event_type IN ('limit_hit', 'upgrade_prompt_shown', 'upgrade_clicked', 'subscription_created')),
  feature_blocked text,
  upgrade_tier text,
  conversion_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for user_usage_tracking
ALTER TABLE public.user_usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" 
  ON public.user_usage_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
  ON public.user_usage_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
  ON public.user_usage_tracking 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" 
  ON public.user_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for conversion_tracking
ALTER TABLE public.conversion_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversions" 
  ON public.conversion_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversions" 
  ON public.conversion_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to get or create daily usage record
CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id uuid, p_partner_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    usage_id uuid;
BEGIN
    -- Try to get existing record for today
    SELECT id INTO usage_id
    FROM public.user_usage_tracking
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    
    -- If no record exists, create one
    IF usage_id IS NULL THEN
        INSERT INTO public.user_usage_tracking (user_id, partner_id, usage_date)
        VALUES (p_user_id, p_partner_id, CURRENT_DATE)
        RETURNING id INTO usage_id;
    END IF;
    
    RETURN usage_id;
END;
$$;

-- Create function to increment usage counters
CREATE OR REPLACE FUNCTION increment_usage_counter(
    p_user_id uuid,
    p_analysis_type text DEFAULT 'basic',
    p_partner_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    usage_id uuid;
BEGIN
    -- Get or create daily usage record
    usage_id := get_or_create_daily_usage(p_user_id, p_partner_id);
    
    -- Increment the appropriate counter
    IF p_analysis_type = 'ai' THEN
        UPDATE public.user_usage_tracking
        SET ai_analysis_count = ai_analysis_count + 1,
            updated_at = now()
        WHERE id = usage_id;
    ELSIF p_analysis_type = 'premium_attempt' THEN
        UPDATE public.user_usage_tracking
        SET premium_feature_attempts = premium_feature_attempts + 1,
            updated_at = now()
        WHERE id = usage_id;
    ELSE
        UPDATE public.user_usage_tracking
        SET analysis_count = analysis_count + 1,
            updated_at = now()
        WHERE id = usage_id;
    END IF;
    
    RETURN true;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON public.user_usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
