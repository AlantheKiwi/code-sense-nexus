
-- Create ESLint configurations table
CREATE TABLE public.eslint_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '{}',
  partner_id UUID NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  project_type TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.eslint_configurations ENABLE ROW LEVEL SECURITY;

-- Policy to allow partners to view their own configurations
CREATE POLICY "Partners can view their own ESLint configurations" 
  ON public.eslint_configurations 
  FOR SELECT 
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Policy to allow partners to create their own configurations
CREATE POLICY "Partners can create their own ESLint configurations" 
  ON public.eslint_configurations 
  FOR INSERT 
  WITH CHECK (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Policy to allow partners to update their own configurations
CREATE POLICY "Partners can update their own ESLint configurations" 
  ON public.eslint_configurations 
  FOR UPDATE 
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Policy to allow partners to delete their own configurations
CREATE POLICY "Partners can delete their own ESLint configurations" 
  ON public.eslint_configurations 
  FOR DELETE 
  USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()));

-- Create configuration templates table
CREATE TABLE public.eslint_configuration_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert predefined templates
INSERT INTO public.eslint_configuration_templates (name, description, project_type, rules) VALUES
('React Best Practices', 'ESLint configuration optimized for React projects', 'react', '{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "semi": ["error", "always"],
    "eqeqeq": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}'),
('Vue.js Standards', 'ESLint configuration for Vue.js applications', 'vue', '{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended", "plugin:vue/vue3-recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "semi": ["error", "always"],
    "eqeqeq": "warn",
    "vue/multi-word-component-names": "off",
    "vue/no-unused-vars": "warn"
  }
}'),
('Vanilla JavaScript', 'Basic ESLint configuration for vanilla JavaScript projects', 'vanilla', '{
  "extends": ["eslint:recommended"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "semi": ["error", "always"],
    "eqeqeq": "warn",
    "no-undef": "error",
    "no-redeclare": "error"
  }
}'),
('TypeScript Strict', 'Strict TypeScript ESLint configuration', 'typescript', '{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended", "@typescript-eslint/recommended-requiring-type-checking"],
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error",
    "semi": ["error", "always"],
    "eqeqeq": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/strict-boolean-expressions": "warn"
  }
}');

-- Add trigger for updated_at
CREATE TRIGGER handle_eslint_configurations_updated_at
  BEFORE UPDATE ON public.eslint_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
