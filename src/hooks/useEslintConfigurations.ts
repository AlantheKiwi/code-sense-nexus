
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

  const createConfiguration = async (configData: Partial<EslintConfiguration>) => {
    try {
      const response = await supabase.functions.invoke('eslint-config-management', {
        method: 'POST',
        body: { ...configData, action: 'create' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await fetchConfigurations();
      toast.success('ESLint configuration created successfully');
      return response.data.configuration;
    } catch (error: any) {
      console.error('Error creating ESLint configuration:', error);
      toast.error('Failed to create ESLint configuration');
      throw error;
    }
  };

  const updateConfiguration = async (id: string, configData: Partial<EslintConfiguration>) => {
    try {
      const response = await supabase.functions.invoke('eslint-config-management', {
        method: 'POST',
        body: { ...configData, id, action: 'update' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await fetchConfigurations();
      toast.success('ESLint configuration updated successfully');
      return response.data.configuration;
    } catch (error: any) {
      console.error('Error updating ESLint configuration:', error);
      toast.error('Failed to update ESLint configuration');
      throw error;
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const response = await supabase.functions.invoke('eslint-config-management', {
        method: 'DELETE',
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await fetchConfigurations();
      toast.success('ESLint configuration deleted successfully');
    } catch (error: any) {
      console.error('Error deleting ESLint configuration:', error);
      toast.error('Failed to delete ESLint configuration');
      throw error;
    }
  };

  const validateConfiguration = async (rules: Record<string, any>) => {
    try {
      const response = await supabase.functions.invoke('eslint-config-management', {
        method: 'POST',
        body: { rules, action: 'validate' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error validating ESLint configuration:', error);
      toast.error('Failed to validate ESLint configuration');
      throw error;
    }
  };

  const exportConfiguration = async (id: string) => {
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

      // Create and download file
      const blob = new Blob([JSON.stringify(response.data.export, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eslint-config-${id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('ESLint configuration exported successfully');
      return response.data.export;
    } catch (error: any) {
      console.error('Error exporting ESLint configuration:', error);
      toast.error('Failed to export ESLint configuration');
      throw error;
    }
  };

  const importConfiguration = async (configFile: File) => {
    try {
      const text = await configFile.text();
      const config = JSON.parse(text);

      const response = await supabase.functions.invoke('eslint-config-management', {
        method: 'POST',
        body: { config, action: 'import' },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await fetchConfigurations();
      toast.success('ESLint configuration imported successfully');
      return response.data.configuration;
    } catch (error: any) {
      console.error('Error importing ESLint configuration:', error);
      toast.error('Failed to import ESLint configuration');
      throw error;
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
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    validateConfiguration,
    exportConfiguration,
    importConfiguration,
    refreshConfigurations: fetchConfigurations,
    refreshTemplates: fetchTemplates,
  };
}
