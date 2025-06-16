
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EslintConfiguration {
  id: string;
  name: string;
  description?: string;
  rules: Record<string, any>;
  project_type?: string;
  is_default: boolean;
  partner_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EslintTemplate {
  id: string;
  name: string;
  description?: string;
  project_type: string;
  rules: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export function useEslintConfigurations() {
  const [configurations, setConfigurations] = useState<EslintConfiguration[]>([]);
  const [templates, setTemplates] = useState<EslintTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConfigurations = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error('No active session');
        return;
      }

      const response = await supabase.functions.invoke('eslint-config-management', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setConfigurations(response.data.configurations || []);
    } catch (error: any) {
      console.error('Error fetching ESLint configurations:', error);
      toast.error('Failed to fetch ESLint configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await supabase.functions.invoke('eslint-config-management', {
        method: 'GET',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTemplates(response.data.templates || []);
    } catch (error: any) {
      console.error('Error fetching ESLint templates:', error);
      toast.error('Failed to fetch ESLint templates');
    }
  };

  useEffect(() => {
    fetchConfigurations();
    fetchTemplates();
  }, []);

  return {
    configurations,
    templates,
    isLoading,
    refreshConfigurations: fetchConfigurations,
    refreshTemplates: fetchTemplates,
  };
}
