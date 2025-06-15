
-- Table to log API usage for monitoring and analytics
CREATE TABLE public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.api_usage_logs IS 'Logs individual API requests for usage tracking and performance monitoring.';

-- Table for configuring rate limits based on subscription tiers
CREATE TABLE public.rate_limit_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_tier TEXT NOT NULL UNIQUE,
    max_requests_per_hour INT NOT NULL,
    burst_allowance INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.rate_limit_configs IS 'Defines API rate limit rules for different subscription tiers.';
CREATE TRIGGER on_rate_limit_config_update
BEFORE UPDATE ON public.rate_limit_configs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Table for configuring endpoint-specific optimizations like caching
CREATE TABLE public.optimization_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_pattern TEXT NOT NULL UNIQUE,
    cache_duration_seconds INT NOT NULL DEFAULT 0,
    compression_enabled BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.optimization_rules IS 'Defines optimization settings like caching TTL for specific API endpoints.';
CREATE TRIGGER on_optimization_rule_update
BEFORE UPDATE ON public.optimization_rules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default rate limit configurations for existing pricing tiers
INSERT INTO public.rate_limit_configs (subscription_tier, max_requests_per_hour, burst_allowance)
VALUES
    ('Developer', 1000, 200),
    ('Agency Ready', 10000, 2000),
    ('Team', 50000, 10000);

-- Row Level Security
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners can view their own API usage logs" 
ON public.api_usage_logs FOR SELECT 
USING (partner_id = public.get_my_partner_id());

-- For now, config tables are read-only for authenticated users.
-- We can add admin write policies later.
ALTER TABLE public.rate_limit_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read rate limit configs"
ON public.rate_limit_configs FOR SELECT
USING (auth.role() = 'authenticated');

ALTER TABLE public.optimization_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read optimization rules"
ON public.optimization_rules FOR SELECT
USING (auth.role() = 'authenticated');
