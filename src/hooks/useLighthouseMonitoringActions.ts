
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LighthouseMonitoringConfig } from './useLighthouseMonitoring';

export function useLighthouseMonitoringActions() {
  const createMonitoringConfig = async (configData: Partial<LighthouseMonitoringConfig>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_monitoring_configs')
        .insert({
          project_id: configData.project_id,
          configuration_id: configData.configuration_id,
          urls: configData.urls,
          schedule_interval: configData.schedule_interval,
          schedule_time: configData.schedule_time,
          is_active: configData.is_active ?? true,
          performance_thresholds: configData.performance_thresholds,
          alert_channels: configData.alert_channels,
          avoid_peak_hours: configData.avoid_peak_hours,
          peak_hours_start: configData.peak_hours_start,
          peak_hours_end: configData.peak_hours_end,
          max_audits_per_day: configData.max_audits_per_day,
          retry_failed_audits: configData.retry_failed_audits,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Monitoring configuration created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating monitoring config:', error);
      toast.error('Failed to create monitoring configuration');
      throw error;
    }
  };

  const updateMonitoringConfig = async (id: string, configData: Partial<LighthouseMonitoringConfig>) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_monitoring_configs')
        .update({
          urls: configData.urls,
          schedule_interval: configData.schedule_interval,
          schedule_time: configData.schedule_time,
          is_active: configData.is_active,
          performance_thresholds: configData.performance_thresholds,
          alert_channels: configData.alert_channels,
          avoid_peak_hours: configData.avoid_peak_hours,
          peak_hours_start: configData.peak_hours_start,
          peak_hours_end: configData.peak_hours_end,
          max_audits_per_day: configData.max_audits_per_day,
          retry_failed_audits: configData.retry_failed_audits,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Monitoring configuration updated successfully');
      return data;
    } catch (error: any) {
      console.error('Error updating monitoring config:', error);
      toast.error('Failed to update monitoring configuration');
      throw error;
    }
  };

  const deleteMonitoringConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lighthouse_monitoring_configs')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Monitoring configuration deleted successfully');
    } catch (error: any) {
      console.error('Error deleting monitoring config:', error);
      toast.error('Failed to delete monitoring configuration');
      throw error;
    }
  };

  const triggerManualRun = async (configId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('lighthouse-autonomous-monitor', {
        body: {
          action: 'trigger_manual_run',
          configId,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Manual monitoring run triggered successfully');
      return data;
    } catch (error: any) {
      console.error('Error triggering manual run:', error);
      toast.error('Failed to trigger manual run');
      throw error;
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_threshold_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Alert acknowledged successfully');
      return data;
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
      throw error;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_threshold_alerts')
        .update({
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Alert resolved successfully');
      return data;
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
      throw error;
    }
  };

  const createDeploymentHook = async (hookData: {
    project_id: string;
    monitoring_config_id: string;
    deployment_stage: 'pre_deployment' | 'post_deployment' | 'both';
    webhook_url?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('lighthouse_deployment_hooks')
        .insert(hookData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Deployment hook created successfully');
      return data;
    } catch (error: any) {
      console.error('Error creating deployment hook:', error);
      toast.error('Failed to create deployment hook');
      throw error;
    }
  };

  return {
    createMonitoringConfig,
    updateMonitoringConfig,
    deleteMonitoringConfig,
    triggerManualRun,
    acknowledgeAlert,
    resolveAlert,
    createDeploymentHook,
  };
}
