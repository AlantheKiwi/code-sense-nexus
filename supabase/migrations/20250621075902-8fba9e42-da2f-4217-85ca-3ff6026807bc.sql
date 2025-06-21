
-- Admin activity logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pricing configuration
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL, -- 'credit_package', 'llm_analysis', 'subscription'
  item_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  credits_included INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Legal documents
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL, -- 'terms', 'privacy', 'refund'
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- System settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin tables
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin tables (only super admins can access)
CREATE POLICY "Super admins can access admin logs"
ON admin_logs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can access pricing config"
ON pricing_config FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can access legal documents"
ON legal_documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Super admins can access system settings"
ON system_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default pricing configuration
INSERT INTO pricing_config (item_type, item_name, price_cents, credits_included) VALUES
('credit_package', 'Starter Pack', 999, 100),
('credit_package', 'Professional Pack', 2999, 350),
('credit_package', 'Enterprise Pack', 9999, 1200),
('llm_analysis', 'GPT-4 Analysis', 0, 5),
('llm_analysis', 'Claude Analysis', 0, 4),
('llm_analysis', 'Basic Analysis', 0, 1),
('subscription', 'Pro Monthly', 2999, 300),
('subscription', 'Pro Annual', 29999, 3600);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_analyses_per_hour', '50', 'Rate limit for analyses per user per hour'),
('feature_flags', '{"ai_analysis": true, "premium_features": true}', 'Feature toggles'),
('system_message', '""', 'Global system message to display to users');

-- Insert default legal documents
INSERT INTO legal_documents (document_type, content, version) VALUES
('terms', 'Terms of Service content here...', 1),
('privacy', 'Privacy Policy content here...', 1),
('refund', 'Refund Policy content here...', 1);
