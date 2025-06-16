
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LighthouseConfiguration, LighthouseSchedule } from './useLighthouseConfigurations';

export function useLighthouseConfigurationActions() {
  const createConfiguration = async (configData: Partial<LighthouseConfiguration>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_configurations')
        .insert({
          name: configData.name,
          settings: configData.settings,
          audit_categories: configData.audit_categories,
          organization_id: configData.organization_id,
          project_id: configData.project_id,
          is_default: configData.is_default || false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Lighthouse configuration created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating Lighthouse configuration:', error);
      toast.error('Failed to create Lighthouse configuration');
      throw error;
    }
  };

  const updateConfiguration = async (id: string, configData: Partial<LighthouseConfiguration>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_configurations')
        .update({
          name: configData.name,
          settings: configData.settings,
          audit_categories: configData.audit_categories,
          is_default: configData.is_default,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Lighthouse configuration updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating Lighthouse configuration:', error);
      toast.error('Failed to update Lighthouse configuration');
      throw error;
    }
  };

  const deleteConfiguration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lighthouse_configurations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Lighthouse configuration deleted successfully');
    } catch (error: any) {
      console.error('Error deleting Lighthouse configuration:', error);
      toast.error('Failed to delete Lighthouse configuration');
      throw error;
    }
  };

  const createSchedule = async (scheduleData: Partial<LighthouseSchedule>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_schedules')
        .insert({
          configuration_id: scheduleData.configuration_id,
          project_id: scheduleData.project_id,
          urls: scheduleData.urls,
          frequency: scheduleData.frequency,
          schedule_time: scheduleData.schedule_time,
          is_active: scheduleData.is_active ?? true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Lighthouse schedule created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating Lighthouse schedule:', error);
      toast.error('Failed to create Lighthouse schedule');
      throw error;
    }
  };

  const updateSchedule = async (id: string, scheduleData: Partial<LighthouseSchedule>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_schedules')
        .update({
          urls: scheduleData.urls,
          frequency: scheduleData.frequency,
          schedule_time: scheduleData.schedule_time,
          is_active: scheduleData.is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Lighthouse schedule updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating Lighthouse schedule:', error);
      toast.error('Failed to update Lighthouse schedule');
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lighthouse_schedules')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Lighthouse schedule deleted successfully');
    } catch (error: any) {
      console.error('Error deleting Lighthouse schedule:', error);
      toast.error('Failed to delete Lighthouse schedule');
      throw error;
    }
  };

  const validateConfiguration = async (settings: LighthouseConfiguration['settings']) => {
    try {
      // Basic validation for required fields
      if (!settings.device || !settings.networkThrottling) {
        throw new Error('Device and network throttling settings are required');
      }

      if (!settings.viewport?.width || !settings.viewport?.height) {
        throw new Error('Viewport dimensions are required');
      }

      if (settings.cpuThrottling < 1 || settings.cpuThrottling > 10) {
        throw new Error('CPU throttling must be between 1 and 10');
      }

      return { valid: true };
    } catch (error: any) {
      console.error('Configuration validation failed:', error);
      toast.error(`Validation failed: ${error.message}`);
      return { valid: false, error: error.message };
    }
  };

  return {
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    validateConfiguration,
  };
}
